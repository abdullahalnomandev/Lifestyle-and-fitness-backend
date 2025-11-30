import { Model } from 'mongoose';

export type IBusinessAndMindsetPlan = {
  title: string;
  description: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type BusinessAndMindsetPlanModel = Model<IBusinessAndMindsetPlan>;
