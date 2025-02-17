import { useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { Box, Button, Container, Paper, Typography, TextField } from "@mui/material";
import axios from "axios";

// Define CustomEdge interface extending Edge
interface CustomEdge {
  id: string;
  source: string;
  target: string;
  customLabel?: string;
}

export default function Dashboard() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodeLabel, setNodeLabel] = useState<string>("");

  // Fetch nodes and edges from the API (for data persistence across refreshes)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nodeRes, edgeRes] = await Promise.all([
          axios.get<any[]>("/api/node"),
          axios.get<any[]>("/api/edge"),
        ]);

        // Set nodes and edges state from the API response
        setNodes(
          nodeRes.data.map((node: any) => ({
            id: node.id.toString(),
            data: { label: node.label },
            position: { x: node.position_x, y: node.position_y },
            style: { backgroundColor: node.color || "#ddd", borderRadius: "5px", padding: "10px" },
          }))
        );

        setEdges(
          edgeRes.data.map((edge: any) => ({
            id: edge.id.toString(),
            source: edge.source.toString(),
            target: edge.target.toString(),
            customLabel: edge.customLabel || "Custom Label",
          }))
        );
      } catch (error) {
        console.error("Error fetching nodes and edges:", error);
      }
    };
    fetchData();
  }, []);  

  
  const addNode = async () => {
    if (!selectedNodeId) return;

    const newNode = {
      id: `${nodes.length + 1}`,
      label: `Child Node ${nodes.length + 1}`,
      position_x: 250,
      position_y: nodes.length * 100 + 50,
      color: "#1976d2",
    };

    const parentNode = nodes.find((node) => node.id === selectedNodeId);

    if (parentNode) {
      const newPositionY = parentNode.position.y + 100;

      setNodes((prev) => [
        ...prev,
        {
          id: newNode.id,
          data: { label: newNode.label },
          position: { x: parentNode.position.x + 200, y: newPositionY },
          style: { backgroundColor: newNode.color, borderRadius: "5px", padding: "10px" },
        },
      ]);

      setEdges((prev) => [
        ...prev,
        {
          id: `${selectedNodeId}-${newNode.id}`,
          source: selectedNodeId,
          target: newNode.id,
          customLabel: "Child Node Link",
        },
      ]);

      // Persist the new node and edge to the database
      try {
        await axios.post("/api/node", newNode);
        await axios.post("/api/edge", {
          source: selectedNodeId,
          target: newNode.id,
          customLabel: "Child Node Link",
        });
      } catch (error) {
        console.error("Error adding node:", error);
      }
    }
  };

  // Delete node (with persistence)
  const deleteNode = async (id: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== id));
    setEdges((prev) => prev.filter((edge) => edge.source !== id && edge.target !== id));

    try {
      await axios.delete("/api/node", { params: { id } });
      await axios.delete("/api/edge", { params: { source: id, target: id } });
    } catch (error) {
      console.error("Error deleting node:", error);
    }
  };

  // Mark node as complete (change style)
  const markAsComplete = (id: string) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === id
          ? { ...node, style: { backgroundColor: "lightgreen", border: "2px solid green", borderRadius: "5px" } }
          : node
      )
    );
  };

  // Handle node click (for selecting)
  const onNodeClick = (event: any, node: any) => {
    setSelectedNodeId(node.id);
    setNodeLabel(node.data?.label || "");
  };

  // Update node label
  const updateNodeLabel = async (id: string) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === id ? { ...node, data: { label: nodeLabel } } : node
      )
    );

    try {
      await axios.put("/api/node", { id, label: nodeLabel });
    } catch (error) {
      console.error("Error updating node label:", error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} mb={2}>
        <Typography variant="h4" fontWeight="bold">
          React Flow Dashboard
        </Typography>
        <Button
          variant="contained"
          onClick={addNode}
          sx={{ backgroundColor: "#1976d2" }}
          disabled={!selectedNodeId} // Disable Add Node if no node is selected
        >
          Add Child Node
        </Button>
      </Box>

      <Paper elevation={3} sx={{ height: "500px", borderRadius: 2, overflow: "hidden" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
        >
          <Background />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </Paper>

      {/* Edit Node Label */}
      {selectedNodeId && (
        <Box mt={3}>
          <TextField
            label="Edit Node Label"
            value={nodeLabel}
            onChange={(e) => setNodeLabel(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => updateNodeLabel(selectedNodeId)}
          >
            Update Label
          </Button>
        </Box>
      )}

      <Box mt={3}>
        {nodes.map((node) => (
          <Box key={node.id} display="flex" alignItems="center" mt={1}>
            <Typography variant="body1" sx={{ minWidth: 80 }}>
              {node.data?.label || "Unnamed Node"}
            </Typography>

            {/* Action Buttons */}
            <Button variant="contained" size="small" color="primary" onClick={() => markAsComplete(node.id)} sx={{ ml: 1 }}>
              Mark as Complete
            </Button>
            <Button variant="contained" size="small" color="error" onClick={() => deleteNode(node.id)} sx={{ ml: 1 }}>
              Delete
            </Button>
          </Box>
        ))}
      </Box>
    </Container>
  );
}
