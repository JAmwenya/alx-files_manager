// controllers/AuthController.js

import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  // GET /connect: Sign in the user by generating a token
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [email, password] = Buffer.from(authHeader.split(' ')[1], 'base64')
      .toString('utf-8')
      .split(':');
    const hashedPassword = crypto
      .createHash('sha1')
      .update(password)
      .digest('hex');

    try {
      const user = await dbClient.db
        .collection('users')
        .findOne({ email, password: hashedPassword });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Generate a token and store it in Redis
      const token = uuidv4();
      await redisClient.set(`auth_${token}`, user._id.toString(), 86400);
      return res.status(200).json({ token });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // GET /disconnect: Sign out by deleting the token from Redis
  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Delete the token from Redis
      await redisClient.del(`auth_${token}`);
      return res.status(204).send(); // No content on successful disconnect
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // GET /users/me: Retrieve user info based on token
  static async getMe(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Fetch the user from DB
      const user = await dbClient.db
        .collection('users')
        .findOne({ _id: dbClient.db.ObjectId(userId) });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Return user details (email and id only)
      return res.status(200).json({
        id: user._id,
        email: user.email,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default AuthController;
