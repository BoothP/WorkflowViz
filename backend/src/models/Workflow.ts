import mongoose, { Document, Schema, Model } from 'mongoose';
import { IUser } from './User.js'; // Assuming IUser is exported from User model
import { Node, Edge } from '../interfaces/workflow.js'; // Re-using existing interfaces

// Interface for the Workflow document
export interface IWorkflow extends Document {
  name: string;
  nodes: Node[]; // Array of Node objects as defined in interfaces
  edges: Edge[]; // Array of Edge objects as defined in interfaces
  ownerId: IUser['_id']; // Reference to User's ObjectId
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema for Workflow
const WorkflowSchema = new Schema<IWorkflow>(
  {
    name: {
      type: String,
      required: [true, 'Workflow name is required'],
      trim: true,
    },
    nodes: {
      type: [Object], // Using generic Object for flexibility, validation can be at app level or with Zod if needed here
      required: true,
      default: [],
    },
    edges: {
      type: [Object], // Using generic Object for flexibility
      required: true,
      default: [],
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create and export the Workflow model
export const Workflow: Model<IWorkflow> = mongoose.model<IWorkflow>('Workflow', WorkflowSchema);
