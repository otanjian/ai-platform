## ADDED Requirements

### Requirement: Users can create and manage AI agents
The system SHALL allow users to create, configure, enable/disable, and test AI agents.

#### Scenario: Create a new agent
- **WHEN** a user fills in the agent form with name, model, knowledge base, and MCP tools
- **THEN** the system creates the agent via BuildingAI `/api/agent` and shows it in the agent list

### Requirement: Users can manage knowledge bases for RAG
The system SHALL provide knowledge base creation, document upload, and retrieval testing.

#### Scenario: Upload documents to a knowledge base
- **WHEN** a user selects a knowledge base and uploads PDF/TXT files
- **THEN** the system uploads the documents to BuildingAI `/api/datasets` and indexes them for retrieval

### Requirement: Users can manage models and MCP tools
The system SHALL provide interfaces to configure LLM models and MCP tool servers in BuildingAI.

#### Scenario: Add a model
- **WHEN** a user adds a model with API endpoint and key
- **THEN** the system saves the model via BuildingAI `/api/model` and verifies connectivity

### Requirement: Users can chat with agents
The system SHALL provide an embedded chat window for testing conversations with selected agents and knowledge bases.

#### Scenario: Chat with an agent
- **WHEN** a user selects an agent and sends a message
- **THEN** the system calls BuildingAI `/api/session` and streams back the agent's response

### Requirement: Users can publish agents for external access
The system SHALL allow publishing an agent as an API or site with access tokens and API keys.

#### Scenario: Publish agent as API
- **WHEN** a user clicks Publish on an agent and enables API key access
- **THEN** the system configures `agent.publish_config` and displays the API endpoint and key

### Requirement: Users can manage application permissions
The system SHALL expose BuildingAI console RBAC for managing access to agents, knowledge bases, models, and MCP tools.

#### Scenario: Grant knowledge base access
- **WHEN** an admin assigns a role to a user for a specific knowledge base
- **THEN** the system applies the permission through BuildingAI console RBAC APIs
