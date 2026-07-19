## Context

The `aiplatform` repository is a new project with no existing code or planning process. The goal is to establish OpenSpec as the default planning and specification workflow before any application code is written. This change is purely process-oriented: it installs configuration, directory structure, and conventions rather than adding product features.

## Goals / Non-Goals

**Goals:**
- Initialize OpenSpec with the `spec-driven` schema and Cursor tooling.
- Create the first change proposal that documents OpenSpec adoption itself.
- Establish the directory layout and artifact conventions that every future change will follow.
- Make the project ready for spec-driven development.

**Non-Goals:**
- Writing application code or product features.
- Migrating existing specs or documentation (there are none).
- Customizing the OpenSpec schema or workflow beyond the defaults.

## Decisions

- **Use the default `spec-driven` schema**: It provides the standard `proposal → design → specs → tasks` workflow, which is sufficient for a new project and avoids unnecessary customization.
- **Configure Cursor tooling**: The project is edited in Cursor, so enabling the Cursor skill and command integration keeps the workflow native to the IDE.
- **Create an adoption change (`introduce-openspec`)**: Documenting the adoption itself as the first change exercises the workflow and leaves a clear record of why and how OpenSpec was introduced.
- **Keep the project root as the OpenSpec root**: The repository is small, so a single planning root at the project root is the simplest option. A separate store or nested root is unnecessary.

## Risks / Trade-offs

- [Risk] Team members may forget to use the OpenSpec workflow for small changes. → Mitigation: Keep the first change lightweight to demonstrate that the workflow works for even simple process changes.
- [Risk] OpenSpec artifacts add files to the repository that may feel like boilerplate. → Mitigation: Treat them as living documentation that is archived into the main `openspec/specs/` tree, not permanent overhead.
- [Trade-off] Using defaults instead of custom schema may limit future flexibility. → Acceptable because the project is new; custom schemas can be introduced later if the default workflow proves insufficient.
