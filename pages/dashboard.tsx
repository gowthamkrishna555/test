import { useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  NodeDragHandler,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  TextField,
  Grid,
  IconButton,
  Fab,
  Chip,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  InputAdornment,
  alpha,
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
  updateNodeLabel,
} from "../api-spec/node-edgeService";
import {
  CheckCircle,
  Edit,
  Delete,
  ExpandMore,
  ExpandLess,
  Add,
  Label,
  Timeline,
  Save,
  Cancel,
  Event,
  Search,
  AddCircleOutline,
} from "@mui/icons-material";

interface CustomNode {
  id: string;
  label: string;
  position_x: number;
  position_y: number;
  color?: string;
  status?: string;
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
  const [nodeColor, setNodeColor] = useState<string>("#1976d2");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedNodes, setExpandedNodes] = useState<{
    [key: string]: boolean;
  }>({});
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Status options for events
  const STATUS_OPTIONS = [
    { label: "In Progress", color: "#1976d2" },
    { label: "Completed", color: "#2e7d32" },
    { label: "Pending", color: "#ed6c02" },
    { label: "Canceled", color: "#d32f2f" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const nodeRes: CustomNode[] = await fetchNodes();
        const edgeRes: CustomEdge[] = await fetchEdges();

        setNodes(
          nodeRes.map((node) => ({
            id: node.id.toString(),
            data: { 
              label: node.label,
              status: node.status || "In Progress" 
            },
            position: { x: node.position_x, y: node.position_y },
            style: {
              backgroundColor: node.color || "#1976d2",
              color: "white",
              borderRadius: "8px",
              padding: "12px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              border: "none",
              minWidth: "180px",
            },
          }))
        );

        setEdges(
          edgeRes.map((edge) => ({
            id: edge.id.toString(),
            source: edge.source.toString(),
            target: edge.target.toString(),
            style: { stroke: "#888", strokeWidth: 2 },
            animated: true,
          }))
        );
      } catch (error) {
        console.error("Error fetching nodes and edges:", error);
      }
    };
    fetchData();
  }, []);

  const handleAddNode = async (parentId?: string) => {
    const newNode = {
      id: uuidv4(),
      label: `Event ${nodes.length + 1}`,
      position_x: 250,
      position_y: nodes.length * 100 + 50,
      color: nodeColor,
      status: "In Progress",
    };

    if (parentId) {
      const parentNode = nodes.find((node) => node.id === parentId);
      if (parentNode) {
        const newPositionY = parentNode.position.y + 100;

        setNodes((prev) => [
          ...prev,
          {
            id: newNode.id,
            data: { 
              label: newNode.label,
              status: "In Progress"
            },
            position: { x: parentNode.position.x + 200, y: newPositionY },
            style: {
              backgroundColor: newNode.color,
              color: "white",
              borderRadius: "8px",
              padding: "12px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              border: "none",
              minWidth: "180px",
            },
          },
        ]);

        setEdges((prev) => [
          ...prev,
          {
            id: `${parentId}-${newNode.id}`,
            source: parentId,
            target: newNode.id,
            style: { stroke: "#888", strokeWidth: 2 },
            animated: true,
          },
        ]);

        try {
          await apiAddNode(newNode);
          await addEdge(parentId, newNode.id);
          
          // Auto-expand the parent node to show the new child
          setExpandedNodes((prev) => ({
            ...prev,
            [parentId]: true,
          }));
        } catch (error) {
          console.error("Error adding node:", error);
        }
      }
    } else {
      setNodes((prev) => [
        ...prev,
        {
          id: newNode.id,
          data: { 
            label: newNode.label,
            status: "In Progress" 
          },
          position: { x: newNode.position_x, y: newNode.position_y },
          style: {
            backgroundColor: newNode.color,
            color: "white",
            borderRadius: "8px",
            padding: "12px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            border: "none",
            minWidth: "180px",
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

  const updateNodeStatus = async (id: string, status: string) => {
    const statusColor = STATUS_OPTIONS.find(s => s.label === status)?.color || "#1976d2";
    
    setNodes((prev) =>
      prev.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                status: status
              },
              style: {
                ...node.style,
                backgroundColor: statusColor,
              },
            }
          : node
      )
    );
    
    try {
      // Update node color in database to match status color
      await updateNodeLabel(id, nodeLabel, statusColor);
    } catch (error) {
      console.error("Error updating node color:", error);
    }
  };

  const onNodeClick: NodeMouseHandler = (event, node) => {
    setSelectedNodeId(node.id);
    setNodeLabel(node.data?.label || "");
    setNodeColor(node.style?.backgroundColor || "#1976d2");
    setDrawerOpen(true);
  };
  const onNodeDragStop: NodeDragHandler = async (event, node) => {
    try {
      console.log("Sending node update:", {
        id: node.id,
        position_x: node.position.x,
        position_y: node.position.y,
      });
  
      await fetch("/api/position", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: node.id, 
          position_x: node.position.x,
          position_y: node.position.y,
        }),
      });
    } catch (error) {
      console.error("Error updating node position:", error);
    }
  };
  
  

  const handleUpdateNodeLabel = async (id: string) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === id ? { 
          ...node, 
          data: { ...node.data, label: nodeLabel },
          style: {
            ...node.style,
            backgroundColor: nodeColor,
          },
        } : node
      )
    );

    try {
      await apiUpdateNodeLabel(id, nodeLabel, nodeColor);
      // Update the color in the database
      await updateNodeLabel(id, nodeLabel, nodeColor);
    } catch (error) {
      console.error("Error updating node:", error);
    }
  };

  const toggleNodeExpansion = (nodeId: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const filteredNodes = searchQuery 
    ? nodes.filter(node => 
        node.data.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : nodes;

  const getChildNodes = (parentNodeId: string) => {
    return filteredNodes.filter((node) =>
      edges.some((edge) => edge.source === parentNodeId && edge.target === node.id)
    );
  };
  const renderNodeHierarchy = (parentNodeId: string, depth = 0) => {
    const childNodes = getChildNodes(parentNodeId);
    if (childNodes.length === 0) return null;

    return (
      <Box>
        {childNodes.map((node) => {
          const nodeStatus = node.data.status || "In Progress";
          const statusColor = STATUS_OPTIONS.find(s => s.label === nodeStatus)?.color || "#1976d2";
          const hasChildren = getChildNodes(node.id).length > 0;
    
          return (
            <Box 
              key={node.id} 
              sx={{ 
                mb: 1,
                ml: depth > 0 ? 2.5 : 0,
                pl: depth > 0 ? 0.5 : 0,
                borderLeft: depth > 0 ? `1px solid ${alpha('#1976d2', 0.3)}` : 'none',
                mt: depth > 0 ? 0.5 : 0,
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  py: 0.75,
                  borderBottom: `1px solid ${alpha(statusColor, 0.15)}`,
                  '&:hover': {
                    bgcolor: alpha(statusColor, 0.05),
                  },
                  '&:hover .event-actions': {
                    opacity: 1,
                    visibility: 'visible',
                  },
                  transition: 'background-color 0.2s',
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  cursor: hasChildren ? 'pointer' : 'default',
                }}
                onClick={() => {
                  if (hasChildren) {
                    toggleNodeExpansion(node.id);
                  }
                }}
              >
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the parent onClick
                    toggleNodeExpansion(node.id);
                  }}
                  sx={{
                    backgroundColor: hasChildren ? alpha(statusColor, 0.8) : 'transparent',
                    color: hasChildren ? "white" : alpha(statusColor, 0.5),
                    borderRadius: "50%",
                    width: 26,
                    height: 26,
                    border: hasChildren ? 'none' : `1px dashed ${alpha(statusColor, 0.5)}`,
                    "&:hover": { 
                      backgroundColor: hasChildren ? alpha(statusColor, 0.9) : alpha(statusColor, 0.1) 
                    },
                    flexShrink: 0,
                    ml: 0.5,
                    mr: 1,
                  }}
                >
                  {hasChildren && (expandedNodes[node.id] ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />)}
                  {!hasChildren && <Timeline fontSize="small" />}
                </IconButton>
    
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <Tooltip title={node.data.label || "Unnamed Event"}>
                    <Typography 
                      variant="body2" 
                      fontWeight="medium" 
                      sx={{ 
                        lineHeight: 1.2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                      }}
                    >
                      {node.data.label || "Unnamed Event"}
                    </Typography>
                  </Tooltip>
                  <Chip 
                    label={nodeStatus} 
                    size="small" 
                    sx={{ 
                      bgcolor: alpha(statusColor, 0.1), 
                      color: statusColor,
                      fontWeight: 500,
                      fontSize: "0.7rem",
                      height: 20,
                      ml: 1,
                    }} 
                  /> 
                </Box>
    
                <Box 
                  className="event-actions"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    opacity: { xs: 1, sm: 0 },
                    visibility: { xs: 'visible', sm: 'hidden' },
                    transition: 'opacity 0.2s, visibility 0.2s',
                    mr: 0.5,
                  }}
                >
                  <Tooltip title="Add Child Event">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddNode(node.id);
                      }}
                      sx={{ 
                        color: "#9c27b0", 
                        bgcolor: alpha("#9c27b0", 0.1),
                        "&:hover": { bgcolor: alpha("#9c27b0", 0.2) },
                        ml: 0.5,
                        p: 0.5 
                      }}
                    >
                      <AddCircleOutline fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Mark as Complete">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateNodeStatus(node.id, "Completed");
                      }}
                      sx={{ 
                        color: "#2e7d32", 
                        bgcolor: alpha("#2e7d32", 0.1),
                        "&:hover": { bgcolor: alpha("#2e7d32", 0.2) },
                        ml: 0.5,
                        p: 0.5 
                      }}
                    >
                      <CheckCircle fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Edit Event">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNodeId(node.id);
                        setNodeLabel(node.data.label);
                        setNodeColor(node.style?.backgroundColor ?? "#1976d2");
                        setDrawerOpen(true);
                      }}
                      sx={{ 
                        color: "#1976d2", 
                        bgcolor: alpha("#1976d2", 0.1),
                        "&:hover": { bgcolor: alpha("#1976d2", 0.2) },
                        ml: 0.5,
                        p: 0.5 
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Delete Event">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNode(node.id);
                      }}
                      sx={{ 
                        color: "#d32f2f", 
                        bgcolor: alpha("#d32f2f", 0.1),
                        "&:hover": { bgcolor: alpha("#d32f2f", 0.2) },
                        ml: 0.5,
                        p: 0.5 
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              {expandedNodes[node.id] && renderNodeHierarchy(node.id, depth + 1)}
            </Box>
          );
        })}
      </Box>
    );
    }
    return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3} color="primary">
        Event Flow Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Left Section - Hierarchy View */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              height: "calc(100vh - 150px)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h5" fontWeight="bold" color="primary">
                Event Hierarchy
              </Typography>
              
              <Tooltip title="Add Root Event">
                <Fab
                  color="primary"
                  size="small"
                  onClick={() => {
                    setSelectedNodeId(null);
                    handleAddNode();
                  }}
                >
                  <Add />
                </Fab>
              </Tooltip>
            </Box>
            
            <TextField
              fullWidth
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mb: 2 }}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <Box 
              sx={{ 
                overflowY: "auto", 
                flex: 1,
                pr: 1,
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#bbbbbb",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "#eeeeee",
                  borderRadius: "4px",
                }
              }}
            >
              {filteredNodes
                .filter((node) => !edges.some((edge) => edge.target === node.id))
                .map((parentNode) => {
                  const nodeStatus = parentNode.data.status || "In Progress";
                  const statusColor = STATUS_OPTIONS.find(s => s.label === nodeStatus)?.color || "#1976d2";
                  const hasChildren = getChildNodes(parentNode.id).length > 0;
                  
                  return (
                    <Box key={parentNode.id} sx={{ mb: 1 }}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          py: 0.75,
                          borderBottom: `1px solid ${alpha(statusColor, 0.15)}`,
                          '&:hover': {
                            bgcolor: alpha(statusColor, 0.05),
                          },
                          '&:hover .event-actions': {
                            opacity: 1,
                            visibility: 'visible',
                          },
                          transition: 'background-color 0.2s',
                          borderTopRightRadius: 0,
                          borderBottomRightRadius: 0,
                          cursor: hasChildren ? 'pointer' : 'default',
                        }}
                        onClick={() => {
                          if (hasChildren) {
                            toggleNodeExpansion(parentNode.id);
                          }
                        }}
                      >
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the parent onClick
                            toggleNodeExpansion(parentNode.id);
                          }}
                          sx={{
                            backgroundColor: hasChildren ? alpha(statusColor, 0.8) : 'transparent',
                            color: hasChildren ? "white" : alpha(statusColor, 0.5),
                            borderRadius: "50%",
                            width: 26,
                            height: 26,
                            border: hasChildren ? 'none' : `1px dashed ${alpha(statusColor, 0.5)}`,
                            "&:hover": { 
                              backgroundColor: hasChildren ? alpha(statusColor, 0.9) : alpha(statusColor, 0.1) 
                            },
                            flexShrink: 0,
                            ml: 0.5,
                            mr: 1,
                          }}
                        >
                          {hasChildren && (expandedNodes[parentNode.id] ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />)}
                          {!hasChildren && <Timeline fontSize="small" />}
                        </IconButton>
    
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                          <Tooltip title={parentNode.data.label || "Unnamed Event"}>
                            <Typography 
                              variant="body2" 
                              fontWeight="medium" 
                              sx={{ 
                                lineHeight: 1.2,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                flex: 1,
                              }}
                            >
                              {parentNode.data.label || "Unnamed Event"}
                            </Typography>
                          </Tooltip>
                          <Chip 
                            label={nodeStatus} 
                            size="small" 
                            sx={{ 
                              bgcolor: alpha(statusColor, 0.1), 
                              color: statusColor,
                              fontWeight: 500,
                              fontSize: "0.7rem",
                              height: 20,
                              ml: 1,
                            }} 
                          /> 
                        </Box>
    
                        <Box 
                          className="event-actions"
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            opacity: { xs: 1, sm: 0 },
                            visibility: { xs: 'visible', sm: 'hidden' },
                            transition: 'opacity 0.2s, visibility 0.2s',
                            mr: 0.5,
                          }}
                        >
                          <Tooltip title="Add Child Event">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddNode(parentNode.id);
                              }}
                              sx={{ 
                                color: "#9c27b0", 
                                bgcolor: alpha("#9c27b0", 0.1),
                                "&:hover": { bgcolor: alpha("#9c27b0", 0.2) },
                                ml: 0.5,
                                p: 0.5 
                              }}
                            >
                              <AddCircleOutline fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Mark as Complete">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateNodeStatus(parentNode.id, "Completed");
                              }}
                              sx={{ 
                                color: "#2e7d32", 
                                bgcolor: alpha("#2e7d32", 0.1),
                                "&:hover": { bgcolor: alpha("#2e7d32", 0.2) },
                                ml: 0.5,
                                p: 0.5 
                              }}
                            >
                              <CheckCircle fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Edit Event">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNodeId(parentNode.id);
                                setNodeLabel(parentNode.data.label);
                                setNodeColor(parentNode.style?.backgroundColor ?? "#1976d2");
                                setDrawerOpen(true);
                              }}
                              sx={{ 
                                color: "#1976d2", 
                                bgcolor: alpha("#1976d2", 0.1),
                                "&:hover": { bgcolor: alpha("#1976d2", 0.2) },
                                ml: 0.5,
                                p: 0.5 
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Delete Event">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNode(parentNode.id);
                              }}
                              sx={{ 
                                color: "#d32f2f", 
                                bgcolor: alpha("#d32f2f", 0.1),
                                "&:hover": { bgcolor: alpha("#d32f2f", 0.2) },
                                ml: 0.5,
                                p: 0.5 
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
    
                      {expandedNodes[parentNode.id] && renderNodeHierarchy(parentNode.id)}
                    </Box>
                  );
                })}
            </Box>
          </Paper>
        </Grid>

        {/* Right Section - Graph */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={3} 
            sx={{ 
              height: "calc(100vh - 150px)", 
              borderRadius: 3, 
              overflow: "hidden",
              position: "relative"
            }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              onNodeDragStop={onNodeDragStop}
              fitView
              attributionPosition="bottom-right"
            >
              <Tooltip title="Add Event">
                <Fab
                  color="primary"
                  aria-label="add"
                  onClick={() => {
                    if (!selectedNodeId) {
                      handleAddNode();
                    }
                  }}
                  sx={{
                    position: "absolute",
                    bottom: 16,
                    right: 16,
                    zIndex: 1000,
                  }}
                >
                  <Add />
                </Fab>
              </Tooltip>
              <Background color="#f0f0f0" gap={16} />
              <MiniMap 
                nodeStrokeColor={(n) => {
                  return n.style?.backgroundColor || "#1976d2";
                }}
                nodeColor={(n) => {
                  return n.style?.backgroundColor || "#1976d2";
                }}
                maskColor="rgba(0, 0, 0, 0.1)"
              />
              <Controls />
            </ReactFlow>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen && selectedNodeId !== null}
        onClose={() => setDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': { 
            width: 340,
            borderRadius: '16px 0 0 16px',
            p: 3,
            boxSizing: 'border-box',
          },
        }}
      >
        <Typography variant="h5" fontWeight="bold" color="primary" mb={3}>
          Edit Event
        </Typography>
        
        <TextField
          label="Event Name"
          value={nodeLabel}
          onChange={(e) => setNodeLabel(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Label color="action" />
              </InputAdornment>
            ),
          }}
        />
        
        <Typography variant="subtitle1" fontWeight="medium" mb={1}>
          Status
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
          {STATUS_OPTIONS.map((status) => (
            <Chip
              key={status.label}
              label={status.label}
              onClick={() => {
                if (selectedNodeId) {
                  updateNodeStatus(selectedNodeId, status.label);
                }
              }}
              sx={{
                backgroundColor: alpha(status.color, 0.1),
                color: status.color,
                fontWeight: 500,
                border: `1px solid ${alpha(status.color, 0.3)}`,
                '&:hover': {
                  backgroundColor: alpha(status.color, 0.2),
                },
              }}
            />
          ))}
        </Box>
        
        <Typography variant="subtitle1" fontWeight="medium" mb={1}>
          Color
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1} mb={4}>
          {["#1976d2", "#2e7d32", "#ed6c02", "#d32f2f", "#9c27b0", "#0288d1"].map((color) => (
            <Box
              key={color}
              onClick={() => setNodeColor(color)}
              sx={{
                width: 36,
                height: 36,
                backgroundColor: color,
                borderRadius: '50%',
                cursor: 'pointer',
                border: nodeColor === color ? '2px solid #000' : 'none',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
            />
          ))}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box display="flex" gap={2} mt={2}>
          <Button
            variant="contained"
            fullWidth
            color="primary"
            startIcon={<Save />}
            onClick={() => {
              if (selectedNodeId) {
                handleUpdateNodeLabel(selectedNodeId);
                setDrawerOpen(false);
              }
            }}
          >
            Save Changes
          </Button>
          
          <Button
            variant="outlined"
            fullWidth
            color="inherit"
            startIcon={<Cancel />}
            onClick={() => setDrawerOpen(false)}
          >
            Cancel
          </Button>
        </Box>
        
        <Box mt={4}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Connected Events
          </Typography>
          <List dense>
            {selectedNodeId && nodes
              .filter((node) =>
                edges.some(
                  (edge) =>
                    (edge.source === selectedNodeId && edge.target === node.id) ||
                    (edge.target === selectedNodeId && edge.source === node.id)
                )
              )
              .map((connectedNode) => (
                <ListItem key={connectedNode.id}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Event style={{ color: connectedNode.style?.backgroundColor }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={connectedNode.data.label}
                    secondary={
                      edges.some((edge) => edge.source === selectedNodeId && edge.target === connectedNode.id)
                        ? "Child Event"
                        : "Parent Event"
                    }
                  />
                </ListItem>
              ))}
          </List>
        </Box>
      </Drawer>
    </Container>
  );
}