import { Inject, Module } from '@nestjs/common';
import { CloudinaryService } from './service/cloudinary/cloudinary.service';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    CloudinaryService,
    {
      provide: 'CLOUDINARY',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return cloudinary.config({
          cloud_name: config.get<string>('CLOUDINARY_NAME'),
          api_key: config.get<string>('CLOUDINARY_API_KEY'),
          api_secret: config.get<string>('CLOUDINARY_API_SECRET'),
        });
      },
    },
  ],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
