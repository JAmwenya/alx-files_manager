// utils/db.js

import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;

    this.client = new MongoClient(`mongodb://${host}:${port}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    this.db = null; // Database is not set initially
  }

  // Asynchronous function to connect to the MongoDB client
  async connect() {
    if (!this.db) {
      try {
        await this.client.connect();
        this.db = this.client.db(); // Use the database from the connection
        console.log('Connected to MongoDB');
      } catch (error) {
        console.error('Connection to MongoDB failed:', error);
        this.db = null;
      }
    }
  }

  // Function to check if the connection is alive
  async isAlive() {
    if (!this.db) {
      await this.connect(); // Ensure connection is established before checking
    }

    try {
      // Check if the connection is alive by sending a ping
      const result = await this.db.command({ ping: 1 });
      return result.ok; // Return the result of the ping command (1 means alive)
    } catch (error) {
      console.error('Ping failed:', error);
      return 0; // Return 0 on failure, matching the test expectations
    }
  }

  // Asynchronous function to count the number of users
  async nbUsers() {
    if (!this.db) {
      await this.connect(); // Ensure connection is established before querying
    }

    try {
      const usersCollection = this.db.collection('users');
      const count = await usersCollection.countDocuments();
      return count;
    } catch (error) {
      console.error('Error counting users:', error);
      return 0; // Return 0 in case of an error
    }
  }

  // Asynchronous function to count the number of files
  async nbFiles() {
    if (!this.db) {
      await this.connect(); // Ensure connection is established before querying
    }

    try {
      const filesCollection = this.db.collection('files');
      const count = await filesCollection.countDocuments();
      return count;
    } catch (error) {
      console.error('Error counting files:', error);
      return 0; // Return 0 in case of an error
    }
  }
}

// Export a single instance of DBClient
const dbClient = new DBClient();
export default dbClient;
