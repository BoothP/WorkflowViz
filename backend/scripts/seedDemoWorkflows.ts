import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Workflow } from '../src/models/Workflow';

// Load environment variables
dotenv.config();

const demoWorkflows = [
  {
    name: 'LinkedIn Lead Enrichment',
    nodes: [
      {
        id: 'node-1',
        type: 'trigger',
        label: 'New LinkedIn Connection',
        config: {
          source: 'LinkedIn',
          event: 'newConnection',
          filters: {
            companySize: '>100',
            industry: ['Technology', 'SaaS'],
          },
        },
      },
      {
        id: 'node-2',
        type: 'action',
        label: 'Fetch Apollo Data',
        config: {
          api: 'Apollo.io',
          method: 'getContact',
          fields: ['email', 'phone', 'company', 'title'],
        },
      },
      {
        id: 'node-3',
        type: 'filter',
        label: 'Decision Gate',
        config: {
          condition: 'contact.email && contact.company.revenue > 1000000',
        },
      },
      {
        id: 'node-4',
        type: 'action',
        label: 'Create HubSpot Contact',
        config: {
          api: 'HubSpot',
          method: 'createContact',
          mapping: {
            email: 'contact.email',
            firstname: 'contact.firstName',
            lastname: 'contact.lastName',
            company: 'contact.company.name',
          },
        },
      },
    ],
    edges: [
      {
        source: 'node-1',
        target: 'node-2',
        label: 'onNewConnection',
      },
      {
        source: 'node-2',
        target: 'node-3',
        label: 'onDataFetched',
      },
      {
        source: 'node-3',
        target: 'node-4',
        label: 'onQualified',
      },
    ],
  },
  {
    name: 'Customer Support Automation',
    nodes: [
      {
        id: 'node-1',
        type: 'trigger',
        label: 'New Support Ticket',
        config: {
          source: 'Zendesk',
          event: 'ticketCreated',
          filters: {
            priority: ['high', 'urgent'],
          },
        },
      },
      {
        id: 'node-2',
        type: 'llmAgent',
        label: 'Analyze Ticket',
        config: {
          model: 'gpt-4',
          prompt:
            'Analyze the support ticket and categorize it based on: 1) Issue type 2) Priority 3) Required expertise',
          outputFormat: 'json',
        },
      },
      {
        id: 'node-3',
        type: 'action',
        label: 'Assign to Team',
        config: {
          api: 'Zendesk',
          method: 'updateTicket',
          mapping: {
            assignee_id: 'analysis.teamId',
            tags: 'analysis.tags',
          },
        },
      },
    ],
    edges: [
      {
        source: 'node-1',
        target: 'node-2',
        label: 'onTicketCreated',
      },
      {
        source: 'node-2',
        target: 'node-3',
        label: 'onAnalysisComplete',
      },
    ],
  },
  {
    name: 'Content Distribution Pipeline',
    nodes: [
      {
        id: 'node-1',
        type: 'trigger',
        label: 'New Blog Post',
        config: {
          source: 'WordPress',
          event: 'postPublished',
          filters: {
            categories: ['Technology', 'AI'],
          },
        },
      },
      {
        id: 'node-2',
        type: 'llmAgent',
        label: 'Generate Social Posts',
        config: {
          model: 'gpt-4',
          prompt:
            'Create engaging social media posts for Twitter, LinkedIn, and Facebook based on the blog content',
          outputFormat: 'json',
        },
      },
      {
        id: 'node-3',
        type: 'action',
        label: 'Schedule Posts',
        config: {
          api: 'Buffer',
          method: 'createPosts',
          platforms: ['twitter', 'linkedin', 'facebook'],
        },
      },
    ],
    edges: [
      {
        source: 'node-1',
        target: 'node-2',
        label: 'onPostPublished',
      },
      {
        source: 'node-2',
        target: 'node-3',
        label: 'onPostsGenerated',
      },
    ],
  },
];

async function seedWorkflows() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/workflowviz');
    console.log('Connected to MongoDB');

    // Clear existing workflows
    await Workflow.deleteMany({});
    console.log('Cleared existing workflows');

    // Insert demo workflows
    const workflows = await Workflow.insertMany(demoWorkflows);
    console.log(`Successfully seeded ${workflows.length} workflows`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding workflows:', error);
    process.exit(1);
  }
}

// Run the seeder
seedWorkflows();
