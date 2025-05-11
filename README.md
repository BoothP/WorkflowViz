# WorkflowViz

A minimalist, AI-driven workflow visualization platform that transforms plain-language workflow descriptions into interactive diagrams.

## Overview

WorkflowViz helps non-technical consultants and service-based agencies visualize end-to-end business process automations. Simply describe your desired workflow in natural language, and the system instantly generates clear, minimalist diagrams.

### Key Features

- Natural language workflow input
- AI-powered workflow parsing
- Interactive diagram rendering
- Node inspection and editing
- Workflow simulation
- Secure user authentication
- Workflow persistence and management

## Local Development Setup

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ and npm
- Git

### Quick Start with Docker

1. Clone the repository:

   ```bash
   git clone https://github.com/BoothP/WorkflowViz.git
   cd WorkflowViz
   ```

2. Copy environment files:

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. Start the development environment:

   ```bash
   docker-compose up --build
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - MongoDB: mongodb://localhost:27017

### Manual Setup (without Docker)

#### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

#### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

### Production Deployment

1. Build the Docker images:

   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. Deploy using Docker Compose:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Environment Variables

Ensure the following environment variables are set in production:

- `NODE_ENV=production`
- `MONGODB_URI` (MongoDB connection string)
- `JWT_SECRET` (for authentication)
- `DEEPSEEK_API_KEY` (for AI workflow parsing)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

### Development Guidelines

- Follow the TypeScript style guide
- Write unit tests for new features
- Update documentation as needed
- Use conventional commits

## Contact

- Project Owner: Olusegun Adebiyi
- GitHub: [@BoothP](https://github.com/BoothP)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
