import { NextApiRequest, NextApiResponse } from "next";
import Node from "../../models/Node";
import { connectDB } from "../../lib/sequelize";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectDB();
  
    if (req.method === "PUT") {
      try {
        const { id, position_x, position_y, label, color } = req.body;
        console.log("Received update for node:", req.body);
  
        const updatedNode = await Node.update(
          { position_x, position_y, label, color },
          { where: { id }, returning: true }
        );
  
        if (!updatedNode[1].length) {
          return res.status(404).json({ error: "Node not found" });
        }
  
        console.log("Node successfully updated:", updatedNode[1][0].dataValues);
        return res.status(200).json(updatedNode[1][0]);
      } catch (error) {
        console.error("Error updating node:", error);
        return res.status(500).json({ error: "Database update failed" });
      }
    }
  
    res.status(405).json({ error: "Method Not Allowed" });
}
