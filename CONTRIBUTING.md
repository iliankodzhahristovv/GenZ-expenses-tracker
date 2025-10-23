# Contributing Guide

Thank you for considering contributing to this template!

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone <your-fork-url>
   cd nextjs-clean-architecture-template
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Create a branch for your changes**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Project Guidelines

### Code Style

- Use TypeScript strict mode
- Follow the existing code style
- Run `pnpm prettier:write` before committing
- Ensure `pnpm lint` passes
- Run `pnpm check` to verify TypeScript types

### Architecture Rules

Please follow the clean architecture principles outlined in this template:

1. **Domain Layer** should not depend on external frameworks
2. **Repository interfaces** must be defined in the domain layer
3. **Services** should use dependency injection
4. **Components** should be small and focused
5. **One component per file** rule must be followed

### Adding New Features

When adding a new feature, follow this structure:

1. Create a new module in `modules/`
2. Define domain models and interfaces
3. Implement repositories and services
4. Create server actions
5. Add custom hooks
6. Build UI components
7. Update the README if needed

### Testing

Before submitting a PR:

- ✅ Ensure the project builds: `pnpm build`
- ✅ Check for linting errors: `pnpm lint`
- ✅ Verify TypeScript types: `pnpm check`
- ✅ Test the feature locally: `pnpm dev`

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add product module with clean architecture
fix: correct user repository implementation
docs: update README with new examples
refactor: improve service layer structure
```

### Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update CURSOR_RULES.md if you're adding architectural patterns
3. Ensure all tests pass and linting is clean
4. Request review from maintainers

## Questions?

Feel free to open an issue for any questions or discussions about the template.

Thank you for contributing! 🎉

