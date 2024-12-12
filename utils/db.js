// utils/db.js

import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const dbName = process.env.DB_DATABASE || 'files_manager';
    this.client = new MongoClient(`mongodb://${host}:${port}`, {
      useUnifiedTopology: true,
    });
    this.db = null;
    this.dbName = dbName;
  }

  // Connect to MongoDB
  async connect() {
    if (!this.db) {
      try {
        await this.client.connect();
        this.db = this.client.db(this.dbName);
        console.log('Connected to MongoDB');
      } catch (error) {
        console.error('Connection to MongoDB failed:', error);
        this.db = null;
      }
    }
  }

	// Check if the connection is alive
	async isAlive() {
		if (!this.db) {
			await this.connect();
		}
		try {
			const result = await this.db.command({ ping: 1 });
			return result.ok === 1 ? 1 : 0;
		} catch (error) {
			console.error("Ping failed:", error);
			return 0;
		}
	}

  // Get the number of users in the collection
  async nbUsers() {
    if (!this.db) {
      await this.connect();
    }
    try {
      const usersCollection = this.db.collection('users');
      const count = await usersCollection.countDocuments();
      return count;
    } catch (error) {
      console.error('Failed to count users:', error);
      return 0;
    }
  }

  // Get the number of files in the collection
  async nbFiles() {
    if (!this.db) {
      await this.connect();
    }
    try {
      const filesCollection = this.db.collection('files');
      const count = await filesCollection.countDocuments();
      return count;
    } catch (error) {
      console.error('Failed to count files:', error);
      return 0;
    }
  }
}

// Export a single instance of DBClient
const dbClient = new DBClient();
export default dbClient;
