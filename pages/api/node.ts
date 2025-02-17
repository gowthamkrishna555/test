import { NextApiRequest, NextApiResponse } from "next";
import Node from "../../models/Node";
import { connectDB } from "../../lib/sequelize";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();

    if (req.method === "GET") {
      const nodes = await Node.findAll();
      return res.status(200).json(nodes);
    }

    if (req.method === "POST") {
      const { id, label, position_x, position_y, color } = req.body;

      if (!id || !label) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      console.log("Creating node:", { id, label, position_x, position_y, color });

      const newNode = await Node.create({ id, label, position_x, position_y, color });

      console.log("Node created successfully:", newNode);

      return res.status(201).json(newNode);
    }

    if (req.method === "PUT") {
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
    }

    if (req.method === "DELETE") {
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
    }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({
      error: error.message || "Internal Server Error",
      details: error,
    });
  }
}
