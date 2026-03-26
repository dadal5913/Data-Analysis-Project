# Contributing to QuantLab

## Development workflow

1. Fork and create a feature branch.
2. Keep changes scoped to one milestone/feature.
3. Add tests for behavior changes.
4. Run local checks before opening a PR.

## Local checks

- Backend: `pytest -q`
- Frontend: `npm run lint && npm run test`

## Coding guidelines

- Keep route handlers thin; business logic belongs in services.
- Use typed schemas and DTOs for API boundaries.
- Prefer small, composable modules with clear naming.
