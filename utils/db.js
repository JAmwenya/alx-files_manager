// utils/db.js

import { MongoClient } from "mongodb";

class DBClient {
	constructor() {
		const host = process.env.DB_HOST || "localhost";
		const port = process.env.DB_PORT || 27017;
		this.client = new MongoClient(`mongodb://${host}:${port}`, {
			useUnifiedTopology: true, // Enable the Unified Topology
		});
		this.db = null;
	}

	// Connect to MongoDB
	async connect() {
		if (!this.db) {
			try {
				await this.client.connect();
				this.db = this.client.db(); // Use the database from the connection
				console.log("Connected to MongoDB");
			} catch (error) {
				console.error("Connection to MongoDB failed:", error);
				this.db = null;
			}
		}
	}

	// Check if the connection is alive
	async isAlive() {
		if (!this.db) {
			await this.connect(); // Ensure the connection is established before checking
		}
		try {
			const result = await this.db.command({ ping: 1 });
			return result.ok; // 1 means the connection is alive
		} catch (error) {
			console.error("Ping failed:", error);
			return 0; // Return 0 on failure, matching the test expectations
		}
	}
}

// Export a single instance of DBClient
const dbClient = new DBClient();
export default dbClient;
