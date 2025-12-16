#!/usr/bin/env node

/**
 * Tokovo Plugin Scaffolder
 * Usage: node scripts/create-plugin.js <plugin-name>
 * Example: node scripts/create-plugin.js spotify
 */

const fs = require('fs');
const path = require('path');

const pluginName = process.argv[2];

if (!pluginName) {
    console.error("Please provide a plugin name (e.g. 'spotify')");
    process.exit(1);
}

const appId = `app_${pluginName.toLowerCase()}`;
const pkgName = `@tokovo/apps-${pluginName.toLowerCase()}`;
const rootDir = path.resolve(__dirname, '..');
const targetDir = path.join(rootDir, 'packages', `apps-${pluginName.toLowerCase()}`);

if (fs.existsSync(targetDir)) {
    console.error(`Plugin directory ${targetDir} already exists.`);
    process.exit(1);
}

console.log(`Creating plugin: ${pkgName} in ${targetDir}...`);

// 1. Create Directories
const dirs = [
    'src/adapters',
    'src/assets',
    'src/logic',
    'src/ui',
    'src/widgets'
];

fs.mkdirSync(targetDir, { recursive: true });
dirs.forEach(dir => fs.mkdirSync(path.join(targetDir, dir), { recursive: true }));

// 2. Create package.json
const packageJson = {
    name: pkgName,
    version: "0.0.1",
    main: "./src/index.ts",
    types: "./src/index.ts",
    dependencies: {
        "@tokovo/core": "workspace:*",
        "react": "^18.2.0"
    },
    devDependencies: {
        "typescript": "^5.0.0",
        "@types/react": "^18.2.0"
    }
};
fs.writeFileSync(path.join(targetDir, 'package.json'), JSON.stringify(packageJson, null, 4));

// 3. Create tsconfig.json
const tsConfig = {
    extends: "../../tsconfig.json",
    compilerOptions: {
        "jsx": "react-jsx",
        "outDir": "./dist"
    },
    include: ["src/**/*"]
};
fs.writeFileSync(path.join(targetDir, 'tsconfig.json'), JSON.stringify(tsConfig, null, 4));

// 4. Create Source Files

// assets/metadata.tsx
const metadataContent = `import React from "react";
import { AppMetadata } from "@tokovo/core";

export const ${pluginName}Metadata: Partial<AppMetadata> & { name: string } = {
    name: "${pluginName}",
    displayName: "${pluginName.charAt(0).toUpperCase() + pluginName.slice(1)}",
    themeColor: "#000000",
    icon: "📦", // Replace with SVG component
    viewStrategy: "CHAT"
};
`;
fs.writeFileSync(path.join(targetDir, 'src/assets/metadata.tsx'), metadataContent);

// logic/reducer.ts
const reducerContent = `import { WorldState, TimelineEvent, APP_IDS } from "@tokovo/core";

export function ${pluginName}Reducer(draft: WorldState, event: TimelineEvent): void {
    if (event.kind !== "APP" || event.appId !== "${appId}") return;
    
    // Handle events
}
`;
fs.writeFileSync(path.join(targetDir, 'src/logic/reducer.ts'), reducerContent);

// ui/index.tsx
const uiContent = `import React from "react";
import { WorldState } from "@tokovo/core";

export const ${pluginName}View: React.FC<{ world: WorldState }> = ({ world }) => {
    return (
        <div style={{ flex: 1, backgroundColor: "white", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <h1>${pluginName}</h1>
        </div>
    );
};
`;
fs.writeFileSync(path.join(targetDir, 'src/ui/index.tsx'), uiContent);

// adapters/anchors.ts
const anchorsContent = `import { AnchorProvider, AnchorSnapshot } from "@tokovo/core";

export const ${pluginName}Anchors: AnchorProvider = {
    appId: "${appId}",
    framing: {
        device: { anchorPoint: { x: 0.5, y: 0.5 }, paddingPx: 0, targetFill: 1 }
    },
    getAnchors: (world, layout, deviceId) => {
        return { anchors: {}, deviceId, appId: "${appId}" };
    }
};
`;
fs.writeFileSync(path.join(targetDir, 'src/adapters/anchors.ts'), anchorsContent);

// index.ts
const indexContent = `import { definePlugin } from "@tokovo/core";
import { ${pluginName}Reducer } from "./logic/reducer";
import { ${pluginName}View } from "./ui";
import { ${pluginName}Metadata } from "./assets/metadata";
import { ${pluginName}Anchors } from "./adapters/anchors";

export const ${pluginName}Plugin = definePlugin({
    id: "${appId}",
    name: "${pluginName}",
    version: "1.0.0",
    metadata: ${pluginName}Metadata,
    appView: ${pluginName}View,
    reducer: ${pluginName}Reducer,
    anchors: ${pluginName}Anchors.framing,
    getAnchors: ${pluginName}Anchors.getAnchors,
});

export default ${pluginName}Plugin;
`;
fs.writeFileSync(path.join(targetDir, 'src/index.ts'), indexContent);

console.log("Done! Run 'npx turbo build' to verify.");
