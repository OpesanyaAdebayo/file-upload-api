import { Request, Response } from 'express';
import mongoose from 'mongoose';
import joi from '@hapi/joi';
import { Folder, IFolder, File } from '../models/fileSystem';
import { logger } from '../util/logger';

export const createFolder = async (req: Request, res: Response): Promise<Response> => {
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

    let folderQuery: IFolder | null;

    if (level === 'root') {
      folderQuery = await Folder.findOne({
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
      folderQuery = await Folder.findOne({
        name,
        level,
        parent: mongoose.Types.ObjectId(parent),
      });
    }
    if (folderQuery) {
      return res.status(400).json({
        success: false,
        error: 'A folder with this name already exists in this directory',
      });
    }
    const folder = new Folder({});
    folder.name = name;
    folder.level = level;
    folder.parent = parent ? mongoose.Types.ObjectId(parent) : null;

    await folder.save();

    return res.json({
      success: true,
      message: 'Folder successfully created.',
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json({
      success: false,
      message: 'Folder creation failed. Please try again later.',
    });
  }
};

export const getFolders = async (req: Request, res: Response): Promise<Response> => {
  try {
    const schema = joi.object().keys({
      level: joi
        .string()
        .optional()
        .valid('root', 'child')
        .error(new Error('level can only be root or child')),
    });

    const validation = schema.validate(req.query);

    if (validation.error) {
      return res.status(400).json({
        success: false,
        error: validation.error.message,
      });
    }

    let folders;

    const { level } = req.query;

    if (!level) {
      folders = await Folder.find({});
    } else {
      folders = await Folder.find({ level });
    }

    return res.json({
      success: true,
      data: {
        folders,
      },
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json({
      success: false,
      message: 'Could not fetch folders. Please try again later.',
    });
  }
};

export const deleteFolder = async (req: Request, res: Response): Promise<Response> => {
  try {
    const schema = joi.object().keys({
      folderID: joi
        .string()
        .required()
        .error(new Error('folderID is required')),
    });

    const validation = schema.validate(req.params);

    if (validation.error) {
      return res.status(400).json({
        success: false,
        error: validation.error.message,
      });
    }
    const { folderID } = req.params;

    const findFolder = await Folder.findOne({
      _id: mongoose.Types.ObjectId(folderID),
    });

    if (!findFolder) {
      return res.status(404).json({
        success: false,
        error: 'Could not find folder.',
      });
    }
    await Promise.all([
      File.remove({ parent: mongoose.Types.ObjectId(folderID) }),
      Folder.remove({ parent: mongoose.Types.ObjectId(folderID) }),
    ]);

    return res.json({
      success: true,
      message: 'Folder successfully deleted'
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json({
      success: false,
      message: 'Could not fetch folder contents. Please try again later.',
    });
  }
};

export const getFolder = async (req: Request, res: Response): Promise<Response> => {
  try {
    const schema = joi.object().keys({
      folderID: joi
        .string()
        .required()
        .error(new Error('folderID is required')),
    });

    const validation = schema.validate(req.params);

    if (validation.error) {
      return res.status(400).json({
        success: false,
        error: validation.error.message,
      });
    }
    const { folderID } = req.params;

    const findFolder = await Folder.findOne({
      _id: mongoose.Types.ObjectId(folderID),
    });

    if (!findFolder) {
      return res.status(404).json({
        success: false,
        error: 'Could not find folder.',
      });
    }
    const [files, folders] = await Promise.all([
      File.find({ parent: mongoose.Types.ObjectId(folderID) }),
      Folder.find({ parent: mongoose.Types.ObjectId(folderID) }),
    ]);

    return res.json({
      success: true,
      data: {
        files,
        folders,
      },
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json({
      success: false,
      message: 'Could not fetch folder contents. Please try again later.',
    });
  }
};


export const editFolderName = async (req: Request, res: Response): Promise<Response> => {
  try {
    const schema = joi.object().keys({
      folderID: joi
        .string()
        .required()
        .error(new Error('folderID is required')),
      name: joi
      .string()
      .required()
      .error(new Error('name is required')),
    });

    const validation = schema.validate({ ...req.params, ...req.query });

    if (validation.error) {
      return res.status(400).json({
        success: false,
        error: validation.error.message,
      });
    }
    const { folderID } = req.params;
    const { name } = req.body;

    const findFolder = await Folder.findOne({
      _id: mongoose.Types.ObjectId(folderID),
    });

    if (!findFolder) {
      return res.status(404).json({
        success: false,
        error: 'Could not find folder.',
      });
    }

    await Folder.findOneAndUpdate({ _id: mongoose.Types.ObjectId(folderID) }, { name });

    return res.json({
      success: true,
      message: 'Folder updated successfully'
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json({
      success: false,
      message: 'Could not edit folder name. Please try again later.',
    });
  }
};

