import { Module } from '@nestjs/common';
import { MediaModule } from './media/media.module';
import configuration, { type EnvConfig } from './config/env';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MemoryStoredFile, NestjsFormDataModule } from 'nestjs-form-data';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    MediaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? null : '.env.development',
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvConfig>) => ({
        uri: config.getOrThrow('MONGO_CONNECITON_URL'),
        authSource: 'admin',
      }),
    }),
    NestjsFormDataModule.config({
      isGlobal: true,
      storage: MemoryStoredFile
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvConfig>) => ({
        url: config.getOrThrow('REDIS_CONNECTION_URL'),
        redis: {
          name: 'gecko-worker'
        }
      })
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
