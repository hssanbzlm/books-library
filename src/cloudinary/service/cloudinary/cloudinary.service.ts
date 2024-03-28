import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  uploadFile(file: Express.Multer.File) {
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = 'data:' + file.mimetype + ';base64,' + b64;
    return cloudinary.uploader.upload(dataURI, {
      resource_type: 'image',
      folder: 'book-store',
    });
  }

  removeFile(imgUrl: string) {
    const imageId = imgUrl.slice(
      imgUrl.indexOf('book-store'),
      imgUrl.lastIndexOf('.'),
    );
    return cloudinary.uploader.destroy(imageId);
  }
}
