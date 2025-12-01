import { Schema, model } from 'mongoose';
import {
  GymAndFitnessPlanModel,
  IGymAndFitnessPlan,
} from './GymAndFitnessPlan.interface';

const GymAndFitnessPlanSchema = new Schema<
  IGymAndFitnessPlan,
  GymAndFitnessPlanModel
>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true
  }
);

export const GymAndFitnessPlan = model<
  IGymAndFitnessPlan,
  GymAndFitnessPlanModel
>('GymAndFitnessPlan', GymAndFitnessPlanSchema);
