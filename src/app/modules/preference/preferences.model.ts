import { model, Schema } from 'mongoose';
import { IPreference, PreferenceModel } from './preferences.interface';

const preferencesSchema = new Schema<IPreference,PreferenceModel>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

export const Preference = model<IPreference, PreferenceModel>('Preference',preferencesSchema);