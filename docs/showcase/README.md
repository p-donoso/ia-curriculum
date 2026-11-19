# Screenshot gallery

These screens use fictional sample data generated in a temporary browser session. They do not contain real profile information or provider credentials. All images were refreshed against the MUI 9 application on November 19, 2026.

All screenshots show the English interface for a consistent walkthrough.

## Choose a profile

![Profile selection](screenshots/profiles.png)

Each CV can target a different opportunity. The career source (education, experience, projects, and skills) is shared, while each CV keeps its own headline and summary.

## Guided reflection

Start with the first prompt:

![Reflection start](screenshots/reflection-start.png)

After one answer, progress and next step update together:

![Reflection in progress](screenshots/reflection-progress.png)

Review the saved answers when all three prompts are complete:

![Reflection complete](screenshots/reflection-complete.png)

## Build a professional profile

Basic information:

![Basic information](screenshots/basic-information.png)

Experience, including multiline achievements:

![Experience](screenshots/experience.png)

Education:

![Education](screenshots/education.png)

Projects:

![Projects](screenshots/projects.png)

Skills:

![Skills](screenshots/skills.png)

## Review and export

LinkedIn-oriented profile preview:

![LinkedIn preview](screenshots/linkedin-draft.png)

Optional provider and local-data settings:

![Settings](screenshots/settings.png)

Printable English CV:

![CV preview](screenshots/cv-preview.png)

The current CV preview offers Coral banner, Sidebar, and Editorial layouts, five preset palettes, and five editable custom colors. Layout and palette are saved per CV. The selector and applied examples below use fictional content.

Template and palette selectors:

![CV template and palette selectors](screenshots/cv-template-palette-picker.png)

Custom palette applied to Sidebar:

![Custom palette applied to the sidebar CV layout](screenshots/cv-custom-palette.png)

Violet palette applied to Editorial:

![Violet palette applied to the editorial CV layout](screenshots/cv-editorial-palette.png)

Definitions are in `lib/profiles/cv-templates.json` and `lib/profiles/cv-palettes.json`.

Mobile navigation:

![Mobile navigation](screenshots/mobile-navigation.png)

## Print styling

This capture uses Chromium print media for the Editorial layout. It checks the visible print styles, not pagination across every paper size or browser.

![Resume with print media styles](screenshots/cv-print.png)

## Refreshing screenshots

Build and start the application, then run the isolated synthetic-data capture script:

```bash
npm run build
npm run start -- -p 3012
# In another terminal:
node scripts/capture-showcase.mjs
```

Set `SHOWCASE_URL` to use another local server. The script creates a fresh browser context, seeds fictional records, walks through reflection and section views, and captures all gallery images in English. It does not read an existing browser profile or use provider credentials. Review the generated images before committing them.
