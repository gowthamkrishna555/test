import { NextApiRequest, NextApiResponse } from "next";
import Edge from "../../models/Edge";
import Node from "../../models/Node";
import { connectDB } from "../../lib/sequelize";
import { Sequelize } from "sequelize";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === "GET") {
    const edges = await Edge.findAll();
    return res.status(200).json(edges);
  }

  if (req.method === "POST") {
    const { id, source, target } = req.body;
    if (!id || !source || !target) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // âœ… Validate that source & target nodes exist before creating edge
    const sourceNode = await Node.findByPk(source);
    const targetNode = await Node.findByPk(target);

    if (!sourceNode || !targetNode) {
      return res.status(400).json({ error: "Source or Target node does not exist" });
    }

    const newEdge = await Edge.create({ id, source, target });
    return res.status(201).json(newEdge);
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Edge ID is required" });

    await Edge.destroy({ where: { id } });
    return res.status(200).json({ message: "Edge deleted successfully" });
  }

  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
