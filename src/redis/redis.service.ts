import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Redis as RedisClient } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private publisher: RedisClient;
  private subscriber: RedisClient;

  private handlers = new Map<string, (data: any) => void>();
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST');
    const port = this.configService.get<number>('REDIS_PORT');
    const username = this.configService.get<string>('REDIS_USERNAME');
    const password = this.configService.get<string>('REDIS_PASSWORD');

    this.publisher = new Redis({
      host,
      port,
      username,
      password,
    });
    this.subscriber = new Redis({ host, port, username, password });

    this.subscriber.on('message', (channel, message) => {
      const handler = this.handlers.get(channel);
      if (handler) {
        handler(JSON.parse(message));
      }
    });
  }

  onModuleDestroy() {
    this.publisher.disconnect();
    this.subscriber.disconnect();
  }

  async publish(channel: string, data: any) {
    await this.publisher.publish(channel, JSON.stringify(data));
  }

  async subscribe(channel: string, handler: (data: any) => void) {
    this.handlers.set(channel, handler);
    await this.subscriber.subscribe(channel);
  }

  async unsubscribe(channel: string) {
    this.handlers.delete(channel);
    await this.subscriber.unsubscribe(channel);
  }
}
