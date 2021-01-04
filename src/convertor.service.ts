import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';
import * as fs from 'fs';
const upoladingPath = './files';

@Injectable()
export class ConvertorService {
  private client: ClientProxy;
  private configService: ConfigService;
  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: '127.0.0.1',
        port: 8877,
      },
    });
  }
  // This function split the image name to get extension
  public getExtension(imgName) {
    const seperatedStringArr = imgName.split('.'); // Split image name
    return seperatedStringArr[seperatedStringArr.length - 1];
  }
  public convert(imageName, requestedExtension) {
    const file = fs.readFileSync(upoladingPath + '/' + imageName);
    const data = {
      image: file,
      requestedImageType: requestedExtension,
    };
    return this.client.send('convert', data);
  }
}
