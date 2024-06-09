import { Module } from '@nestjs/common';
import { MediaModule } from './media/media.module';
import { configSchema, getConfig, type EnvConfig } from './config/env';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MemoryStoredFile, NestjsFormDataModule } from 'nestjs-form-data';
import { BullModule } from '@nestjs/bull';
import { toMs } from 'ms-typescript';

@Module({
  imports: [
    MediaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV !== 'production' ? '.env.development' : undefined,
      load: [getConfig],
      validate: (config) => configSchema.parse(config),
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService<EnvConfig>) => {
        await ConfigModule.envVariablesLoaded;
        return {
          uri: config.getOrThrow('MONGO_CONNECITON_URL'),
          authSource: 'admin',
        };
      },
    }),
    NestjsFormDataModule.config({
      isGlobal: true,
      storage: MemoryStoredFile,
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService<EnvConfig>) => {
        await ConfigModule.envVariablesLoaded;

        return {
          url: config.getOrThrow('REDIS_CONNECTION_URL'),
          defaultJobOptions: {
            attempts: 5,
            removeOnComplete: config.getOrThrow(
              'WORKER_MAX_COMPLETE_JOBS_ON_QUEUE',
            ),
            removeOnFail: config.getOrThrow('WORKER_MAX_FAILED_JOBS_ON_QUEUE'),
            timeout: config.getOrThrow('WORKER_TIMEOUT'),
            backoffStrategy: (attemptsMade: number) =>
              attemptsMade * toMs('30s'),
          },
          redis: {
            name: 'gecko-worker',
          },
        };
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
