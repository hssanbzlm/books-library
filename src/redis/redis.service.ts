import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis, { Redis as RedisClient } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private publisher: RedisClient;
  private subscriber: RedisClient;

  private handlers = new Map<string, (data: any) => void>();

  onModuleInit() {
    this.publisher = new Redis();
    this.subscriber = new Redis();

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
