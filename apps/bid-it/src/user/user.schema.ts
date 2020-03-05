import * as mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { User } from './user.type';

export const UserSchema = new mongoose.Schema<User>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

UserSchema.plugin(uniqueValidator);
