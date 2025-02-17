import { Node } from 'reactflow';
import { NextApiRequest, NextApiResponse } from "next";
import NodeModel from "../../models/Node";
import db from "../../lib/db"; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid ID" });
  }

  if (req.method === "PUT") {
    try {
      await db.sync(); 
      const { label } = req.body as { label: string };

      if (!label) {
        return res.status(400).json({ error: "Label is required" });
      }

      const node = await NodeModel.findByPk(id);
      if (!node) {
        return res.status(404).json({ error: "Node not found" });
      }

      await node.update({ label });

      return res.status(200).json(node);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}