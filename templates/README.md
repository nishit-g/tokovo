# Tokovo Templates

This directory contains templates and generators for creating new plugins and episodes.

## Available Templates

### Plugin Template
Create a new app plugin with full enterprise contract compliance.

```bash
pnpm create-plugin <app-name>
# Example: pnpm create-plugin instagram
```

### Episode Template
Create a new DSL-based episode.

```bash
pnpm create-episode <episode-name>
# Example: pnpm create-episode my-drama
```

## Directory Structure

```
templates/
├── README.md                  # This file
├── plugin/                    # Plugin template files
│   ├── package.json.template
│   ├── src/
│   │   ├── index.ts.template
│   │   ├── plugin.ts.template
│   │   ├── types.ts.template
│   │   ├── lowering.ts.template
│   │   ├── dsl-extension.ts.template
│   │   └── logic/reducer.ts.template
├── episode/                   # Episode template files
│   └── episode.ts.template
└── scripts/
    ├── create-plugin.ts       # Plugin generator script
    └── create-episode.ts      # Episode generator script
```
