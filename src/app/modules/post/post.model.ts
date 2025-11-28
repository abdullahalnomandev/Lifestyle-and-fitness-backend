import { model, Schema } from 'mongoose';
import { IPOST, IPostModel } from './post.interface';

const postSchema = new Schema<IPOST, IPostModel>(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    caption: {
      type: String,
      trim: true,
    },
    type:{
      type:String,
    },
    image: [
      {
        type: String,
        trim: true,
      },
    ],
    media: [
      {
        type: String,
        trim: true,
      },
    ],
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

export const Post = model<IPOST, IPostModel>('Post', postSchema);
