// controllers/AppController.js

import dbClient from '../utils/db'; // MongoDB client

class AppController {
  // GET /status: Check if DB is alive (no Redis)
  static async getStatus(req, res) {
    try {
      const dbStatus = await dbClient.isAlive(); // Check DB status only

      res.status(200).json({
        db: dbStatus,
      });
    } catch (error) {
      console.error('Error checking status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // GET /stats: Get the number of users and files in DB
  static async getStats(req, res) {
    try {
      const usersCount = await dbClient.nbUsers(); // Get users count
      const filesCount = await dbClient.nbFiles(); // Get files count

      res.status(200).json({
        users: usersCount,
        files: filesCount,
      });
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default AppController;
