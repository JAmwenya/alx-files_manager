// controllers/FilesController.js

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb'; // Import ObjectId from mongodb
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
  // POST /files: Upload file and store in DB and disk
  static async postUpload(req, res) {
    const {
      name, type, data, parentId, isPublic,
    } = req.body;
    const token = req.headers['x-token'];

    // Check for valid token
    if (!token || !(await redisClient.get(`auth_${token}`))) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check for missing required fields
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing or invalid type' });
    }
    if ((type === 'file' || type === 'image') && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Retrieve the user ID from Redis
    const userId = await redisClient.get(`auth_${token}`);

    // Validate the parent folder if parentId is provided
    let parent = null;
    if (parentId) {
      parent = await dbClient.db
        .collection('files')
        .findOne({ _id: new ObjectId(parentId), userId });
      if (!parent) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parent.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    // Handle file storage for non-folder types
    let filePath = '';
    if (type !== 'folder') {
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      const fileName = uuidv4();
      const fileBuffer = Buffer.from(data, 'base64');
      filePath = path.join(folderPath, fileName);
      fs.writeFileSync(filePath, fileBuffer);
    }

    try {
      // Insert the new file record into the database
      const file = await dbClient.db.collection('files').insertOne({
        userId,
        name,
        type,
        parentId: parentId || 0, // Ensure that root folders have parentId of 0
        isPublic: isPublic || false,
        localPath: filePath,
      });

      // Return the newly created file record
      return res.status(201).json(file.ops[0]);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // GET /files/:id: Retrieve file information by ID
  static async getShow(req, res) {
    const token = req.headers['x-token'];

    // Check for valid token
    if (!token || !(await redisClient.get(`auth_${token}`))) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const fileId = new ObjectId(req.params.id);
      const userId = await redisClient.get(`auth_${token}`);
      const file = await dbClient.db
        .collection('files')
        .findOne({ _id: fileId, userId });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      return res.status(200).json(file);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default FilesController;
