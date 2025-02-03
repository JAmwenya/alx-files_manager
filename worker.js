// // worker.js

// import fs from 'fs';
// import { Worker, Queue } from 'bull';
// import imageThumbnail from 'image-thumbnail';
// import { ObjectId } from 'mongodb'; // Import ObjectId from mongodb
// import dbClient from './utils/db';

// const fileQueue = new Queue('fileQueue', {
//   redis: {
//     host: process.env.REDIS_HOST || 'localhost',
//     port: process.env.REDIS_PORT || 6379,
//   },
// });

// // Define the worker to process image thumbnail generation
// const worker = new Worker('fileQueue', async (job) => {
//   const { userId, fileId } = job.data;

//   if (!fileId) {
//     throw new Error('Missing fileId');
//   }

//   if (!userId) {
//     throw new Error('Missing userId');
//   }

//   // Fetch file details from DB
//   const file = await dbClient.db
//     .collection('files')
//     .findOne({ _id: new ObjectId(fileId), userId });

//   if (!file) {
//     throw new Error('File not found');
//   }

//   if (file.type !== 'image') {
//     throw new Error('The file is not an image');
//   }

//   const filePath = file.localPath;

//   // Check if the file exists locally
//   if (!fs.existsSync(filePath)) {
//     throw new Error('Local file not found');
//   }

//   const thumbnailSizes = [500, 250, 100];

//   // Generate thumbnails for the image at the specified sizes concurrently
//   const thumbnailPromises = thumbnailSizes.map(async (size) => {
//     const thumbnailPath = `${filePath}_${size}`;
//     const options = { width: size, height: size };

//     try {
//       const thumbnail = await imageThumbnail(filePath, options);
//       fs.writeFileSync(thumbnailPath, thumbnail);
//       console.log(`Thumbnail created: ${thumbnailPath}`);
//     } catch (error) {
//       throw new Error(`Error generating thumbnail: ${error.message}`);
//     }
//   });

//   // Wait for all thumbnail generation tasks to finish
//   await Promise.all(thumbnailPromises);

//   return { success: true, fileId, userId };
// });

// worker.on('completed', (job, result) => {
//   console.log(`Job completed: ${job.id}, Result:`, result);
// });

// worker.on('failed', (job, err) => {
//   console.error(`Job failed: ${job.id}, Error:`, err);
// });

// // To add a new job to the queue
// async function addJob(userId, fileId) {
//   await fileQueue.add({ userId, fileId });
// }

// export { addJob, worker };
import { writeFile } from 'fs';
import { promisify } from 'util';
import Queue from 'bull/lib/queue';
import imgThumbnail from 'image-thumbnail';
import mongoDBCore from 'mongodb/lib/core';
import { dbClient } from './utils/db';
import Mailer from './utils/welcomeMail';

const writeFileAsync = promisify(writeFile);
const fileQueue = new Queue('thumbnail generation');
const userQueue = new Queue('email sending');

/**
 * Generates the thumbnail of an image with a given width size.
 * @param {String} filePath The location of the original file.
 * @param {number} size The width of the thumbnail.
 * @returns {Promise<void>}
 */
const generateThumbnail = async (filePath, size) => {
  const buffer = await imgThumbnail(filePath, { width: size });
  console.log(`Generating file: ${filePath}, size: ${size}`);
  return writeFileAsync(`${filePath}_${size}`, buffer);
};

fileQueue.process(async (job, done) => {
  const fileId = job.data.fileId || null;
  const userId = job.data.userId || null;

  if (!fileId) {
    throw new Error('Missing fileId');
  }
  if (!userId) {
    throw new Error('Missing userId');
  }
  console.log('Processing', job.data.name || '');
  const file = await (await dbClient.filesCollection())
    .findOne({
      _id: new mongoDBCore.BSON.ObjectId(fileId),
      userId: new mongoDBCore.BSON.ObjectId(userId),
    });
  if (!file) {
    throw new Error('File not found');
  }
  const sizes = [500, 250, 100];
  Promise.all(sizes.map((size) => generateThumbnail(file.localPath, size)))
    .then(() => {
      done();
    });
});

userQueue.process(async (job, done) => {
  const userId = job.data.userId || null;

  if (!userId) {
    throw new Error('Missing userId');
  }
  const user = await (await dbClient.usersCollection())
    .findOne({ _id: new mongoDBCore.BSON.ObjectId(userId) });
  if (!user) {
    throw new Error('User not found');
  }
  console.log(`Welcome ${user.email}!`);

  try {
    const mailSubject = 'Welcome to ALX file_manager by Fiona Githaiga';
    const mailContent = ['Read throught the readme to understand the project'].join('');
    Mailer.sendMail(Mailer.buildMessage(user.email, mailSubject, mailContent));
    done();
  } catch (err) {
    done(err);
  }
});