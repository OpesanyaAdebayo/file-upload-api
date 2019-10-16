import mongoose from 'mongoose';
import { db } from '../config/db';

export interface IFile extends mongoose.Document {
  name: string;
  level: string;
  parent: mongoose.Types.ObjectId | null;
}

export interface IFolder extends mongoose.Document {
  name: string;
  level: string;
  parent: mongoose.Types.ObjectId | null;
}


export const FileSchema = new mongoose.Schema(
  {
    name: { type: String },
    level: { type: String, default: 'root', enum: ['root', 'child'] },
    parent: { type: mongoose.Types.ObjectId },
  },
  { timestamps: true },
);

export const FolderSchema = new mongoose.Schema(
  {
    name: { type: String },
    level: { type: String, default: 'root', enum: ['root', 'child'] },
    parent: { type: mongoose.Types.ObjectId },
  },
  { timestamps: true },
);

export const File = db.model<IFile>('File', FileSchema);
export const Folder = db.model<IFolder>('Folder', FolderSchema);
