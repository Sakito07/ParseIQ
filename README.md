# ParseIQ (Analyzer)
Local PDF insight explorer with bilingual UI, theming, and heuristic text analytics. Upload any PDF to extract text locally, summarize it, surface keywords, and get quick governance and risk cues without leaving the browser.

## Overview
- Runs entirely in the browser using `pdfjs-dist` to parse PDFs; no data leaves the device.
- Three visual themes (Light, Midnight, Dusk) and English/Spanish UI toggles.
- Navigation tabs for Overview, Documents, and Insights with tailored layouts per section.
- Heuristic summary and keyword extraction tuned per language (stopword filtering).
- Lightweight insight cards that flag doc size, risk posture, and governance mentions.

## Features
- **PDF ingestion**: Drag-and-drop or click to upload; shows page count, token estimate, size, and a mock ETA. Errors fall back to a safe mock document with a helpful message.
- **Local parsing**: Uses `pdfjs-dist` to read all pages and concatenate text; no backend required.
- **Summaries**: First three sentences trimmed to fit ~240 chars per language; empty files return language-specific notices.
- **Keyword extraction**: Frequency-based extraction with stopword removal per language; top six keywords rendered as chips.
- **Insights panel**: Flags document length, risk mentions, and governance/data references; labels and tones adapt to selected language.
- **Realtime stats**: Sentiment signal, risk level, coverage %, and readiness estimate derived from page/token counts and keyword density.
- **Theming and i18n**: Sidebar chips to swap theme and language instantly; translations live in `translations` inside `src/App.jsx`.
- **Navigation**: Quick links for Overview, Documents, and Insights; each tab remixes the same data in a different layout.

## Tech Stack
- React 19 + Vite
- `pdfjs-dist` for PDF parsing
- Plain CSS (`src/App.css`) for layout and theming tokens

## Getting Started
Prerequisites: Node 18+ and npm.

```bash
npm install
npm run dev      # starts on http://localhost:5173
npm run build    # production build in dist/
npm run preview  # preview the production build
npm run lint     # lint with ESLint
```

## Usage
1) Start the dev server and open the app.  
2) Choose EN/ES and pick a theme in the sidebar.  
3) Upload a PDF (or re-run analysis on the mock sample).  
4) Review extracted text, generated summary, and keyword chips.  
5) Switch to Insights to see risk/governance cues and suggested actions; Documents tab focuses on the upload plus text panes.

## Data and Logic Notes
- Parsing happens entirely in-browser via `pdfjs-dist`. Large PDFs will take longer but remain local.
- Summaries are heuristic (sentence slicing); no ML calls. Keywords are frequency-based with language stopword lists.
- Insight tones depend on text matches (`risk`, `governance`, `data`, etc.) and document length.
- The sample filename and metadata are mock defaults; upload replaces them with the real file info.

## Project Structure
- `src/App.jsx` — main UI, state, parsing, summarization, insights, theming, and i18n strings.
- `src/App.css` — styling, layout grid, chips, cards, skeletons, and tone badges.
- `public/` — static assets (includes the Vite logo only).

## Known Behavior and Limits
- No server storage or history; each upload is ephemeral and remains in memory.
- Very large PDFs can be slow to parse client-side; tokens/pages are estimates derived from extracted text length.
- The “Realtime status” and “Suggested actions” are deterministic heuristics, not AI output.

