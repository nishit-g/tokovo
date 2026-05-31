# Security Policy

## Supported Versions

Tokovo is preparing for v1. Until v1.0.0 is tagged, security fixes target the default branch.

After v1.0.0, security support will target the latest minor line unless a release note says otherwise.

## Reporting A Vulnerability

Please do not open public issues for suspected vulnerabilities.

Use GitHub private vulnerability reporting for this repository once it is enabled. If private reporting is unavailable, contact a maintainer privately and include:

- affected package or app
- vulnerable version, commit, or deployment
- reproduction steps
- expected impact
- any known mitigations

Maintainers should acknowledge valid reports, avoid public disclosure until a fix or mitigation is available, and credit reporters when they want credit.

## Scope

Security-sensitive areas include:

- render-service input validation and artifact access
- private asset handling
- voice provider credentials
- episode and plugin execution boundaries
- generated media paths and local file handling
- dependency supply chain updates
