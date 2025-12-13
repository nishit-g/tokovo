import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";

const config: DocsThemeConfig = {
    logo: <span style={{ fontWeight: 700, fontSize: 20 }}>🎬 Tokovo</span>,
    project: {
        link: "https://github.com/your-org/tokovo",
    },
    docsRepositoryBase: "https://github.com/your-org/tokovo/tree/main/docs",
    footer: {
        text: "Tokovo — Deterministic Story Engine",
    },
    head: (
        <>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta property="og:title" content="Tokovo Documentation" />
            <meta property="og:description" content="A Programmable Narrative Operating System" />
        </>
    ),
    useNextSeoProps() {
        return {
            titleTemplate: "%s – Tokovo",
        };
    },
    sidebar: {
        defaultMenuCollapseLevel: 1,
        toggleButton: true,
    },
    toc: {
        backToTop: true,
    },
    navigation: {
        prev: true,
        next: true,
    },
    primaryHue: 200,
    primarySaturation: 80,
};

export default config;
