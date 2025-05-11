import express from 'express';
import {
  parseWorkflowHandler,
  listWorkflows,
  createWorkflow,
  getWorkflowById,
  updateWorkflow,
  deleteWorkflow,
} from '../controllers/workflows.js';
import { authenticateJWT } from '../middleware/jwt.js';

const router = express.Router();

/**
 * @route   POST /api/workflows/parse
 * @desc    Parse natural language workflow description into structured format
 * @access  Public
 */
router.post('/parse', parseWorkflowHandler);

// --- CRUD Routes for Workflows ---
// All routes below are protected by JWT authentication

// GET /api/workflows - List all workflows for the authenticated user
router.get('/', authenticateJWT, listWorkflows);

// POST /api/workflows - Create a new workflow
router.post('/', authenticateJWT, createWorkflow);

// GET /api/workflows/:id - Retrieve a specific workflow by ID
router.get('/:id', authenticateJWT, getWorkflowById);

// PUT /api/workflows/:id - Update a specific workflow by ID
router.put('/:id', authenticateJWT, updateWorkflow);

// DELETE /api/workflows/:id - Delete a specific workflow by ID
router.delete('/:id', authenticateJWT, deleteWorkflow);

export default router;
