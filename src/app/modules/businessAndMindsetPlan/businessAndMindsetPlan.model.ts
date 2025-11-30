import { model, Schema } from 'mongoose';
import { IBusinessAndMindsetPlan, BusinessAndMindsetPlanModel } from './businessAndMindsetPlan.interface';

const businessAndMindsetPlanSchema = new Schema<IBusinessAndMindsetPlan, BusinessAndMindsetPlanModel>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);

export const BusinessAndMindsetPlan = model<IBusinessAndMindsetPlan, BusinessAndMindsetPlanModel>(
  'BusinessAndMindsetPlan',
  businessAndMindsetPlanSchema
);
