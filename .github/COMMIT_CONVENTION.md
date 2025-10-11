# Commit Message Convention

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification.

## Format

```
type(scope): subject

body

footer
```

## Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semi-colons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Changes to build system or dependencies
- `ci`: Changes to CI configuration
- `chore`: Other changes that don't modify src or test files

## Examples

```
docs(readme): add installation instructions

feat(auth): implement JWT authentication

fix(api): resolve null pointer exception in user endpoint
```

## Validation

All commits are validated using commitlint with the conventional config.
See `commitlint.config.js` for configuration details.

## CI Integration

The commitlint validation runs automatically on all pull requests and push events.
Commits that don't follow the conventional format will cause CI to fail.

## Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Commitlint Documentation](https://commitlint.js.org/)
