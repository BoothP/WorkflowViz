# WorkflowViz SRS & Technical Specification

_Empowering Non-Technical Consultants to Visualize AI-Driven Automations_

A definitive specification document that articulates both the functional requirements and technical design of WorkflowViz—a platform transforming plain-language workflow descriptions into interactive, minimalist diagrams. This document ensures alignment between stakeholders, developers, and end users, serving as the single source of truth for feature scope, system architecture, and implementation guidelines.

---

## 1. Software Requirements Specification (SRS)

### 1.1 Introduction

**Version History:**

| Version | Date       | Author           | Changes       |
| ------- | ---------- | ---------------- | ------------- |
| 0.1     | 2025-05-08 | Olusegun Adebiyi | Initial draft |

**Stakeholder Sign-Off:**

| Stakeholder      | Role          | Signature | Date |
| ---------------- | ------------- | --------- | ---- |
| Olusegun Adebiyi | Product Owner |           |      |

### 1.2 Purpose

The platform solves the critical challenge faced by non-technical automation consultants and service-based agencies who struggle to specify, pitch, and visualize end-to-end business process automations. Users simply describe desired workflows in natural language, and the system instantly generates clear, minimalist diagrams. This enables accurate client presentations, guides developers on implementation, and aligns teams with a shared visual reference.

### 1.3 Scope

This MVP covers:

- Natural language workflow input on a single-text-field interface.
- Backend LLM parsing to structured workflow JSON (nodes and edges).
- Interactive diagram rendering using React Flow with minimalist styling.
- Node inspection panels, drag-and-drop layout editing, and optional animation simulation.
- Workflow CRUD operations (save, load, rename, delete) and a simple dashboard.

**Out of Scope:**

- Real-time collaboration or multi-user editing on the same canvas.
- Execution of live workflows or actual API integrations; diagrams are purely illustrative.
- Advanced versioning beyond individual saves (e.g., branching, merge conflicts).
- Custom node development beyond core types (trigger, action, filter, LLM agent).
- Mobile-specific interfaces or support for devices smaller than tablets.

### 1.4 Definitions & Acronyms

- **NL:** Natural Language
- **LLM:** Large Language Model
- **MVP:** Minimum Viable Product
- **API:** Application Programming Interface
- **UI:** User Interface
- **JSON:** JavaScript Object Notation

### 1.5 References

1. OpenAI API Documentation (as of 2025-05-08; supports GPT-4.1 model) (techradar.com)
2. React Flow Documentation (v12.6.0) (reactflow\.dev)
3. Tailwind CSS Documentation (v4.1.5) (npmjs.com)
4. Zapier Developer Platform Documentation (as of 2025-05-08) and Zapier Platform CLI v16.5.1 (npmjs.com)
5. OWASP Secure Coding Practices Quick Reference Guide (v2.1) (github.com)

### 1.6 Overview

1. Introduction (purpose, scope, definitions, references, overview)
2. Overall Description (product perspective, functions, user classes, environment)
3. Specific Requirements (functional, external interfaces, performance, data)
4. Non-Functional Requirements (security, performance, usability)
5. Appendices (glossary, data models)

---

## 2. Overall Description

### 2.1 Product Perspective

This platform is a cloud-hosted, single-page web application serving as a pure visualization and specification tool. It does not execute real integrations but simulates workflow logic for client pitches and developer handoffs.

**Dependencies:**

- A JavaScript front end (React) for UI and diagram rendering.
- A Node.js back end to proxy LLM calls and manage persistence.
- Third-party LLM providers (OpenAI or interchangeable) via secure REST APIs.
- MongoDB Atlas for storing user profiles and workflow definitions.

**System Context Diagram:**

```mermaid
graph LR
  U[User/Consultant] -->|NL Prompt| FE[Frontend (React)]
  FE -->|Request| BE[Backend (Node.js)]
  BE -->|LLM API Call| LLM[LLM Provider]
  BE -->|CRUD| DB[MongoDB Atlas]
  BE -->|Response| FE
  FE -->|Diagram Render| U
```

