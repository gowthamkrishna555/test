import { NextApiRequest, NextApiResponse } from "next";
import Node from "../../models/Node";
import { connectDB } from "../../lib/sequelize";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();

    if (req.method !== "DELETE") {
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Node ID is required" });
    }

    console.log(`Deleting node with ID: ${id}`);

    const node = await Node.findOne({ where: { id } });

    if (!node) {
      return res.status(404).json({ error: "Node not found" });
    }

    await Node.destroy({ where: { id } });

    console.log("Node deleted successfully");

    return res.status(200).json({ message: "Node deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting node:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
