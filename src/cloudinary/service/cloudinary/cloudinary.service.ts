import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { FileUpload } from 'graphql-upload';

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

  async uploadStreamFile(file: any) {
    const { createReadStream, filename} = file.file;
    const stream = createReadStream();

    return new Promise((resolve, reject) => {
      const cloudinaryStream = cloudinary.uploader.upload_stream(
        { resource_type: 'image', folder: 'book-store', public_id: filename },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      stream.pipe(cloudinaryStream);
    });
  }

  removeFile(imgUrl: string) {
    const imageId = imgUrl.slice(
      imgUrl.indexOf('book-store'),
      imgUrl.lastIndexOf('.'),
    );
    return cloudinary.uploader.destroy(imageId, { invalidate: true });
  }
}
