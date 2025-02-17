import { NextApiRequest, NextApiResponse } from "next";
import Edge from "../../models/Edge";
import Node from "../../models/Node";
import { connectDB } from "../../lib/sequelize";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const edges = await Edge.findAll();
      console.log("Fetched edges:", edges); 
      return res.status(200).json(edges);
    } catch (error) {
      console.error("Error fetching edges:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

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
  
//   if (req.method === "DELETE") {
//     const { id } = req.query;
//     if (!id || Array.isArray(id)) {
//       return res.status(400).json({ error: "Edge ID is required and must be a single string" });
//     }

//     try {
//       // Find the edge by ID
//       const edge = await Edge.findByPk(id);
//       if (!edge) {
//         return res.status(404).json({ error: "Edge not found" });
//       }

//       // Delete the edge
//       await Edge.destroy({ where: { id } });
//       console.log(`Deleted edge with ID: ${id}`); // Log deletion for debugging
//       return res.status(200).json({ message: "Edge deleted successfully" });

//     } catch (error) {
//       console.error("Error deleting edge:", error);
//       return res.status(500).json({ error: "Internal Server Error" });
//     }
//   }

//   return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
// 
}
