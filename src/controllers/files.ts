import { Request, Response } from 'express';
import mongoose from 'mongoose';
import joi from '@hapi/joi';
import { File, IFile, Folder } from '../models/fileSystem';
import { logger } from '../util/logger';

export const createFile = async (req: Request, res: Response): Promise<Response> => {
  const { name, level = 'root', parent } = req.body;

  const schema = joi.object().keys({
    name: joi
      .string()
      .required()
      .error(new Error('Resource name is required.')),
    level: joi
      .string()
      .optional()
      .valid('root', 'child')
      .error(new Error('level can only be root or child')),
    parent: joi.string().optional(),
  });

  const validation = schema.validate(req.body);

  if (validation.error) {
    return res.status(400).json({
      success: false,
      error: validation.error.message,
    });
  }
  try {
    if (level !== 'root' && !parent) {
      return res.status(400).json({
        success: false,
        error: 'Parent ID must be provided',
      });
    }

    let fileQuery: IFile | null;

    if (level === 'root') {
      fileQuery = await File.findOne({
        name,
        level,
      });
    } else {
      const checkForParent = await Folder.findOne({ _id: mongoose.Types.ObjectId(parent) });
      if (!checkForParent) {
        return res.status(400).json({
          success: false,
          error: 'Invalid parent ID provided.',
        });
      }
      fileQuery = await File.findOne({
        name,
        level,
        parent: mongoose.Types.ObjectId(parent),
      });
    }
    if (fileQuery) {
      return res.status(400).json({
        success: false,
        error: 'A file with this name already exists in this directory',
      });
    }
    const file = new File({});
    file.name = name;
    file.level = level;
    file.parent = parent ? mongoose.Types.ObjectId(parent) : null;

    await file.save();

    return res.json({
      success: true,
      message: 'File successfully created.',
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json({
      success: false,
      message: 'File creation failed. Please try again later.',
    });
  }
};

export const getFiles = async (_: Request, res: Response): Promise<Response> => {
  try {
    const files = await File.find({});
    return res.json({
      success: true,
      data: {
        files,
      },
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json({
      success: false,
      message: 'Could not fetch files. Please try again later.',
    });
  }
};

export const deleteFile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const schema = joi.object().keys({
      fileID: joi
        .string()
        .required()
        .error(new Error('fileID is required')),
    });

    const validation = schema.validate(req.params);

    if (validation.error) {
      return res.status(400).json({
        success: false,
        error: validation.error.message,
      });
    }
    const { fileID } = req.params;

    const findFile = await File.findOne({
      _id: mongoose.Types.ObjectId(fileID),
    });

    if (!findFile) {
      return res.status(404).json({
        success: false,
        error: 'Could not find file.',
      });
    }

    await File.remove({ _id: mongoose.Types.ObjectId(fileID) });

    return res.json({
      success: true,
      message: 'File successfully deleted'
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json({
      success: false,
      message: 'Could not delete file. Please try again later.',
    });
  }
};
export const editFileName = async (req: Request, res: Response): Promise<Response> => {
  try {
    const schema = joi.object().keys({
      fileID: joi
        .string()
        .required()
        .error(new Error('fileID is required')),
      name: joi
      .string()
      .required()
      .error(new Error('name is required')),
    });

    const validation = schema.validate({ ...req.params, ...req.body });

    if (validation.error) {
      return res.status(400).json({
        success: false,
        error: validation.error.message,
      });
    }
    const { fileID } = req.params;
    const { name } = req.body;

    const findFile = await File.findOne({
      _id: mongoose.Types.ObjectId(fileID),
    });

    if (!findFile) {
      return res.status(404).json({
        success: false,
        error: 'Could not find file.',
      });
    }

    await File.findOneAndUpdate({ _id: mongoose.Types.ObjectId(fileID) }, { name });

    return res.json({
      success: true,
      message: 'File successfully edited'
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json({
      success: false,
      message: 'Could not edit file. Please try again later.',
    });
  }
};
