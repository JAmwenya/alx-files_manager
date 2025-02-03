// // controllers/UsersController.js

// import crypto from 'crypto';
// import dbClient from '../utils/db';

// class UsersController {
//   // POST /users: Create a new user
//   static async postNew(req, res) {
//     try {
//       const { email, password } = req.body;

//       // Check if email and password are provided
//       if (!email) {
//         return res.status(400).json({ error: 'Missing email' });
//       }
//       if (!password) {
//         return res.status(400).json({ error: 'Missing password' });
//       }

//       // Ensure the database connection is established
//       if (!dbClient.db) {
//         await dbClient.connect();
//       }

//       // Check if the email already exists in the database
//       const existingUser = await dbClient.db
//         .collection('users')
//         .findOne({ email });
//       if (existingUser) {
//         return res.status(400).json({ error: 'Already exist' });
//       }

//       // Hash the password using SHA1
//       const hashedPassword = crypto
//         .createHash('sha1')
//         .update(password)
//         .digest('hex');

//       // Insert the new user into the 'users' collection
//       const result = await dbClient.db.collection('users').insertOne({
//         email,
//         password: hashedPassword,
//       });

//       // Return the newly created user with only the email and id
//       return res.status(201).json({
//         id: result.insertedId,
//         email,
//       }); // Ensure no further execution after this point
//     } catch (error) {
//       console.error('Error creating user:', error);
//       return res.status(500).json({ error: 'Internal Server Error' });
//     }
//   }
// }

// export default UsersController;
import sha1 from 'sha1';
import Queue from 'bull/lib/queue';
import { dbClient } from '../utils/db';

const userQueue = new Queue('email sending');

export default class UsersController {
  static async postNew(req, res) {
    const email = req.body ? req.body.email : null;
    const password = req.body ? req.body.password : null;

    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }
    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }
    const user = await (await dbClient.usersCollection()).findOne({ email });

    if (user) {
      res.status(400).json({ error: 'Already exist' });
      return;
    }
    const insertionInfo = await (await dbClient.usersCollection())
      .insertOne({ email, password: sha1(password) });
    const userId = insertionInfo.insertedId.toString();

    userQueue.add({ userId });
    res.status(201).json({ email, id: userId });
  }

  static async getMe(req, res) {
    const { user } = req;

    res.status(200).json({ email: user.email, id: user._id.toString() });
  }
}