### 2.2 Product Functions

The system provides these major capabilities:

1. **User Authentication:** Secure user onboarding and session management.
2. **Natural Language Workflow Creation:** Convert NL prompts into structured JSON workflows.
3. **Interactive Diagram Canvas:** Render and manipulate node-edge diagrams.
4. **Node Detail Inspection:** Drill into node configurations and metadata.
5. **Drag-and-Drop Editing & Reflow:** Rearrange and reconnect workflow nodes.
6. **Workflow Simulation:** Animate data movement through the diagram.
7. **Workflow Management Dashboard:** CRUD operations on saved workflows.
8. **Admin Monitoring:** View usage metrics and error logs (admin only).

### 2.3 User Classes

- **End User (Consultant):** Creates and edits workflows; views diagrams; manages saved workflows.
- **Developer:** Views exported JSON and diagram specs for implementation.
- **Administrator:** Manages system health, monitors logs, and oversees user activity.

### 2.4 Operating Environment

- **Client:** Modern web browsers (Chrome, Firefox, Edge, Safari) on desktop and tablet; responsive layout for tablets.
- **Server:** Node.js v18+ on any cloud provider; TLS-secured endpoints.
- **Network:** HTTPS connections; minimum 5 Mbps bandwidth recommended for UI responsiveness.

### 2.5 Constraints

- **Performance:** Diagrams limited to 50 nodes for smooth UX; parsing must return results within 5 seconds.
- **Security & Compliance:** GDPR-compliant data handling; encrypted at rest (MongoDB) and in transit (TLS).
- **API Rate Limits:** LLM provider quotas may throttle parsing; implement exponential backoff and caching.
- **Browser Compatibility:** Must support evergreen browsers; degrade gracefully on older versions.

### 2.6 Assumptions & Dependencies

- LLM Services: OpenAI ChatCompletion API (default), with provision to swap in alternatives (e.g., DeepSeq).
- Frontend Libraries: React, React Flow, Tailwind CSS, Framer Motion.
- Backend Frameworks: Node.js with Express; Mongoose for MongoDB.
- Authentication: JWT tokens managed via OAuth2 providers (Google, GitHub).
- Infrastructure: Deployed via Docker containers or serverless functions as preferred.

---

## 3. Specific Requirements

The application shall implement the following functional requirements. Each requirement is specified with an ID, description, priority, input, output, tools/methods, and acceptance criteria.

1. **FR-1: User Authentication & Authorization**

   - **Description:** Secure sign-up, login, logout, and session management for users.
   - **Priority:** Must have.
   - **Input:** Email/password or OAuth credential.
   - **Output:** JWT access token and user session.
   - **Tools/Methods:** Node.js (Express); JSON Web Tokens (JWT); OAuth 2.0 (Google, GitHub); bcrypt for password hashing; HTTPS.
   - **Acceptance Criteria:** Users can register, authenticate, and log out; invalid credentials show clear error messages; sessions expire after 1 hour.

2. **FR-2: Natural Language Workflow Input**

   - **Description:** Single-line text prompt input on the homepage for users to describe desired workflows in plain language.
   - **Priority:** Must have.
   - **Input:** Free-text workflow description.
   - **Output:** Prompt submitted to backend via sanitized POST request.
   - **Tools/Methods:** React controlled Input component; form validation; REST POST to `/api/workflows/parse`.
   - **Acceptance Criteria:** Input field visible and focused on page load; empty submissions disabled; valid text triggers backend request.

3. **FR-3: Workflow Parsing via LLM Integration**

   - **Description:** Backend service uses an LLM to convert plain-text prompt into structured workflow JSON (nodes and edges).
   - **Priority:** Must have.
   - **Input:** Raw prompt text from user.
   - **Output:** JSON object `{ "nodes": [...], "edges": [...] }` returned to frontend.
   - **Tools/Methods:** OpenAI ChatCompletion API; TypeScript parsing service; prompt-engineering templates; retry logic.
   - **Acceptance Criteria:** Correct JSON schema returned within 5 seconds for valid prompts; errors returned and displayed clearly for invalid or ambiguous prompts.

