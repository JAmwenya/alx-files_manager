import { MongoClient } from "mongodb";

class DBClient {
	constructor() {
		const host = process.env.DB_HOST || "localhost";
		const port = process.env.DB_PORT || 27017;
		const database = process.env.DB_DATABASE || "files_manager";

		this.client = new MongoClient(`mongodb://${host}:${port}`, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		this.db = this.client.db(database);
	}

	async isAlive() {
		try {
			await this.client.connect();
			return true;
		} catch (error) {
			return false;
		}
	}

	async nbUsers() {
		const users = await this.db.collection("users").countDocuments();
		return users;
	}

	async nbFiles() {
		const files = await this.db.collection("files").countDocuments();
		return files;
	}
}

const dbClient = new DBClient();
export default dbClient;
