import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import dbClient from "../utils/db.js";
import redisClient from "../utils/redis.js";

class FilesController {
	static async postUpload(req, res) {
		const { name, type, data, parentId, isPublic } = req.body;
		const token = req.headers["x-token"];

		if (!token || !(await redisClient.get(`auth_${token}`))) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		if (!name) {
			return res.status(400).json({ error: "Missing name" });
		}
		if (!type || !["folder", "file", "image"].includes(type)) {
			return res.status(400).json({ error: "Missing or invalid type" });
		}
		if ((type === "file" || type === "image") && !data) {
			return res.status(400).json({ error: "Missing data" });
		}

		const userId = await redisClient.get(`auth_${token}`);
		const parent = parentId
			? await dbClient.db
					.collection("files")
					.findOne({ _id: new ObjectId(parentId), userId })
			: null;

		if (parentId && !parent) {
			return res.status(400).json({ error: "Parent not found" });
		}
		if (parent && parent.type !== "folder") {
			return res.status(400).json({ error: "Parent is not a folder" });
		}

		let filePath = "";
		if (type !== "folder") {
			const folderPath = process.env.FOLDER_PATH || "/tmp/files_manager";
			const fileName = uuidv4();
			const fileBuffer = Buffer.from(data, "base64");
			filePath = path.join(folderPath, fileName);
			fs.writeFileSync(filePath, fileBuffer);
		}

		const file = await dbClient.db.collection("files").insertOne({
			userId,
			name,
			type,
			parentId: parentId || 0,
			isPublic: isPublic || false,
			localPath: filePath,
		});

		res.status(201).json(file.ops[0]);
	}

	static async getShow(req, res) {
		const token = req.headers["x-token"];
		if (!token || !(await redisClient.get(`auth_${token}`))) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		const file = await dbClient.db
			.collection("files")
			.findOne({ _id: new ObjectId(req.params.id) });
		if (
			!file ||
			file.userId !== new ObjectId(await redisClient.get(`auth_${token}`))
		) {
			return res.status(404).json({ error: "Not found" });
		}

		res.status(200).json(file);
	}
}

export default FilesController;
