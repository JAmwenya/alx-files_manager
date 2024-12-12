import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import dbClient from "../utils/db.js";
import redisClient from "../utils/redis.js";

class AuthController {
	static async getConnect(req, res) {
		const authHeader = req.headers["authorization"];
		if (!authHeader) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		const [email, password] = Buffer.from(authHeader.split(" ")[1], "base64")
			.toString("utf-8")
			.split(":");
		const hashedPassword = crypto
			.createHash("sha1")
			.update(password)
			.digest("hex");
		const user = await dbClient.db
			.collection("users")
			.findOne({ email, password: hashedPassword });

		if (!user) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		const token = uuidv4();
		await redisClient.set(`auth_${token}`, user._id.toString(), 86400); // 24 hours
		res.status(200).json({ token });
	}

	static async getDisconnect(req, res) {
		const token = req.headers["x-token"];
		if (!token || !(await redisClient.get(`auth_${token}`))) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		await redisClient.del(`auth_${token}`);
		res.status(204).send();
	}
}

export default AuthController;
