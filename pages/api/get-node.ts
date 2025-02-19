import { NextApiRequest, NextApiResponse } from "next";
import Node from "../../models/Node";
import { connectDB } from "../../lib/sequelize";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();

    if (req.method !== "GET") {
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const nodes = await Node.findAll();
    return res.status(200).json(nodes);
  } catch (error: any) {
    console.error("Error fetching nodes:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