4. **FR-4: Workflow Diagram Rendering**

   - **Description:** Render workflow JSON as an interactive, minimalist diagram showing nodes and connecting edges.
   - **Priority:** Must have.
   - **Input:** Workflow JSON structure.
   - **Output:** Rendered diagram on the canvas.
   - **Tools/Methods:** React Flow library; Tailwind CSS for minimalist styling; SVG-based edge connectors.
   - **Acceptance Criteria:** Diagram displays all nodes and edges; layout is clear and uncluttered; performance supports up to 50 nodes.

5. **FR-5: Node Detail Inspection**

   - **Description:** On node click, display a detail panel showing node type, inputs, outputs, and configuration.
   - **Priority:** Must have.
   - **Input:** Click event on node.
   - **Output:** Modal or side panel with node details.
   - **Tools/Methods:** React Portal or Drawer component; JSON schema viewer.
   - **Acceptance Criteria:** Clicking a node opens the panel in under 0.2 seconds; panel shows accurate node metadata.

6. **FR-6: Diagram Animation (Simulation)**

   - **Description:** Optional ‘Play’ mode to animate data flow through nodes sequentially.
   - **Priority:** Nice-to-have.
   - **Input:** User toggles ‘Play’ button.
   - **Output:** Sequential highlight of nodes and edges.
   - **Tools/Methods:** Framer Motion; timing controls.
   - **Acceptance Criteria:** Animation runs smoothly; users can pause or reset.

7. **FR-7: Drag-and-Drop Editing**

   - **Description:** Users can drag nodes to rearrange layout and connect/disconnect edges.
   - **Priority:** Must have.
   - **Input:** Drag and connector actions (mouse/touch).
   - **Output:** Updated workflow JSON reflecting new positions and connections.
   - **Tools/Methods:** React Flow drag-and-drop handlers; realtime state synchronization.
   - **Acceptance Criteria:** Layout updates in real time; no loss of data fidelity.

8. **FR-8: Natural Language Editing**

   - **Description:** Allow users to modify existing workflows via natural language commands.
   - **Priority:** Nice-to-have (MVP stretch).
   - **Input:** NL command (e.g., “Move the LinkedIn trigger before the Apollo action”).
   - **Output:** Updated workflow JSON and re-rendered diagram.
   - **Tools/Methods:** LLM delta parsing; diff algorithm; API endpoint `/api/workflows/update`.
   - **Acceptance Criteria:** Simple edits apply correctly; conflicting edits return clear error messages.

9. **FR-9: Workflow Persistence & Retrieval**

   - **Description:** Save, retrieve, rename, and delete user workflows.
   - **Priority:** Must have.
   - **Input:** Save/Load/Delete actions in UI.
   - **Output:** CRUD operations on database.
   - **Tools/Methods:** MongoDB Atlas; Mongoose ODM; REST API endpoints.
   - **Acceptance Criteria:** Users can save and load workflows reliably; deletion prompts confirmation.

10. **FR-10: User Dashboard**

    - **Description:** Dashboard listing all user workflows with metadata (name, date modified).
    - **Priority:** Nice-to-have.
    - **Input:** Dashboard page load.
    - **Output:** List of workflows sorted by date modified.
    - **Tools/Methods:** React Data Table component; pagination controls.
    - **Acceptance Criteria:** Dashboard loads under 2 seconds; workflows listed accurately.

11. **FR-11: Admin Monitoring & Error Logging**

    - **Description:** Admin interface to view system logs, user activity, and error reports.
    - **Priority:** Nice-to-have.
    - **Input:** Admin dashboard access.
    - **Output:** Filterable log listings.
    - **Tools/Methods:** ELK Stack or LogRocket; role-based access control.
    - **Acceptance Criteria:** Admin can filter logs by date, user, and node type.

---

## 4. Non-Functional Requirements

### 4.1 Security

