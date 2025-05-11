import { useState, useEffect, ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Node, Edge } from "reactflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import { atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import WorkflowCanvas from "@/components/WorkflowCanvas";
import { CanvasTooltips } from "@/components/CanvasTooltips";
import {
  useWorkflow,
  useCreateWorkflow,
  useUpdateWorkflow,
} from "@/hooks/useWorkflows";

// Register JSON language
SyntaxHighlighter.registerLanguage("json", json);

type WorkflowData = {
  name: string;
  nodes: Node[];
  edges: Edge[];
};

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [workflowName, setWorkflowName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [refactoredData, setRefactoredData] = useState<{
    nodes: Node[];
    edges: Edge[];
  } | null>(null);
  const [previousState, setPreviousState] = useState<{
    nodes: Node[];
    edges: Edge[];
  } | null>(null);

  const {
    workflow,
    loading: loadingWorkflow,
    fetchWorkflow,
  } = useWorkflow(id || "");
  const { createWorkflow, loading: creatingWorkflow } = useCreateWorkflow();
  const { updateWorkflow, loading: updatingWorkflow } = useUpdateWorkflow();

  useEffect(() => {
    if (id) {
      fetchWorkflow();
    }
  }, [id, fetchWorkflow]);

  useEffect(() => {
    if (workflow) {
      setNodes(workflow.nodes);
      setEdges(workflow.edges);
      setWorkflowName(workflow.name);
    }
  }, [workflow]);

  const handleSave = async () => {
    try {
      const workflowData: WorkflowData = {
        name: workflowName || "Untitled Workflow",
        nodes,
        edges,
      };

      if (id) {
        await updateWorkflow(id, workflowData);
      } else {
        const newWorkflow = await createWorkflow(workflowData);
        navigate(`/editor/${newWorkflow._id}`);
      }
    } catch (error) {
      console.error("Failed to save workflow:", error);
      setError("Failed to save workflow. Please try again.");
    }
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setWorkflowName(e.target.value);
  };

  const handlePromptChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/workflows/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to parse workflow");
      }

      const data = await response.json();
      setNodes(data.nodes);
      setEdges(data.edges);
      setWorkflowName(data.name || "Generated Workflow");
    } catch (error) {
      console.error("Failed to generate workflow:", error);
      setError("Failed to generate workflow. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefactor = async () => {
    if (nodes.length === 0) {
      setError("No workflow to refactor");
      return;
    }

    setIsRefactoring(true);
    setError(null);

    try {
      const response = await fetch("/api/workflows/refactor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) {
        throw new Error("Failed to refactor workflow");
      }

      const data = await response.json();
      setRefactoredData(data);
      setShowDiffModal(true);
    } catch (error) {
      console.error("Failed to refactor workflow:", error);
      setError("Failed to refactor workflow. Please try again.");
    } finally {
      setIsRefactoring(false);
    }
  };

  const handleApplyRefactor = () => {
    if (refactoredData) {
      setPreviousState({ nodes, edges });
      setNodes(refactoredData.nodes);
      setEdges(refactoredData.edges);
      setShowDiffModal(false);
      setRefactoredData(null);
    }
  };

  const handleUndo = () => {
    if (previousState) {
      setNodes(previousState.nodes);
      setEdges(previousState.edges);
      setPreviousState(null);
    }
  };

  const formatJson = (data: any) => {
    return JSON.stringify(data, null, 2);
  };

  if (loadingWorkflow && id) {
    return <div>Loading workflow...</div>;
  }

  return (
    <div className="flex h-screen flex-col">
      <CanvasTooltips />
      <div className="flex flex-col gap-4 border-b p-4">
        <div className="flex items-center justify-between">
          <Input
            value={workflowName}
            onChange={handleNameChange}
            placeholder="Workflow Name"
            className="max-w-xs"
          />
          <div className="flex gap-2">
            {previousState && (
              <Button onClick={handleUndo} variant="outline" size="sm">
                Undo
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={creatingWorkflow || updatingWorkflow}
              id="save"
            >
              {creatingWorkflow || updatingWorkflow
                ? "Saving..."
                : "Save Workflow"}
            </Button>
          </div>
        </div>
        <div className="flex gap-4">
          <Textarea
            value={prompt}
            onChange={handlePromptChange}
            placeholder="Describe your workflow in natural language..."
            className="flex-1"
            rows={2}
            id="prompt"
          />
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="whitespace-nowrap"
          >
            {isGenerating ? "Generating..." : "Generate Workflow"}
          </Button>
        </div>
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
      </div>
      <div className="flex-1 relative">
        <div id="canvas" className="absolute inset-0" />
        <WorkflowCanvas
          initialNodes={nodes}
          initialEdges={edges}
          onNodesChange={setNodes}
          onEdgesChange={setEdges}
        />
      </div>
      <div className="border-t p-4">
        <Button
          onClick={handleRefactor}
          disabled={isRefactoring || nodes.length === 0}
          variant="outline"
          className="w-full"
        >
          {isRefactoring ? "Refactoring..." : "Refactor Workflow"}
        </Button>
      </div>

      <Dialog open={showDiffModal} onOpenChange={setShowDiffModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Review Refactoring Changes</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-sm font-medium mb-2">Current Workflow</h3>
              <div className="bg-white rounded border overflow-hidden">
                <SyntaxHighlighter
                  language="json"
                  style={atomOneLight}
                  customStyle={{
                    margin: 0,
                    padding: "1rem",
                    maxHeight: "400px",
                    fontSize: "0.875rem",
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  }}
                >
                  {formatJson({ nodes, edges })}
                </SyntaxHighlighter>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Refactored Workflow</h3>
              <div className="bg-white rounded border overflow-hidden">
                <SyntaxHighlighter
                  language="json"
                  style={atomOneLight}
                  customStyle={{
                    margin: 0,
                    padding: "1rem",
                    maxHeight: "400px",
                    fontSize: "0.875rem",
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  }}
                >
                  {refactoredData ? formatJson(refactoredData) : ""}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDiffModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyRefactor}>Apply Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
