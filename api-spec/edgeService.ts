import axios from "axios";

export const fetchEdges = async () => {
  try {
    const response = await axios.get("/api/edge");
    return response.data;
  } catch (error) {
    console.error("Error fetching edges:", error);
    return [];
  }
};

export const addEdge = async (source: string, target: string) => {
  try {
    await axios.post("/api/edge", { source, target });
  } catch (error) {
    console.error("Error adding edge:", error);
  }
};

// export const deleteEdge = async (source: string, target: string) => {
//   try {
//     await axios.delete("/api/edge", { params: { source, target } });
//   } catch (error) {
//     console.error("Error deleting edge:", error);
//   }
//};
