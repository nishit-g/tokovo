# Contributing to Tokovo

Thank you for your interest in contributing to Tokovo. This document outlines the standards and processes for contributing.

---

## The Bar

Tokovo is **infrastructure-grade software**. Contributions must meet a high bar:

- **Deterministic** — Same input → same output, always
- **Pure** — No side effects in transformations
- **Typed** — Full TypeScript, no `any` unless justified
- **Tested** — Golden tests for IR, unit tests for logic
- **Documented** — Update docs with code changes

---

## Before You Start

### 1. Understand the Architecture

Read these first:

1. [Codebase Understanding](UNDERSTANDING.md)
2. [Design Philosophy](DESIGN_PHILOSOPHY.md)
3. [Documentation Master Plan](DOCS_MASTER_PLAN.md)
4. [DSL Documentation](docs/DSL.md)
5. [Device OS Documentation](docs/DEVICE_OS.md)
6. [Keyboard Documentation](docs/KEYBOARD.md)

### 2. Respect the Layers

```
DSL (@tokovo/dsl)    → Event factories (no runtime logic)
Author (episode)     → Never import Runtime
Semantic (IR)        → No deps (pure types)
Execution (core)     → Engine, replay, event processing
Rendering            → React, DirectorLite, Plugins
```

**If your change violates layer boundaries, it will be rejected.**

---

## Development Setup

```bash
# Clone
git clone https://github.com/your-org/tokovo.git
cd tokovo

# Install (pnpm required)
pnpm install

# Build all packages
pnpm build

# Run dev servers
npx turbo dev --filter=video-runner --filter=docs
```

### Required Tools

- Node.js 18+
- pnpm 9+
- TypeScript 5+

---

## Where to Contribute

### ✅ Good First Issues

- Documentation improvements
- Type refinements
- Test coverage
- Linting fixes

### ⚠️ Requires Discussion

- New SceneOp types
- New TimelineOp types
- New compiler passes
- DirectorLite rule changes

### ❌ Will Be Rejected Without Discussion

- Breaking IR changes
- New layer boundaries
- Runtime in DSL
- Non-deterministic code

---

## Code Standards

### TypeScript

```typescript
// ✅ Good
function normalize(ops: readonly SceneOp[]): SceneOp[] {
  return ops.map(op => expandSugar(op));
}

// ❌ Bad (mutates input)
function normalize(ops: SceneOp[]): void {
  ops.forEach(op => op.expanded = true);
}
```

### Immutability

```typescript
// ✅ Always return new objects
return {
  ...state,
  devices: {
    ...state.devices,
    [id]: newDevice,
  }
};

// ❌ Never mutate
state.devices[id] = newDevice;
```

### Naming

| Type | Convention | Example |
|------|------------|---------|
| Interface | PascalCase | `SceneIR`, `TimelineOp` |
| Function | camelCase | `compile()`, `normalize()` |
| Constant | SCREAMING_SNAKE | `Phase.DEVICE` |
| File | kebab-case | `resolve-refs.ts` |
| Package | @tokovo/name | `@tokovo/ir` |

---

## Testing

### Golden Tests (IR)

```typescript
// Compare output to snapshot
test("breakup episode compiles correctly", () => {
  const timeline = compile(breakupScene);
  expect(timeline.ops).toMatchSnapshot();
});
```

### Unit Tests (Logic)

```typescript
test("parseDuration handles seconds", () => {
  expect(parseDuration("1.5s", 30)).toBe(45);
});
```

### Determinism Tests

```typescript
test("same input produces same output", () => {
  const result1 = compile(scene);
  const result2 = compile(scene);
  expect(result1).toEqual(result2);
});
```

---

## Pull Request Process

### 1. Branch Naming

```
feature/add-voice-note-op
fix/typing-indicator-duration
docs/update-compiler-passes
```

### 2. Commit Messages

```
feat(ir): add VoiceNoteSentOp to SceneOp

- Reserve slot in SceneOp union
- Add to constraints validation
- Update docs
```

Format: `type(scope): description`

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

### 3. PR Requirements

- [ ] All tests pass
- [ ] TypeScript compiles
- [ ] Docs updated (if applicable)
- [ ] No layer violations
- [ ] Determinism preserved
- [ ] DOCS_MASTER_PLAN.md updated (if adding docs)

### 4. Review Process

1. Automated checks run
2. Maintainer reviews code
3. Changes requested (if needed)
4. Approved → Merged to main

---

## Adding New Features

### New SceneOp Type

1. Define in `packages/ir/src/scene.ts`
2. Add to SceneOp union
3. Add validation in `constraints.ts`
4. Update DSL builder (if applicable)
5. Add compiler pass handling
6. Add adapter handling
7. Update docs

### New Compiler Pass

1. Create in `packages/compiler/src/passes/`
2. Export from `passes/index.ts`
3. Add to pipeline in `compile.ts`
4. Add tests
5. Update docs

### New App Plugin

1. Create package `packages/apps-newapp/`
2. Define plugin with `definePlugin()`
3. Create reducer
4. Create view component
5. Export from index
6. Import in video-runner
7. Update docs

---

## What Gets Rejected

1. **Non-deterministic code** — Math.random(), Date.now()
2. **Layer violations** — DSL importing Runtime
3. **Breaking IR changes** — Without migration path
4. **Untested code** — No tests = no merge
5. **Undocumented features** — Docs are required
6. **Mutation** — Always immutable

---

## Communication

- **GitHub Issues** — Bug reports, feature requests
- **GitHub Discussions** — Architecture questions
- **Pull Requests** — Code contributions

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

## Thank You

Tokovo is building the future of programmatic storytelling. Your contributions matter.
