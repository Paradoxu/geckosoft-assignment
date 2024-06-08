import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, Types } from 'mongoose';

@Schema({
  collection: 'media',
  timestamps: true,
  collation: { locale: 'it', caseFirst: 'off', strength: 1 },
})
export class MediaEntity {
  @ApiProperty({ type: String, readOnly: true })
  _id: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, min: 0, required: true })
  filesize: number;

  @Prop({ type: String, required: true })
  path: string;
}

export type MediaDocument = HydratedDocument<MediaEntity>;
export const MediaSchema = SchemaFactory.createForClass(MediaEntity);
