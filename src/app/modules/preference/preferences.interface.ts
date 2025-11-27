import { Model } from 'mongoose';

export type IPreference = {
  name: string;
  description?: string;
  active?: boolean;
};

export type PreferenceModel = Model<IPreference>;

