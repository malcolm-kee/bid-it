import { Document } from 'mongoose';

export type UserData = {
  name: string;
  email: string;
};

export interface User extends Document, UserData {}

export const USER_SCHEMA_NAME = 'User';
