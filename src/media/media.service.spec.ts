import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from './media.service';
import {
  closeMongooseTestModule,
  mongooseTestModule,
} from 'src/shared/test-utils/mongo-connection.util';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaEntity, MediaSchema } from './media.entity';
import { NestjsFormDataModule, MemoryStoredFile } from 'nestjs-form-data';
import { getQueueToken } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { mediaQueueJobs, mediaQueueName } from './media.utils';
import { Types } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import * as fs from 'fs/promises';
import { Queue } from 'bull';
import { MediaQueueResizeJob } from './media.dto';

jest.mock('nanoid', () => ({
  nanoid: jest.fn().mockReturnValue('nanoid'),
}));
jest.mock('fs/promises');

describe('MediaService', () => {
  let service: MediaService;
  let mediaQueue: Queue<MediaQueueResizeJob>;

  beforeEach(async () => {
    const mongoModule = await mongooseTestModule();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        mongoModule,
        MongooseModule.forFeature([
          { name: MediaEntity.name, schema: MediaSchema },
        ]),
        ConfigModule,
        NestjsFormDataModule.config({
          isGlobal: true,
          storage: MemoryStoredFile,
        }),
      ],
      providers: [
        MediaService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              switch (key) {
                case 'STORAGE_PATH':
                  return '/uploads';
                default:
                  throw new Error(`Config key ${key} not found`);
              }
            }),
          },
        },
        {
          provide: getQueueToken(mediaQueueName),
          useValue: {
            add: jest.fn(),
            getJobs: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
    mediaQueue = module.get<Queue>(getQueueToken(mediaQueueName));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await closeMongooseTestModule();
  });

  describe('upload', () => {
    it('should save and return the uploaded media entity', async () => {
      const file = {
        originalName: 'test.jpg',
        size: 1234,
        buffer: Buffer.from(''),
      };
      const savedFile = await service.upload({ file } as any);

      expect(savedFile.name).toEqual('test.jpg');
      expect(fs.writeFile).toHaveBeenCalledWith(
        '/uploads/nanoid.jpg',
        file.buffer,
      );
    });
  });

  describe('list', () => {
    it('should return a list of media entities', async () => {
      const list = await service.list({ skip: 0, limit: 10 });

      expect(list.length).toBeGreaterThan(0);
      expect(list.at(0).name).toBe('test.jpg');
    });
    it('should return a list with no elements in it', async () => {
      const list = await service.list({ skip: 10, limit: 1 });

      expect(list.length).toBe(0);
    });
  });

  describe('get', () => {
    it('should throw NotFoundException if not found', async () => {
      const id = new Types.ObjectId();
      await expect(service.get(id.toString())).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('countDocuments', () => {
    it('should return the count of documents', async () => {
      expect(await service.countDocuments()).toBe(1);
    });
  });

  describe('resize', () => {
    it('should add a resize job to the queue', async () => {
      const [media] = await service.list({ skip: 0, limit: 1 });
      (mediaQueue.add as jest.Mock).mockResolvedValue({ id: '1' });

      const jobId = await service.resize(media._id.toString(), {
        width: 150,
        height: 150,
      });

      expect(jobId).toBe('1');
      expect(mediaQueue.add).toHaveBeenCalledWith(mediaQueueJobs.resize, {
        media,
        size: { width: 150, height: 150 },
      });
    });
  });

  describe('delete', () => {
    it('should delete the media entity and file', async () => {
      const [media] = await service.list({ skip: 0, limit: 1 });
      (fs.unlink as jest.Mock).mockResolvedValue(Promise.resolve());

      await service.delete(media._id.toString());

      expect(fs.unlink).toHaveBeenCalledWith('/uploads/nanoid.jpg');
      await expect(service.get(media._id.toString())).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('queuedJobs', () => {
    it('should return a list of queued jobs', async () => {
      const jobs = [
        { id: '2', name: 'job2' },
        { id: '1', name: 'job1' },
      ];
      mediaQueue.getJobs = jest.fn().mockResolvedValue(jobs);

      expect(await service.queuedJobs({ status: [] })).toEqual([
        { id: '2', name: 'job2' },
        { id: '1', name: 'job1' },
      ]);
    });
  });
});
