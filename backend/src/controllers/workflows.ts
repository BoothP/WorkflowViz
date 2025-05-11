import { Response } from 'express';
import { parseWorkflow as parseWorkflowService } from '../services/workflows';
import { ParseWorkflowRequest, Node, Edge } from '../interfaces/workflow';
import { Workflow, IWorkflow } from '../models/Workflow';
import { AuthenticatedRequest } from '../middleware/jwt';
import mongoose from 'mongoose';

export const parseWorkflowHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { prompt } = req.body as ParseWorkflowRequest;

    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Prompt is required and must be a non-empty string',
          code: 'INVALID_PROMPT',
        },
      });
    }

    // Parse workflow
    const result = await parseWorkflowService(prompt);

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Return successful response
    res.json(result);
  } catch (error) {
    console.error('Workflow parsing error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'An error occurred while parsing the workflow',
        code: 'INTERNAL_ERROR',
      },
    });
  }
};

// --- CRUD Operations ---

// @desc    List all workflows for the authenticated user
// @route   GET /api/workflows
// @access  Private
export const listWorkflows = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const workflows = await Workflow.find({ ownerId: req.user.id }).sort({ updatedAt: -1 });
    res.status(200).json(workflows);
  } catch (error) {
    console.error('List workflows error:', error);
    res.status(500).json({ message: 'Error fetching workflows', error: (error as Error).message });
  }
};

// @desc    Create a new workflow
// @route   POST /api/workflows
// @access  Private
interface CreateWorkflowBody {
  name: string;
  nodes: Node[];
  edges: Edge[];
}
export const createWorkflow = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const { name, nodes, edges } = req.body as CreateWorkflowBody;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: 'Workflow name is required' });
    }
    // Basic validation for nodes/edges (more thorough with Zod in schema or here)
    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
      return res.status(400).json({ message: 'Nodes and edges must be arrays' });
    }

    const newWorkflowData: Partial<IWorkflow> = {
      name,
      nodes,
      edges,
      ownerId: new mongoose.Types.ObjectId(req.user.id),
    };

    const workflow = await Workflow.create(newWorkflowData);
    res.status(201).json(workflow);
  } catch (error) {
    console.error('Create workflow error:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ message: 'Error creating workflow', error: (error as Error).message });
  }
};

// @desc    Get a single workflow by ID
// @route   GET /api/workflows/:id
// @access  Private
export const getWorkflowById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid workflow ID format' });
    }

    const workflow = await Workflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    if (workflow.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to access this workflow' });
    }

    res.status(200).json(workflow);
  } catch (error) {
    console.error('Get workflow by ID error:', error);
    res.status(500).json({ message: 'Error fetching workflow', error: (error as Error).message });
  }
};

// @desc    Update a workflow by ID
// @route   PUT /api/workflows/:id
// @access  Private
interface UpdateWorkflowBody {
  name?: string;
  nodes?: Node[];
  edges?: Edge[];
}
export const updateWorkflow = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid workflow ID format' });
    }

    const workflow = await Workflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    if (workflow.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to update this workflow' });
    }

    const { name, nodes, edges } = req.body as UpdateWorkflowBody;

    if (name !== undefined) workflow.name = name;
    if (nodes !== undefined) workflow.nodes = nodes;
    if (edges !== undefined) workflow.edges = edges;
    // Add more specific validation if needed
    if (name === '' && name !== undefined)
      return res.status(400).json({ message: 'Workflow name cannot be empty if provided' });

    const updatedWorkflow = await workflow.save();
    res.status(200).json(updatedWorkflow);
  } catch (error) {
    console.error('Update workflow error:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ message: 'Error updating workflow', error: (error as Error).message });
  }
};

// @desc    Delete a workflow by ID
// @route   DELETE /api/workflows/:id
// @access  Private
export const deleteWorkflow = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid workflow ID format' });
    }

    const workflow = await Workflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    if (workflow.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to delete this workflow' });
    }

    await workflow.deleteOne(); // or Workflow.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: 'Workflow deleted successfully' });
  } catch (error) {
    console.error('Delete workflow error:', error);
    res.status(500).json({ message: 'Error deleting workflow', error: (error as Error).message });
  }
};
