# Security policy

## Reporting a vulnerability

Use GitHub's **Report a vulnerability** feature for this repository so maintainers can review reports privately. Do not open a public issue with credentials, personal information, or exploit details. Please include affected versions, impact, and steps to reproduce when safe to do so.

## Data and credentials

IA Curriculum has no backend. Profile data and answers stay in browser storage unless a person explicitly sends text to a configured AI provider. Provider tokens are stored in tab-scoped `sessionStorage`; they remain accessible to scripts running in the same origin while that session is open. Use the app on a trusted device, keep dependencies current, and never place secrets in `NEXT_PUBLIC_*` environment variables.
