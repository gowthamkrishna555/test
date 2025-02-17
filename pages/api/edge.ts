import { NextApiRequest, NextApiResponse } from "next";
import Edge from "../../models/Edge";
import Node from "../../models/Node";
import { connectDB } from "../../lib/sequelize";

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

    
    const sourceNode = await Node.findByPk(source);
    const targetNode = await Node.findByPk(target);

    if (!sourceNode || !targetNode) {
      return res.status(400).json({ error: "Source or Target node does not exist" });
    }

    
    const existingEdge = await Edge.findOne({ where: { source, target } });
    if (existingEdge) {
      return res.status(409).json({ error: "Edge already exists between the source and target nodes" });
    }

   
    const newEdge = await Edge.create({ id, source, target });
    return res.status(201).json(newEdge);
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id || Array.isArray(id)) return res.status(400).json({ error: "Edge ID is required and must be a single string" });

    
    const edge = await Edge.findByPk(id);
    if (!edge) {
      return res.status(404).json({ error: "Edge not found" });
    }

    await Edge.destroy({ where: { id } });
    return res.status(200).json({ message: "Edge deleted successfully" });
  }

  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
