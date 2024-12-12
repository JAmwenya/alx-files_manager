// controller/AuthController.js

import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
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

      const token = uuidv4();
      await redisClient.set(`auth_${token}`, user._id.toString(), 86400);
      return res.status(200).json({ token });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token || !(await redisClient.get(`auth_${token}`))) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      await redisClient.del(`auth_${token}`);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default AuthController;
