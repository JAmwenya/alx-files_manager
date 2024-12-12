// controllers/UsersController.js

import crypto from 'crypto';
import dbClient from '../utils/db';

class UsersController {
  // POST /users: Create a new user
  static async postNew(req, res) {
    try {
      const { email, password } = req.body;

      // Check if email and password are provided
      if (!email) {
        return res.status(400).json({ error: 'Missing email' });
      }
      if (!password) {
        return res.status(400).json({ error: 'Missing password' });
      }

      // Ensure the database connection is established
      if (!dbClient.db) {
        await dbClient.connect(); // Wait for the connection to be established
      }

      // Check if the email already exists in the database
      const existingUser = await dbClient.db
        .collection('users')
        .findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }

      // Hash the password using SHA1
      const hashedPassword = crypto
        .createHash('sha1')
        .update(password)
        .digest('hex');

      // Insert the new user into the 'users' collection
      const result = await dbClient.db.collection('users').insertOne({
        email,
        password: hashedPassword,
      });

      // Return the newly created user with only the email and id
      return res.status(201).json({
        id: result.insertedId,
        email,
      }); // Add 'return' to ensure no further execution after this point
    } catch (error) {
      console.error('Error creating user:', error); // Log detailed error
      return res.status(500).json({ error: 'Internal Server Error' }); // Ensure that 'return' is added here as well
    }
  }
}

export default UsersController;
