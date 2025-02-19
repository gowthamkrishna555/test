import { NextApiRequest, NextApiResponse } from "next";
import Node from "../../models/Node";
import { connectDB } from "../../lib/sequelize";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();

    if (req.method !== "POST") {
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const { id, label, position_x, position_y, color } = req.body;

    if (!id || !label) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log("Creating node:", { id, label, position_x, position_y, color });

    const newNode = await Node.create({ id, label, position_x, position_y, color });

    console.log("Node created successfully:", newNode);

    return res.status(201).json(newNode);
  } catch (error: any) {
    console.error("Error creating node:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
