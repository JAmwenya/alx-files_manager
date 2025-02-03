// // controllers/AppController.js

// import dbClient from '../utils/db';

// class AppController {
//   // GET /status: Check if DB is alive (no Redis)
//   static async getStatus(req, res) {
//     try {
//       const dbStatus = await dbClient.isAlive();

//       // Respond with the DB status
//       return res.status(200).json({
//         db: dbStatus === 1,
//       });
//     } catch (error) {
//       console.error('Error checking status:', error);
//       return res.status(500).json({ error: 'Internal Server Error' });
//     }
//   }

//   // GET /stats: Get the number of users and files in DB
//   static async getStats(req, res) {
//     try {
//       const [usersCount, filesCount] = await Promise.all([dbClient.nbUsers(), dbClient.nbFiles()]);

//       // Respond with the number of users and files
//       return res.status(200).json({
//         users: usersCount,
//         files: filesCount,
//       });
//     } catch (error) {
//       console.error('Error getting stats:', error);
//       return res.status(500).json({ error: 'Internal Server Error' });
//     }
//   }
// }

// export default AppController;
import RedisClient from '../utils/redis';
import DBClient from '../utils/db';

class AppController {
  static getStatus(request, response) {
    const status = { redis: RedisClient.isAlive(), db: DBClient.isAlive() };
    return response.status(200).send(status);
  }

  static async getStats(request, response) {
    const nbUser = await DBClient.nbUsers();
    const nbFiles = await DBClient.nbFiles();

    return response.status(200).send({ users: nbUser, files: nbFiles });
  }
}

export default AppController;