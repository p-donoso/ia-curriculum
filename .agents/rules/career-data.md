# Career data and CV boundaries

- Treat education, experience, projects, and skills as the shared career source. Editing these records from any CV updates the same source.
- Keep each CV's objective, basic information, headline, summary, answers, and AI preferences scoped to that CV unless the data model explicitly changes.
- Make shared-versus-CV-specific behavior clear in the interface and documentation.
- Preserve existing user data during migrations. Do not merge distinct records based only on similar text; use stable IDs and retain recoverable originals.
- Deleting a CV must not delete the shared career source.
- Keep exports explicit about whether they contain one CV's data, shared source data, or both.
