/* eslint-disable prettier/prettier */
import { extname } from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';
// Allow only images
export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|jfif)$/)) {
    return callback(
      new HttpException('Only images are allowed!', HttpStatus.BAD_REQUEST),
      false,
    );
  }
  callback(null, true);
};
// Change file name to have unique identifier for the uploaded image

export const editFileName = (req, file, callback) => {
 const fileExtension = extname(file.originalname);
  const name = file.originalname.replace(fileExtension,'') ;
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 10).toString(10))
    .join('');
  callback(null, `${name}${randomName}${fileExtension}`);
};
