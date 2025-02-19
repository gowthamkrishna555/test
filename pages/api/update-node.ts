import { NextApiRequest, NextApiResponse } from "next";
import Node from "../../models/Node";
import { connectDB } from "../../lib/sequelize";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();

    if (req.method !== "PUT") {
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const { id, label, position_x, position_y, color } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Node ID is required" });
    }

    const existingNode = await Node.findOne({ where: { id } });

    if (!existingNode) {
      return res.status(404).json({ error: "Node not found" });
    }

    const updatedNode = await existingNode.update({
      label: label || existingNode.label,
      position_x: position_x || existingNode.position_x,
      position_y: position_y || existingNode.position_y,
      color: color || existingNode.color,
    });

    console.log("Node updated successfully:", updatedNode);

    return res.status(200).json(updatedNode);
  } catch (error: any) {
    console.error("Error updating node:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
