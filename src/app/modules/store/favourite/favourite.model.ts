import { Schema, model } from 'mongoose';
import { IFavourite, FavouriteModel } from './favourite.interface';

const FavouriteSchema = new Schema<IFavourite, FavouriteModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    handle: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

FavouriteSchema.index({ user: 1, handle: 1 }, { unique: true });

export const Favourite = model<IFavourite, FavouriteModel>(
  'Favourite',
  FavouriteSchema
  
);

