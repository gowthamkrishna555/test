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
import { v4 as uuidv4 } from 'uuid';
import { fetchNodes, addNode as apiAddNode, deleteNode as apiDeleteNode, updateNodeLabel as apiUpdateNodeLabel, fetchEdges, addEdge } from "../api-spec/node-edgeService";


interface CustomEdge {
  id: string;
  source: string;
  target: string;
}

export default function Dashboard() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodeLabel, setNodeLabel] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const nodeRes = await fetchNodes();
        const edgeRes = await fetchEdges();

        setNodes(
          nodeRes.map((node: any) => ({
            id: node.id.toString(),
            data: { label: node.label },
            position: { x: node.position_x, y: node.position_y },
            style: { backgroundColor: node.color || "#ddd", borderRadius: "5px", padding: "10px" },
          }))
        );

        setEdges(
          edgeRes.map((edge: any) => ({
            id: edge.id.toString(),
            source: edge.source.toString(),
            target: edge.target.toString(),
          }))
        );
      } catch (error) {
        console.error("Error fetching nodes and edges:", error);
      }
    };
    fetchData();
  }, []);

  const handleAddNode = async () => {
    const newNode = {
      id: uuidv4(),
      label: `Node ${nodes.length + 1}`,
      position_x: 250,
      position_y: nodes.length * 100 + 50,
      color: "#1976d2",
    };

    if (selectedNodeId) {
      const parentNode = nodes.find((node) => node.id === selectedNodeId);
      if (parentNode) {
        const newPositionY = parentNode.position.y + 100;

        setNodes((prev) => [...prev, {
          id: newNode.id,
          data: { label: newNode.label },
          position: { x: parentNode.position.x + 200, y: newPositionY },
          style: { backgroundColor: newNode.color, borderRadius: "5px", padding: "10px" },
        }]);

        setEdges((prev) => [...prev, {
          id: `${selectedNodeId}-${newNode.id}`,
          source: selectedNodeId,
          target: newNode.id,
        }]);

        try {
          await apiAddNode(newNode);
          await addEdge(selectedNodeId, newNode.id); // Fixed issue with 'edgeService'
        } catch (error) {
          console.error("Error adding node:", error);
        }
      }
    } else {
      setNodes((prev) => [...prev, {
        id: newNode.id,
        data: { label: newNode.label },
        position: { x: newNode.position_x, y: newNode.position_y },
        style: { backgroundColor: newNode.color, borderRadius: "5px", padding: "10px" },
      }]);

      try {
        await apiAddNode(newNode);
      } catch (error) {
        console.error("Error adding node:", error);
      }
    }
  };

  const handleDeleteNode = async (id: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== id));
    setEdges((prev) => prev.filter((edge) => edge.source !== id && edge.target !== id));

    try {
      await apiDeleteNode(id);
    } catch (error) {
      console.error("Error deleting node:", error);
    }
  };

  const markAsComplete = (id: string) => {
    setNodes((prev) => prev.map((node) =>
      node.id === id ? { ...node, style: { backgroundColor: "lightgreen", border: "2px solid green", borderRadius: "5px" } } : node
    ));
  };

  const onNodeClick = (event: any, node: any) => {
    setSelectedNodeId(node.id);
    setNodeLabel(node.data?.label || "");
  };

  const handleUpdateNodeLabel = async (id: string) => {
    setNodes((prev) => prev.map((node) =>
      node.id === id ? { ...node, data: { label: nodeLabel } } : node
    ));

    try {
      await apiUpdateNodeLabel(id, nodeLabel); // Fixed function call
    } catch (error) {
      console.error("Error updating node label:", error);
    }
  };

  return (
    <Container maxWidth="md">
      {/* Header with Add Node Button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} mb={2}>
        <Typography variant="h4" fontWeight="bold">
          React Flow Dashboard
        </Typography>
        <Button variant="contained" onClick={handleAddNode} sx={{ bgcolor: "primary.main" }}>
          Add Node (as Root or Child)
        </Button>
      </Box>
  
      {/* React Flow Diagram */}
      <Paper elevation={3} sx={{ height: 500, borderRadius: 2, overflow: "hidden" }}>
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
          <TextField label="Edit Node Label" value={nodeLabel} onChange={(e) => setNodeLabel(e.target.value)} fullWidth />
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => handleUpdateNodeLabel(selectedNodeId)}>
            Update Label
          </Button>
        </Box>
      )}
  
      {/* List of Nodes */}
      <Box mt={3}>
        {nodes.map((node) => (
          <Box key={node.id} display="flex" alignItems="center" mt={1}>
            <Typography variant="body1" sx={{ minWidth: 80 }}>
              {node.data.label || "Unnamed Node"}
            </Typography>
  
            {/* Action Buttons */}
            <Button variant="contained" size="small" color="success" onClick={() => markAsComplete(node.id)} sx={{ ml: 1 }}>
              Mark as Complete
            </Button>
            <Button variant="contained" size="small" color="error" onClick={() => handleDeleteNode(node.id)} sx={{ ml: 1 }}>
              Delete
            </Button>
          </Box>
        ))}
      </Box>
    </Container>
  );
}  