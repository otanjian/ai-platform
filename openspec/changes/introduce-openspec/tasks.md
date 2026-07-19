## 1. Initialize OpenSpec

- [ ] 1.1 Run `openspec init --tools cursor` at the project root
- [ ] 1.2 Verify `openspec/config.yaml` and `.cursor/` files were created

## 2. Create the Adoption Change

- [ ] 2.1 Create the change `introduce-openspec` with `openspec new change "introduce-openspec"`
- [ ] 2.2 Confirm the change directory is under `openspec/changes/introduce-openspec/`

## 3. Write Planning Artifacts

- [ ] 3.1 Write `proposal.md` explaining why OpenSpec is being introduced
- [ ] 3.2 Write `design.md` documenting the adoption approach and decisions
- [ ] 3.3 Write `specs/openspec-workflow/spec.md` defining the workflow requirements
- [ ] 3.4 Write `tasks.md` with the implementation checklist

## 4. Validate and Commit

- [ ] 4.1 Run `openspec validate --change "introduce-openspec"` to verify artifacts
- [ ] 4.2 Stage and commit the new `openspec/` and `.cursor/` files
- [ ] 4.3 Share the new workflow with the team and update contribution guidelines
