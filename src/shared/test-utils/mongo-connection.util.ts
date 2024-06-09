import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | null = null;
export async function mongooseTestModule(options: MongooseModuleOptions = {}) {
  return MongooseModule.forRootAsync({
    useFactory: async () => {
      mongod ??= await MongoMemoryServer.create();
      return {
        uri: mongod.getUri(),
        ...options,
      };
    },
  });
}
export async function closeMongooseTestModule() {
  console.log('Closing mongo memory connection');
  if (!mongod) return;
  await mongod.stop();
}
