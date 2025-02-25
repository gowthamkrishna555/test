import { useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  TextField,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { NodeMouseHandler } from "reactflow";
import {
  fetchNodes,
  addNode as apiAddNode,
  deleteNode as apiDeleteNode,
  updateNodeLabel as apiUpdateNodeLabel,
  fetchEdges,
  addEdge,
} from "../api-spec/node-edgeService";
import { Grid, Card, CardContent } from "@mui/material";
import { CheckCircle, Edit, Delete } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { IconButton } from "@mui/material";
import { Fab } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"


interface CustomNode {
  id: string;
  label: string;
  position_x: number;
  position_y: number;
  color?: string;
}
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
        const nodeRes: CustomNode[] = await fetchNodes();
        const edgeRes: CustomEdge[] = await fetchEdges();

        setNodes(
          nodeRes.map((node) => ({
            id: node.id.toString(),
            data: { label: node.label },
            position: { x: node.position_x, y: node.position_y },
            style: {
              backgroundColor: node.color || "#ddd",
              borderRadius: "5px",
              padding: "10px",
            },
          }))
        );

        setEdges(
          edgeRes.map((edge) => ({
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
      label: `Event ${nodes.length + 1}`,
      position_x: 250,
      position_y: nodes.length * 100 + 50,
      color: "#1976d2",
    };

    if (selectedNodeId) {
      const parentNode = nodes.find((node) => node.id === selectedNodeId);
      if (parentNode) {
        const newPositionY = parentNode.position.y + 100;

        setNodes((prev) => [
          ...prev,
          {
            id: newNode.id,
            data: { label: newNode.label },
            position: { x: parentNode.position.x + 200, y: newPositionY },
            style: {
              backgroundColor: newNode.color,
              borderRadius: "5px",
              padding: "10px",
            },
          },
        ]);

        setEdges((prev) => [
          ...prev,
          {
            id: `${selectedNodeId}-${newNode.id}`,
            source: selectedNodeId,
            target: newNode.id,
          },
        ]);

        try {
          await apiAddNode(newNode);
          await addEdge(selectedNodeId, newNode.id); // Fixed issue with 'edgeService'
        } catch (error) {
          console.error("Error adding node:", error);
        }
      }
    } else {
      setNodes((prev) => [
        ...prev,
        {
          id: newNode.id,
          data: { label: newNode.label },
          position: { x: newNode.position_x, y: newNode.position_y },
          style: {
            backgroundColor: newNode.color,
            borderRadius: "5px",
            padding: "10px",
          },
        },
      ]);

      try {
        await apiAddNode(newNode);
      } catch (error) {
        console.error("Error adding node:", error);
      }
    }
  };

  const handleDeleteNode = async (id: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== id));
    setEdges((prev) =>
      prev.filter((edge) => edge.source !== id && edge.target !== id)
    );

    try {
      await apiDeleteNode(id);
    } catch (error) {
      console.error("Error deleting node:", error);
    }
  };

  const markAsComplete = (id: string) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === id
          ? {
              ...node,
              style: {
                backgroundColor: "lightgreen",
                border: "2px solid green",
                borderRadius: "5px",
              },
            }
          : node
      )
    );
  };

  const onNodeClick: NodeMouseHandler = (event, node) => {
    setSelectedNodeId(node.id);
    setNodeLabel(node.data?.label || ""); // Access label correctly
  };

  const handleUpdateNodeLabel = async (id: string) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === id ? { ...node, data: { label: nodeLabel } } : node
      )
    );

    try {
      await apiUpdateNodeLabel(id, nodeLabel); // Fixed function call
    } catch (error) {
      console.error("Error updating node label:", error);
    }
  };

  const [expandedNodes, setExpandedNodes] = useState<{
    [key: string]: boolean;
  }>({});

  // Toggle function for expanding/collapsing nodes
  const toggleNodeExpansion = (nodeId: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const renderNodeHierarchy = (parentNodeId: string) => {
    if (!expandedNodes[parentNodeId]) return null; // Only render children if expanded
  
    return nodes
      .filter((node) =>
        edges.some((edge) => edge.source === parentNodeId && edge.target === node.id)
      )
      .map((childNode) => (
        <Card
          key={childNode.id}
          sx={{
            mt: 1,
            ml: 2,
            p: 1,
            backgroundColor: "#e3f2fd",
            minWidth: 300, // Prevents shrinking
            width: "auto",
            maxWidth: "100%", 
            overflow: "visible",
          }}
        >
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              width="100%"
            >
              {/* Event Label with Expand Toggle */}
              <Box display="flex" alignItems="center">
                <IconButton
                  onClick={() => toggleNodeExpansion(childNode.id)}
                  sx={{
                    backgroundColor: "#1976D2",
                    color: "white",
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    "&:hover": { backgroundColor: "#1565C0" },
                  }}
                >
                  {expandedNodes[childNode.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
  
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {childNode.data.label || "Unnamed Event"}
                </Typography>
              </Box>
  
              {/* Action Buttons in a single line */}
              <Box
                display="flex"
                alignItems="center"
                flexWrap="nowrap"
                sx={{
                  minWidth: 150, // Ensures buttons remain visible
                  overflow: "visible",
                  flexShrink: 0, 
                }}
              >
                <Button
                  variant="contained"
                  size="small"
                  color="success"
                  onClick={() => markAsComplete(childNode.id)}
                  sx={{ ml: 1, minWidth: "auto", p: 0.5 }}
                >
                  <CheckCircle fontSize="small" />
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  onClick={() => setSelectedNodeId(childNode.id)}
                  sx={{ ml: 1, minWidth: "auto", p: 0.5 }}
                >
                  <Edit fontSize="small" />
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  color="error"
                  onClick={() => handleDeleteNode(childNode.id)}
                  sx={{ ml: 1, minWidth: "auto", p: 0.5 }}
                >
                  <Delete fontSize="small" />
                </Button>
              </Box>
            </Box>
          </CardContent>
  
          {/* Scrollable Wrapper for Nested Nodes */}
          <Box sx={{ maxHeight: 400, overflowY: "auto", paddingRight: 1 }}>
            {renderNodeHierarchy(childNode.id)}
          </Box>
        </Card>
      ));
  };
  
  

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3} mt={3}>
        {/* Left Section - Controls */}
        <Grid item xs={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            {/* Header */}
            <Typography variant="h5" fontWeight="bold" mb={2}>
              Event Controls
            </Typography>

            {/* Add Event Button */}
            {/* <Button
              fullWidth
              variant="contained"
              onClick={handleAddNode}
              sx={{ mb: 2 }}
            >
              ➕ Add Event
            </Button> */}

            {/* Edit Event Section */}
            {selectedNodeId && (
              <Box mt={2}>
                <Typography variant="h6">Edit Event</Typography>
                <TextField
                  label="Event Name"
                  value={nodeLabel}
                  onChange={(e) => setNodeLabel(e.target.value)}
                  fullWidth
                  sx={{ mt: 1 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={() => handleUpdateNodeLabel(selectedNodeId)}
                >
                  Update Event
                </Button>
              </Box>
            )}

            {/* Event Hierarchy List */}
            <Box mt={3}>
              <Typography variant="h6" fontWeight="bold">
                Event Hierarchy:
              </Typography>
              {nodes
                .filter(
                  (node) => !edges.some((edge) => edge.target === node.id)
                ) // Find root nodes
                .map((parentNode) => (
                  <Card
                    key={parentNode.id}
                    sx={{ mt: 1, p: 1, backgroundColor: "#f5f5f5" }}
                  >
                    <CardContent>
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        sx={{ cursor: "pointer" }}
                        onClick={() => toggleNodeExpansion(parentNode.id)}
                      >
                        {parentNode.data.label || "Unnamed Event"}
                      </Typography>
                    </CardContent>
                    {/* Recursive call to render children only when expanded */}
                    {renderNodeHierarchy(parentNode.id)}
                  </Card>
                ))}
            </Box>
          </Paper>
        </Grid>

        {/* Right Section - Graph */}
        <Grid item xs={8}>
          <Paper
            elevation={3}
            sx={{ height: 500, borderRadius: 2, overflow: "hidden" }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              fitView
            >
              <Fab
                color="primary"
                aria-label="add"
                onClick={handleAddNode}
                sx={{
                  position: "absolute",
                  bottom: 16,
                  right: 16,
                  zIndex: 1000, // Ensure it's above other elements
                }}
              >
                <AddIcon />
              </Fab>
              <Background />
              <MiniMap />
              <Controls />
            </ReactFlow>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
