import { useMDXComponents as getDocsMDXComponents } from "nextra-theme-docs";
import { ASCIIDiagram } from "./components/ASCIIDiagram";
import { PackageCard } from "./components/PackageCard";
import { APISignature } from "./components/APISignature";
import { SeeAlso } from "./components/SeeAlso";
import { ExampleCode } from "./components/ExampleCode";

const docsComponents = getDocsMDXComponents();

export function useMDXComponents(components) {
  return {
    ...docsComponents,
    ASCIIDiagram,
    PackageCard,
    APISignature,
    SeeAlso,
    ExampleCode,
    ...components,
  };
}
