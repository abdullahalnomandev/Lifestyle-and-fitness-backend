import { model, Schema } from 'mongoose';
import { CREATOR_TYPE, POST_TYPE } from './post.constant';
import { IPOST, IPostModel } from './post.interface';

const postSchema = new Schema<IPOST, IPostModel>(
  {
    description: {
      type: String,
    },
    image: {
      type: String,
      trim: true,
    },
    media: {
      type: String,
      trim: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    creator_type: {
      type: String,
      enum: Object.values(CREATOR_TYPE),
      required: true,
    },
    club: {
      type: Schema.Types.ObjectId,
      ref: 'Club',
    },
    tag_user: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    features_skills: {
      type: [String],
      default: [],
    },
    post_type: {
      type: String,
      enum: Object.values(POST_TYPE),
      required: true,
    },
  },
  { timestamps: true }
);

postSchema.index({ creator_type: 1, creator: 1, post_type: 1 });

postSchema.statics.findByCreator = async function (creatorId: string) {
  return this.find({ creator: creatorId });
};

export const Post = model<IPOST, IPostModel>('Post', postSchema);
