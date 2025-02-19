import axios from "axios";

export const fetchNodes = async () => {
  try {
    const response = await axios.get("/api/get-node");
    return response.data;
  } catch (error) {
    console.error("Error fetching nodes:", error);
    return [];
  }
};

export const addNode = async (newNode: any) => {
  try {
    await axios.post("/api/add-node", newNode);
  } catch (error) {
    console.error("Error adding node:", error);
  }
};

export const deleteNode = async (id: string) => {
  try {
    await axios.delete("/api/delete-node", { params: { id } });
  } catch (error) {
    console.error("Error deleting node:", error);
  }
};

export const updateNodeLabel = async (id: string, label: string) => {
  try {
    await axios.put("/api/update-node", { id, label });
  } catch (error) {
    console.error("Error updating node label:", error);
  }
};


export const fetchEdges = async () => {
    try {
      const response = await axios.get("/api/get-edge");
      return response.data;
    } catch (error) {
      console.error("Error fetching edges:", error);
      return [];
    }
  };
  
  export const addEdge = async (source: string, target: string) => {
    try {
      await axios.post("/api/add-edge", { source, target });
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
  