- Encrypt data at rest (AES-256) and in transit (TLS 1.2+).
- Implement OWASP Top 10 protections: input validation, XSS/CSRF prevention, secure headers.
- Role-based access control: restrict admin endpoints.
- Scheduled dependency scanning and vulnerability assessments (SCA).
- Conduct penetration testing at least twice per year, focusing on critical components and new features.
- Engage annual third-party security audits to validate OWASP control implementations and identify emerging risks.

### 4.2 Performance

- LLM parsing latency ≤ 5 seconds (95th percentile).
- Initial diagram render time ≤ 2 seconds.
- Interactive performance ≥ 60 FPS for up to 50 nodes.
- API throughput of 100 requests/minute per user without degradation.
- Load testing thresholds: ensure system handles at least 100 concurrent users executing workflows up to 20 nodes while maintaining p95 latency within target.
- Load test tools/frameworks: use k6 for scripting and automated concurrent user scenarios; employ Apache JMeter for scenario-based and integration load tests.

### 4.3 Usability & Accessibility

- Minimalist, whitespace-first UI to support ADHD clarity and focus.
- Keyboard navigation and screen-reader support per WCAG 2.1 AA success criteria (e.g., 1.4.3 Contrast (Minimum), 2.1.1 Keyboard).
- Large interactive targets (≥ 44 px) and clear focus states to meet WCAG 2.5.5 Target Size (Minimum).
- High-contrast color palette; sans-serif fonts at a base size of 16 px or larger.
- Conduct usability testing with at least five representative users per design iteration, measuring task completion time, error rates, and satisfaction; integrate feedback into UI refinements.

### 4.4 Maintainability

- Modular code architecture: component-based React front end; microservices back end.
- Automated testing: ≥ 80% unit test coverage; integration tests for core flows.
- CI/CD pipeline enforcing linting, static analysis, and security checks before deployment.
- Comprehensive documentation: JSDoc for code, OpenAPI specs for APIs, and onboarding guides.

### 4.5 Scalability & Availability

- Stateless back end services for horizontal scaling (Docker/Kubernetes).
- 99.9% uptime objective; health-check endpoints and auto-healing.
- Auto-scaling policies triggered by CPU/memory metrics; request queue fallback.

### 4.6 Compatibility

- Support latest two versions of Chrome, Firefox, Safari, and Edge.
- Responsive layout optimized for desktop and tablet form factors.
- Graceful degradation on unsupported or legacy browsers.

### 4.7 Compliance

- GDPR compliance: user consent, data deletion, and retention policies.
- CCPA compliance: California residents’ data rights, access requests, and opt-out mechanisms.
- Audit logs for user actions and system events stored securely.
- Data retention policies: configurable retention periods with automated purging.
- Data residency options configurable per client requirements.

---

## UI / Interface Standards

- **Design Principles:** Minimalist with generous whitespace to reduce cognitive load.
- **Typography:** Use a clean sans-serif typeface (e.g., Inter); H1 = 2 rem, H2 = 1.5 rem, body = 1 rem.
- **Color Palette:** Neutral grayscale base with one accent color for primary actions; ensure contrast ratios ≥ 4.5:1.
- **Components:** Standardize on Tailwind CSS and shadcn/ui library for consistency and speed.
- **Design System:** Maintain a versioned design system repository (e.g., GitHub) with contribution guidelines, component library documentation, and a changelog to ensure UI consistency.
- **Icons:** Use lucide-react icons for visual clarity and scalability.
- **Animations:** Subtle, purpose-driven animations (≤ 200 ms) via Framer Motion for state changes.
- **Layout & Spacing:** Grid/Flexbox layouts with a minimum 24 px gutter; consistent margins and padding.
- **Interactive Feedback:** Clear hover/focus states, loading indicators, and concise error/success messages.
- **Accessibility:** Semantic HTML, ARIA roles where necessary, and keyboard-accessible interactive elements.

---

## 5. Appendices

### 5.1 Glossary

