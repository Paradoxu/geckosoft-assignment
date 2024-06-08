import { Module } from '@nestjs/common';
import { MediaModule } from './media/media.module';
import configuration, { type EnvConfig } from './config/env';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MediaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvConfig>) => ({
        uri: config.getOrThrow('MONGO_CONNECITON_URL'),
        authSource: 'admin',
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
