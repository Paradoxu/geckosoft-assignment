import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, Types } from 'mongoose';

/**
 * Schema definition for the media entity.
 */
@Schema({
  collection: 'media',
  timestamps: true,
  collation: { locale: 'it', caseFirst: 'off', strength: 1 },
})
export class MediaEntity {
  @ApiProperty({ type: String, readOnly: true })
  _id: Types.ObjectId;

  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({ type: Number, minimum: 0, required: true })
  @Prop({ type: Number, min: 0, required: true })
  filesize: number;

  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  path: string;
}

/**
 * Type definition for a media document.
 */
export type MediaDocument = HydratedDocument<MediaEntity>;

/**
 * Mongoose schema for the media entity.
 */
export const MediaSchema = SchemaFactory.createForClass(MediaEntity);
