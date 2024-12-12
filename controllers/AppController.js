// controllers/AppController.js

import dbClient from '../utils/db';

class AppController {
  // GET /status: Check if DB is alive (no Redis)
  static async getStatus(req, res) {
    try {
      const dbStatus = await dbClient.isAlive();

      // Respond with the DB status
      return res.status(200).json({
        db: dbStatus === 1,
      });
    } catch (error) {
      console.error('Error checking status:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // GET /stats: Get the number of users and files in DB
  static async getStats(req, res) {
    try {
      const [usersCount, filesCount] = await Promise.all([dbClient.nbUsers(), dbClient.nbFiles()]);

      // Respond with the number of users and files
      return res.status(200).json({
        users: usersCount,
        files: filesCount,
      });
    } catch (error) {
      console.error('Error getting stats:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default AppController;
