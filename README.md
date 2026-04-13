# Concept Imprint

Concept Imprint is a high-performance, cross-platform application designed for rapid idea capture, organization, and instantaneous cloud synchronization. Built on modern web architecture and natively wrapped for mobile deployment, the application provides a frictionless experience across desktop, web, and native mobile environments.

## Architecture

The system utilizes a local-first design paradigm ensuring offline capabilities while maintaining real-time parity with cloud infrastructure.

- **Frontend framework:** React, TypeScript, Vite
- **Cross-platform integration:** Capacitor
- **Local offline persistence:** IndexedDB (via Dexie.js)
- **Cloud synchronization backend:** Supabase
- **UI & Animations:** Vanilla CSS, Framer Motion

## Features

- **Instant Capture:** Global keyboard shortcuts (Ctrl + Shift + I) allow developers to record thoughts without breaking focus.
- **Native Voice Dictation:** Directly interfaces with native iOS and Android hardware APIs to transcribe voice to text automatically.
- **Intelligent Syntax Parsing:** Automatically extracts and categorizes `#tags` from raw text input.
- **Background Synchronization:** Gracefully handles offline activity by queueing database mutations and rapidly syncing via two-way diffing when network connectivity is restored.
- **Responsive Architecture:** A meticulously coded flex-grid that scales pixel-perfectly from 4K desktop monitors down to mobile portrait interfaces, backed by a fully featured dark mode.

## Development Setup

The project relies on a standard Node.js ecosystem. Ensure Node.js and NPM are installed prior to proceeding.

### Local Web Development
1. Install standard dependencies:
   ```bash
   npm install
   ```
2. Configure environmental variables. Create a `.env.local` file at the root directory with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```
3. Boot the local development server:
   ```bash
   npm run dev
   ```

### Native Mobile Compilation
To compile the system into native Android or iOS formats, the application utilizes Capacitor.

1. Generate the optimized web build and synchronize it with the native wrappers:
   ```bash
   npm run build
   npx cap sync
   ```
2. Build the Android release natively (Requires Android SDK):
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
3. Or open the project in Android Studio / Xcode:
   ```bash
   npx cap open android
   npx cap open ios
   ```

## Database Schema Representation

For synchronization to function correctly, the following table structure must exist within the connected Supabase instance:

```sql
create table public.ideas (
  id uuid primary key,
  title text not null,
  description text,
  tags text[],
  status text check (status in ('Raw', 'Developing', 'Project')),
  priority text check (priority in ('Low', 'Medium', 'High')),
  created_at bigint not null,
  updated_at bigint not null
);
```
