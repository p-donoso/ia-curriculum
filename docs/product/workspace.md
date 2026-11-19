# Workspace and navigation

A new installation opens `/` with no CVs or career data. Create a resume from scratch, or select an existing one. Each resume opens at `/profiles/:id`; structured sections use `/profiles/:id/:section`.

The workspace includes Basic information, Education, Work experience, Projects, Skills, LinkedIn, Resume, and Settings. Each data section supports creating, editing, collapsing, and deleting records. Education, experience, projects, and skills form one shared career source. Basic information, headline, summary, reflection answers, goal, AI settings, and appearance belong to the selected CV.

When creating a targeted CV, users can select an existing CV as a source and paste a project or role description. The app copies editable basic information and reuses shared career records. Users can request a headline and summary draft using the source CV's configured provider. Before sending, the app identifies the provider and data categories; the draft requires review and confirmation.

The Resume view offers Coral banner, Sidebar, and Editorial templates, five preset palettes, and five custom colors. Template and palette catalogs are separate JSON files in `lib/profiles/`. Appearance and optional Material section icons are saved per CV and included in exported metadata. Interface labels support English and Spanish; user content is not automatically translated.

Canada 1500 and Material Icons are served locally; license notices are in `public/fonts/`. Templates use consistent spacing, fixed icon widths, and vertical sidebar skills. Sidebar uses the primary color as its panel background with contrasting text. Print rules discourage split entries, stranded headings, and short paragraph fragments where supported by the browser. Pagination depends on content, browser, and paper size; a single page is not guaranteed.

LinkedIn shows a summary, projects, and skills. Resume uses the browser print dialog to save a PDF. Settings exports JSON or deletes the selected CV without deleting shared career records. Navigation uses real route links; the mobile drawer closes after a section is selected.
