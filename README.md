# Pixel Point Studio

A creative studio marketing site built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**. It ships a polished landing page (hero, services, work gallery) and a working project-inquiry flow backed by a Route Handler API.

## Tech stack

- [Next.js 16](https://nextjs.org/) with the App Router
- React 19 + TypeScript
- Tailwind CSS v4
- ESLint (`eslint-config-next`)

## Getting started

Requirements: Node.js 22+ and npm 10+.

```bash
npm ci        # install exact dependencies from package-lock.json
npm run dev   # start the dev server on http://localhost:3000
```

Then open [http://localhost:3000](http://localhost:3000).

## Available scripts

| Script          | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the development server         |
| `npm run build` | Create a production build            |
| `npm run start` | Serve the production build           |
| `npm run lint`  | Run ESLint                           |

## API

`GET /api/contact` — returns studio metadata and the count of received inquiries.

`POST /api/contact` — accepts a JSON project inquiry (`name`, `email`, `service`, `message`), validates it, and returns a confirmation with a reference id. Inquiries are stored in memory for the demo and reset on restart.

```bash
curl -s http://localhost:3000/api/contact
curl -s -X POST http://localhost:3000/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ada","email":"ada@studio.com","service":"Interactive Web","message":"We need a new marketing site."}'
```

## Project structure

```
src/app/
  layout.tsx          # Root layout + metadata
  page.tsx            # Landing page
  contact-form.tsx    # Client component (project inquiry form)
  globals.css         # Tailwind + theme tokens
  api/contact/route.ts# Inquiry API (Route Handler)
```

## Cloud Agent environment

`.cursor/environment.json` configures the Cursor Cloud Agent environment: `npm ci` installs dependencies and a `dev` terminal runs the Next.js dev server on port 3000.
