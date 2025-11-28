import { model, Schema } from 'mongoose';
import { ISave, SaveModel } from './save.interface';

const saveSchema = new Schema<ISave, SaveModel>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

saveSchema.index({ post: 1, user: 1 }, { unique: true });

export const Save = model<ISave, SaveModel>('Save', saveSchema);

