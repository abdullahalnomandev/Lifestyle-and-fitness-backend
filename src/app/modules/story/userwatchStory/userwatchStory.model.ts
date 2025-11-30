import { model, Schema, Types, Document, Model } from 'mongoose';


export interface IStoryWatch extends Document {
  story: Types.ObjectId;           // Reference to the Story
  user: Types.ObjectId;            // Owner/creator of the story
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StoryWatchModel extends Model<IStoryWatch> {}

const userWatchStorySchema = new Schema<IStoryWatch, StoryWatchModel>(
  {
    story: { type: Schema.Types.ObjectId, ref: 'Story', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const UserWatchStory = model<IStoryWatch, StoryWatchModel>('UserWatchStory', userWatchStorySchema);
