// controllers/AppController.js

import dbClient from "../utils/db.js";

class AppController {
	// GET /status: Check if DB is alive (no Redis)
	static async getStatus(req, res) {
		try {
			const dbStatus = await dbClient.isAlive();

			res.status(200).json({
				db: dbStatus,
			});
		} catch (error) {
			console.error("Error checking status:", error);
			res.status(500).json({ error: "Internal Server Error" });
		}
	}

	// GET /stats: Get the number of users and files in DB
	static async getStats(req, res) {
		try {
			const usersCount = await dbClient.nbUsers();
			const filesCount = await dbClient.nbFiles();

			res.status(200).json({
				users: usersCount,
				files: filesCount,
			});
		} catch (error) {
			console.error("Error getting stats:", error);
			res.status(500).json({ error: "Internal Server Error" });
		}
	}
}

export default AppController;
