import React, { useState, useCallback } from "react";
import ReactFlow, {
  ReactFlowProvider,
  Node as RFNode,
  Edge as RFEdge,
  FitViewOptions,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  NodeMouseEvent,
  Controls,
  Background,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import "reactflow/dist/style.css";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface CustomNodeData {
  label: string;
  config: Record<string, any>;
}

type AppNode = RFNode<CustomNodeData>;
type AppEdge = RFEdge;

interface WorkflowCanvasProps {
  initialNodes: AppNode[];
  initialEdges: AppEdge[];
  onNodesChange: (nodes: AppNode[]) => void;
  onEdgesChange: (edges: AppEdge[]) => void;
  onConnect?: OnConnect;
}

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const WorkflowCanvas = ({
  initialNodes,
  initialEdges,
  onNodesChange,
  onEdgesChange,
  onConnect,
}: WorkflowCanvasProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [selectedNode, setSelectedNode] = useState<AppNode | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (onConnect) {
        onConnect(connection);
      }
    },
    [onConnect]
  );

  const handleNodeClick = useCallback(
    (event: NodeMouseEvent, node: AppNode) => {
      setSelectedNode(node);
      setIsDrawerOpen(true);
    },
    []
  );

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(applyNodeChanges(changes, initialNodes));
    },
    [initialNodes, onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(applyEdgeChanges(changes, initialEdges));
    },
    [initialEdges, onEdgesChange]
  );

  return (
    <div className="w-full h-full relative">
      <div className="w-full h-full bg-gray-50 border border-gray-300 rounded-lg shadow-sm">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={handleConnect}
            onNodeClick={handleNodeClick}
            fitView
            fitViewOptions={fitViewOptions}
            nodesDraggable={true}
            edgesFocusable={true}
            elementsSelectable={true}
            className="min-h-full bg-white rounded-lg"
          >
            <Background />
            <Controls />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      {selectedNode && (
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent className="w-[400px] sm:max-w-[calc(100vw-32px)] md:w-[540px] fixed bottom-0 right-0 top-0 h-full flex flex-col bg-white border-l border-gray-200 shadow-xl">
            <DrawerHeader className="p-4 border-b border-gray-200">
              <DrawerTitle className="text-lg font-medium text-gray-900">
                Node: {selectedNode.data.label || selectedNode.id}
              </DrawerTitle>
              <DrawerDescription className="text-xs text-gray-500 mt-1">
                ID: {selectedNode.id}
              </DrawerDescription>
            </DrawerHeader>

            <div className="p-4 overflow-y-auto flex-grow space-y-3">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Type
                </h4>
                <p className="text-sm text-gray-800 bg-gray-100 p-2 rounded-md font-mono select-all">
                  {selectedNode.type || "N/A"}
                </p>
              </div>

              {selectedNode.data.label && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Label
                  </h4>
                  <p className="text-sm text-gray-800 bg-gray-100 p-2 rounded-md select-all">
                    {selectedNode.data.label}
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Configuration Data
                </h4>
                <pre className="text-xs text-gray-700 bg-gray-100 p-3 rounded-md overflow-x-auto whitespace-pre-wrap break-words select-all">
                  {JSON.stringify(selectedNode.data.config, null, 2)}
                </pre>
              </div>
            </div>

            <DrawerFooter className="p-4 border-t border-gray-200 mt-auto">
              <DrawerClose asChild>
                <button
                  onClick={handleDrawerClose}
                  className="w-full px-4 py-2 text-sm font-medium bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Close
                </button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
};

export default WorkflowCanvas;
