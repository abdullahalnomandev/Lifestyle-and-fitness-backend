import { Model } from 'mongoose';

export type IGymAndFitnessPlan = {
  title: string;
  description: string;
  image: string;
};

export type GymAndFitnessPlanModel = Model<IGymAndFitnessPlan>;
