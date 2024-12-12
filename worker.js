// worker.js

import fs from 'fs';
import { Worker, Queue } from 'bull';
import imageThumbnail from 'image-thumbnail';
import { ObjectId } from 'mongodb'; // Import ObjectId from mongodb
import dbClient from './utils/db';

const fileQueue = new Queue('fileQueue', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
});

// Define the worker to process image thumbnail generation
const worker = new Worker('fileQueue', async (job) => {
  const { userId, fileId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  // Fetch file details from DB
  const file = await dbClient.db
    .collection('files')
    .findOne({ _id: new ObjectId(fileId), userId });

  if (!file) {
    throw new Error('File not found');
  }

  if (file.type !== 'image') {
    throw new Error('The file is not an image');
  }

  const filePath = file.localPath;

  // Check if the file exists locally
  if (!fs.existsSync(filePath)) {
    throw new Error('Local file not found');
  }

  const thumbnailSizes = [500, 250, 100];

  // Generate thumbnails for the image at the specified sizes concurrently
  const thumbnailPromises = thumbnailSizes.map(async (size) => {
    const thumbnailPath = `${filePath}_${size}`;
    const options = { width: size, height: size };

    try {
      const thumbnail = await imageThumbnail(filePath, options);
      fs.writeFileSync(thumbnailPath, thumbnail);
      console.log(`Thumbnail created: ${thumbnailPath}`);
    } catch (error) {
      throw new Error(`Error generating thumbnail: ${error.message}`);
    }
  });

  // Wait for all thumbnail generation tasks to finish
  await Promise.all(thumbnailPromises);

  return { success: true, fileId, userId };
});

worker.on('completed', (job, result) => {
  console.log(`Job completed: ${job.id}, Result:`, result);
});

worker.on('failed', (job, err) => {
  console.error(`Job failed: ${job.id}, Error:`, err);
});

// To add a new job to the queue
async function addJob(userId, fileId) {
  await fileQueue.add({ userId, fileId });
}

export { addJob, worker };
