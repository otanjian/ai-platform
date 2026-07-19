## ADDED Requirements

### Requirement: Users can visually design pipeline DAGs
The system SHALL provide a canvas where users can drag and drop nodes for OpenCode, DataEase, and BuildingAI operations and connect them into a DAG.

#### Scenario: Create a simple pipeline
- **WHEN** a user drags a DataEase node and a BuildingAI node onto the canvas and connects them
- **THEN** the system saves the DAG definition to MySQL and validates the connections

### Requirement: System provides pre-built pipeline templates
The system SHALL provide a template market with reusable pipeline templates.

#### Scenario: Use a weekly sales report template
- **WHEN** a user selects the "Weekly Sales Report" template from the template market
- **THEN** the system creates a new pipeline based on the template with DataEase query → BuildingAI analysis → report generation

### Requirement: Pipelines can be triggered manually or automatically
The system SHALL support manual, cron, webhook, and event-based triggers.

#### Scenario: Configure a cron trigger
- **WHEN** a user sets a pipeline to run every Monday at 9:00 AM
- **THEN** the system persists the cron expression and schedules the pipeline execution

### Requirement: Pipeline executions are recorded and observable
The system SHALL record every pipeline execution, including status, step results, logs, and error messages.

#### Scenario: View execution history
- **WHEN** a user opens Smart Pipeline → Execution History
- **THEN** the system displays a list of past executions with status, duration, and a link to detailed logs

### Requirement: Pipeline steps can pass data through a context object
The system SHALL pass data between steps via a JSON context object, supporting large payloads through object storage or temporary files.

#### Scenario: Data flows between steps
- **WHEN** a DataEase query step completes
- **THEN** the system stores the result in the context and passes it to the next BuildingAI analysis step

### Requirement: Generated code runs in a sandbox
The system SHALL execute any OpenCode-generated code in an isolated container sandbox.

#### Scenario: OpenCode generates deployment script
- **WHEN** a pipeline step generates a shell script via OpenCode
- **THEN** the system executes the script inside a sandboxed container and captures the output
