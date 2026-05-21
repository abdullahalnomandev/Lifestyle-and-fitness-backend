import { model, Schema } from 'mongoose';
import { IStory, IStoryModel } from './story.interface';

const storySchema = new Schema<IStory, IStoryModel>(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    caption: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    media: {
      type: String,
      trim: true,
    },
    text_x: {
      type: Number,
      default: 0,
    },
    text_y: {
      type: Number,
      default: 0,
    },
    text_scale: {
      type: Number,
      default: 1,
    },
    text_rotation: {
      type: Number,
      default: 0,
    },
    text_color: {
      type: String,
      default: '#000000',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Story = model<IStory, IStoryModel>('Story', storySchema);