| Term      | Definition                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------ |
| Node      | A discrete unit in a workflow representing an action, trigger, conditional, or LLM agent.        |
| Edge      | A directed connection between two nodes indicating data flow or control sequence.                |
| Trigger   | A node type that initiates the workflow (e.g., webhook, scheduled event).                        |
| Action    | A node performing an operation such as an API call or data transformation.                       |
| Filter    | A conditional node that routes flow based on logical expressions.                                |
| LLM Agent | A node leveraging a Large Language Model to perform tasks like text summarization or generation. |
| Workflow  | A complete graph of nodes and edges defining an automated business process.                      |
| Canvas    | The interactive UI area displaying the workflow diagram.                                         |
| JSON      | JavaScript Object Notation, the data-interchange format for workflow definitions.                |
| JWT       | JSON Web Token, used for secure authentication.                                                  |
| OAuth 2.0 | Authorization framework allowing third-party login and token-based access control.               |

### 5.2 Data Models

```json
{
  "Workflow": {
    "type": "object",
    "required": ["id", "name", "nodes", "edges", "ownerId"],
    "properties": {
      "id": { "type": "string", "format": "uuid" },
      "name": { "type": "string" },
      "ownerId": { "type": "string", "format": "uuid" },
      "nodes": {
        "type": "array",
        "items": { "$ref": "#/components/schemas/Node" }
      },
      "edges": {
        "type": "array",
        "items": { "$ref": "#/components/schemas/Edge" }
      },
      "createdAt": { "type": "string", "format": "date-time" },
      "updatedAt": { "type": "string", "format": "date-time" }
    }
  },
  "Node": {
    "type": "object",
    "required": ["id", "type", "config"],
    "properties": {
      "id": { "type": "string" },
      "type": {
        "type": "string",
        "enum": ["trigger", "action", "filter", "llmAgent"]
      },
      "label": { "type": "string" },
      "config": { "type": "object" }
    }
  },
  "Edge": {
    "type": "object",
    "required": ["source", "target"],
    "properties": {
      "source": { "type": "string" },
      "target": { "type": "string" },
      "label": { "type": "string" }
    }
  },
  "UserProfile": {
    "type": "object",
    "required": ["id", "email", "passwordHash"],
    "properties": {
      "id": { "type": "string", "format": "uuid" },
      "email": { "type": "string", "format": "email" },
      "passwordHash": { "type": "string" },
      "oauthProviders": {
        "type": "array",
        "items": { "type": "string", "enum": ["google", "github"] }
      },
      "createdAt": { "type": "string", "format": "date-time" },
      "updatedAt": { "type": "string", "format": "date-time" }
    }
  }
}
```

### 5.3 Sample JSON Instances

**Workflow Instance:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "LinkedIn Lead Capture",
  "ownerId": "987e6543-e21b-12d3-a456-426655440000",
  "nodes": [
    {
      "id": "node-1",
      "type": "trigger",
      "label": "New Lead Trigger",
      "config": {
        "source": "LinkedIn",
        "event": "newConnection"
      }
    },
    {
      "id": "node-2",
      "type": "action",
      "label": "Fetch Apollo Leads",
      "config": {
        "api": "Apollo.io",
        "method": "getLeads"
      }
    }
  ],
  "edges": [
    {
      "source": "node-1",
      "target": "node-2",
      "label": "onNewConnection"
    }
  ],
  "createdAt": "2025-05-08T10:00:00Z",
  "updatedAt": "2025-05-08T10:05:00Z"
}
```

**Node Instance:**

```json
{
  "id": "node-3",
  "type": "filter",
  "label": "Email Domain Filter",
  "config": {
    "condition": "email.endsWith('@example.com')"
  }
}
```

**Edge Instance:**

```json
{
  "source": "node-2",
  "target": "node-3",
  "label": "filterEmails"
}
```

**UserProfile Instance:**

```json
{
  "id": "555e4444-e33b-11d3-a456-426614174000",
  "email": "user@example.com",
  "passwordHash": "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36",
  "oauthProviders": ["google"],
  "createdAt": "2025-05-01T08:30:00Z",
  "updatedAt": "2025-05-08T09:15:00Z"
}
```
