export type NodeType = 'trigger' | 'action' | 'filter' | 'llmAgent';

export interface Node {
  id: string;
  type: NodeType;
  label: string;
  config: Record<string, any>;
}

export interface Edge {
  source: string;
  target: string;
  label?: string;
}

export interface Workflow {
  id?: string;
  name?: string;
  ownerId?: string;
  nodes: Node[];
  edges: Edge[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ParseWorkflowRequest {
  prompt: string;
}

export interface ParseWorkflowResponse {
  success: boolean;
  data?: {
    nodes: Node[];
    edges: Edge[];
  };
  error?: {
    message: string;
    code?: string;
  };
}
