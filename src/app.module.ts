import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConvertorService } from './convertor.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [ConvertorService],
})
export class AppModule {}
