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
import {
  useWorkflow,
  useCreateWorkflow,
  useUpdateWorkflow,
  CreateWorkflowData,
  UpdateWorkflowData,
} from "@/hooks/useWorkflows";

SyntaxHighlighter.registerLanguage("json", json);

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [workflowName, setWorkflowName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [refactorError, setRefactorError] = useState<string | null>(null);
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
    data: loadedWorkflow,
    isLoading: loadingWorkflow,
    error: workflowLoadError,
    refetch: fetchWorkflow,
  } = useWorkflow(id || null);
  const {
    mutateAsync: createWorkflowMutation,
    isPending: creatingWorkflow,
    error: createWorkflowError,
  } = useCreateWorkflow();
  const {
    mutateAsync: updateWorkflowMutation,
    isPending: updatingWorkflow,
    error: updateWorkflowError,
  } = useUpdateWorkflow();

  useEffect(() => {
    if (id) {
      fetchWorkflow();
    }
  }, [id, fetchWorkflow]);

  useEffect(() => {
    if (loadedWorkflow) {
      setNodes(loadedWorkflow.nodes as Node[]);
      setEdges(loadedWorkflow.edges as Edge[]);
      setWorkflowName(loadedWorkflow.name);
    } else if (!id) {
      setNodes([]);
      setEdges([]);
      setWorkflowName("");
    }
  }, [loadedWorkflow, id]);

  const handleSave = async () => {
    try {
      const workflowData: CreateWorkflowData | UpdateWorkflowData = {
        name: workflowName || "Untitled Workflow",
        nodes,
        edges,
      };

      if (id) {
        await updateWorkflowMutation({
          id,
          data: workflowData as UpdateWorkflowData,
        });
      } else {
        const newWorkflow = await createWorkflowMutation(
          workflowData as CreateWorkflowData
        );
        if (newWorkflow?._id) {
          navigate(`/editor/${newWorkflow._id}`);
        }
      }
      setParseError(null);
    } catch (error) {
      console.error("Failed to save workflow:", error);
      const specificError = updateWorkflowError || createWorkflowError || error;
      setParseError(
        `Failed to save workflow: ${(specificError as Error)?.message || "Please try again."}`
      );
    }
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setWorkflowName(e.target.value);
  };

  const handlePromptChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    setParseError(null);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setParseError("Please enter a prompt");
      return;
    }
    setIsGenerating(true);
    setParseError(null);
    try {
      const response = await fetch("/api/workflows/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      if (!response.ok) {
        const errData = await response
          .json()
          .catch(() => ({ message: "Failed to parse workflow response" }));
        throw new Error(errData.message || "Failed to parse workflow");
      }
      const data = await response.json();
      if (data.success === false) {
        throw new Error(data.error?.message || "Parsing returned an error");
      }
      setNodes(data.data.nodes as Node[]);
      setEdges(data.data.edges as Edge[]);
      setWorkflowName(data.data.name || "Generated Workflow");
    } catch (error) {
      console.error("Failed to generate workflow:", error);
      setParseError(`Failed to generate workflow: ${(error as Error).message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefactor = async () => {
    if (nodes.length === 0) {
      setRefactorError("No workflow to refactor");
      return;
    }
    setIsRefactoring(true);
    setRefactorError(null);
    try {
      const response = await fetch("/api/workflows/refactor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes, edges }),
      });
      if (!response.ok) {
        const errData = await response
          .json()
          .catch(() => ({ message: "Failed to parse refactor response" }));
        throw new Error(errData.message || "Failed to refactor workflow");
      }
      const data = await response.json();
      setRefactoredData({
        nodes: data.nodes as Node[],
        edges: data.edges as Edge[],
      });
      setShowDiffModal(true);
    } catch (error) {
      console.error("Failed to refactor workflow:", error);
      setRefactorError(
        `Failed to refactor workflow: ${(error as Error).message}`
      );
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

  const formatJsonForDisplay = (data: any) => {
    return JSON.stringify(data, null, 2);
  };

  const displayError =
    parseError ||
    refactorError ||
    workflowLoadError?.message ||
    updateWorkflowError?.message ||
    createWorkflowError?.message;

  if (loadingWorkflow && id) {
    return <div className="p-4">Loading workflow...</div>;
  }

  return (
    <div className="flex h-screen flex-col">
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
        {displayError && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {displayError}
          </div>
        )}
      </div>
      <div className="flex-1 relative">
        <WorkflowCanvas initialNodes={nodes} initialEdges={edges} />
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
                  {formatJsonForDisplay({ nodes, edges })}
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
                  {refactoredData ? formatJsonForDisplay(refactoredData) : ""}
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
