import axios from "axios";

export const fetchNodes = async () => {
  try {
    const response = await axios.get("/api/node");
    return response.data;
  } catch (error) {
    console.error("Error fetching nodes:", error);
    return [];
  }
};

export const addNode = async (newNode: any) => {
  try {
    await axios.post("/api/node", newNode);
  } catch (error) {
    console.error("Error adding node:", error);
  }
};

export const deleteNode = async (id: string) => {
  try {
    await axios.delete("/api/node", { params: { id } });
  } catch (error) {
    console.error("Error deleting node:", error);
  }
};

export const updateNodeLabel = async (id: string, label: string) => {
  try {
    await axios.put("/api/node", { id, label });
  } catch (error) {
    console.error("Error updating node label:", error);
  }
};
