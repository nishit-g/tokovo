import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const repoRoot = path.resolve(import.meta.dirname, "..");
const sourceRoots = [
  "apps/video-runner/src",
  "packages/apps-imessage/src",
  "packages/apps-instagram/src",
  "packages/apps-linkedin/src",
  "packages/apps-snapchat/src",
  "packages/apps-teams/src",
  "packages/apps-typewriter/src",
  "packages/apps-whatsapp/src",
  "packages/apps-x/src",
  "packages/background/src",
  "packages/device-camera/src",
  "packages/device-keyboard/src",
  "packages/device-notifications/src",
  "packages/devices/src",
  "packages/overlay/src",
  "packages/react/src",
  "packages/renderer/src",
];

const forbiddenAnimatedProperties = new Set([
  "animation",
  "animationDelay",
  "animationDirection",
  "animationDuration",
  "animationFillMode",
  "animationIterationCount",
  "animationName",
  "animationPlayState",
  "animationTimingFunction",
]);
const forbiddenTransitionProperties = new Set([
  "transition",
  "transitionDelay",
  "transitionDuration",
  "transitionProperty",
  "transitionTimingFunction",
]);

function listSourceFiles(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__tests__" || entry.name === "dist") return [];
      return listSourceFiles(absolutePath);
    }
    if (!/\.tsx?$/.test(entry.name) || /\.(?:test|spec)\.tsx?$/.test(entry.name)) return [];
    return [absolutePath];
  });
}

function propertyName(node) {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node)) return node.text;
  return null;
}

function staticString(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isTemplateExpression(node)) return node.getText();
  return null;
}

const issues = [];
const files = sourceRoots.flatMap((root) => listSourceFiles(path.join(repoRoot, root)));

for (const filePath of files) {
  const sourceText = fs.readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  const report = (node, message) => {
    const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    issues.push({
      file: path.relative(repoRoot, filePath),
      line: position.line + 1,
      column: position.character + 1,
      message,
    });
  };

  if (sourceText.includes("@keyframes")) {
    const index = sourceText.indexOf("@keyframes");
    const node = sourceFile.getTokenAtPosition(index);
    report(node, "CSS keyframes use browser time; derive motion from frame and fps instead");
  }

  const visit = (node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      if (node.tagName.getText(sourceFile) === "img") {
        report(node, "native <img> does not block Remotion capture; use DeterministicImage");
      }
    }

    if (ts.isPropertyAssignment(node)) {
      const name = propertyName(node.name);
      const value = staticString(node.initializer);

      if (name && forbiddenAnimatedProperties.has(name) && value !== null && value !== "none") {
        report(node, `CSS ${name} uses browser time; derive the value from frame and fps`);
      }

      if (name && forbiddenTransitionProperties.has(name) && value !== null && value !== "none") {
        report(node, `CSS ${name} uses browser time; interpolate from timeline state instead`);
      }

      if ((name === "background" || name === "backgroundImage") && value?.includes("url(")) {
        report(
          node,
          "CSS image URLs do not block frame capture; render the asset with DeterministicImage",
        );
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
}

issues.sort(
  (left, right) =>
    left.file.localeCompare(right.file) || left.line - right.line || left.column - right.column,
);

if (issues.length > 0) {
  for (const issue of issues) {
    console.error(`${issue.file}:${issue.line}:${issue.column} ${issue.message}`);
  }
  console.error(`Render determinism policy failed with ${issues.length} issue(s).`);
  process.exit(1);
}

console.log(`Render determinism policy passed (${files.length} production source files checked).`);
