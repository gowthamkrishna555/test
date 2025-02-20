import { NextApiRequest, NextApiResponse } from "next";
import Edge from "../../models/Edge";
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
}