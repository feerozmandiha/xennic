# ADR-006-dependency-management.md
## Additional Rules

### JavaScript / TypeScript

Exactly one node_modules directory is allowed:

/node_modules

Local node_modules folders inside:

apps/*
packages/*

are prohibited.

### Python Services

Each Python service manages its own dependencies using:

pyproject.toml

Virtual environments are never committed to Git.

### ORM Dependencies

Prisma packages are installed at repository root and shared through the workspace.

Required packages:

@prisma/client
prisma