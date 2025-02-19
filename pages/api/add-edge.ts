import { NextApiRequest, NextApiResponse } from "next";
import Edge from "../../models/Edge";
import Node from "../../models/Node";
import { connectDB } from "../../lib/sequelize";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  if (req.method === "POST") {
    const { source, target } = req.body;
    console.log("Request body for POST:", req.body);
  
    if (!source || !target) {
      return res.status(400).json({ error: "Missing required fields: source, target" });
    }
  
    try {
      
      const sourceNode = await Node.findByPk(source);
      const targetNode = await Node.findByPk(target);
  
      if (!sourceNode || !targetNode) {
        return res.status(400).json({ error: "Source or Target node does not exist" });
      }
  
      
      const existingEdge = await Edge.findOne({ where: { source, target } });
      if (existingEdge) {
        return res.status(409).json({ error: "Edge already exists between the source and target nodes" });
      }
  
      
      const newEdge = await Edge.create({ source, target });
      console.log("Created new edge:", newEdge);  // Log the created edge for debugging
      return res.status(201).json(newEdge);
  
    } catch (error) {
      console.error("Error creating edge:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
}
}