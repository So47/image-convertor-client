import {
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConvertorService } from './convertor.service';
import { editFileName, imageFileFilter } from './utils/file-upload.utils';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { HttpException, HttpStatus } from '@nestjs/common';

const upoladingPath = './files';
@Controller()
export class AppController {
  // Create a logger instance
  private logger = new Logger('AppController');
  // Inject the convertor service
  constructor(private convertorService: ConvertorService) {}
  // Map the 'POST /upload' route to this method
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: upoladingPath,
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  // Define the logic to be executed
  uploadImage(@UploadedFile() file) {
    if (file) {
      const imgID = file.filename.split('.').slice(0, -1).join('.');
      return imgID;
    } else {
      throw new HttpException(
        'You have to insert a file!',
        HttpStatus.FORBIDDEN,
      );
    }
  }
  // Request image by id
  @Get(':imgID')
  retrieveUploadedImage(@Param('imgID') image, @Res() res) {
    const files = fs.readdirSync(upoladingPath); // Getting files names in uploading path directory
    const imgExtension = this.convertorService.getExtension(image);
    image = image.split('.').slice(0, -1).join('.');
    const foundImage = files.find(
      (file) => file.split('.').slice(0, -1).join('.') === image,
    );
    if (foundImage) {
      this.logger.log('Checking image extension ...');
      const foundImageExtension = this.convertorService.getExtension(
        foundImage,
      );
      if (foundImageExtension === imgExtension) {
        this.logger.log('Requested image type is the same as the stored one');
        return res.sendFile(foundImage, { root: upoladingPath });
      } else {
        if (
          imgExtension === 'heic' ||
          imgExtension === 'heif' ||
          imgExtension === 'avif' ||
          imgExtension === 'jpeg' ||
          imgExtension === 'jpg' ||
          imgExtension === 'png' ||
          imgExtension === 'raw' ||
          imgExtension === 'tiff' ||
          imgExtension === 'webp'
          // imgExtension === 'gif'
        ) {
          //Allowed formats are heic, heif, avif, jpeg, jpg, png, raw, tiff, webp, gif
          this.logger.log('Converting ' + foundImage + ' to ' + imgExtension); // Log conversion init
          // use convertor service to convert image & return
          this.convertorService
            .convert(foundImage, imgExtension)
            .subscribe((x) => {
              const buffer = new Buffer(x, 'base64');
              // No need for this step if you are gonna send it as a buffer or binary
              fs.writeFileSync(
                upoladingPath + '/' + image + '.' + imgExtension,
                buffer,
                'base64',
              );
              res.sendFile(image + '.' + imgExtension, { root: upoladingPath });
            });
        } else {
          throw new HttpException(
            'Allowed formats are heic, heif, avif, jpeg, jpg, png, raw, tiff, webp, gif',
            HttpStatus.FORBIDDEN,
          );
        }
      }
    } else {
      throw new HttpException("This image isn't existed", HttpStatus.NOT_FOUND);
    }
  }
}
