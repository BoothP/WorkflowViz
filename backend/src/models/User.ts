import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

// Define the base user document interface
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  oauthProviders: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Define the user model interface with static methods
interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
}

// Define the schema
const userSchema = new Schema<IUser, IUserModel>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
    },
    oauthProviders: [
      {
        type: String,
        enum: ['google', 'github'],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method to check if email exists
userSchema.statics.findByEmail = async function (email: string): Promise<IUser | null> {
  return this.findOne({ email });
};

// Create and export the model
export const User = mongoose.model<IUser, IUserModel>('User', userSchema);
