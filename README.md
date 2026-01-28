# Shifter Lite PWA

A lightweight, offline-first shift planning application designed as a Progressive Web App (PWA). This project mimics functionality of shift planning tools, allowing users to "paint" shifts onto a calendar.

## Architecture

- **Frontend:** React (TypeScript), Tailwind CSS.
- **Backend:** Supabase (PostgreSQL, Auth, Realtime).
- **Persistence:** LocalStorage (Offline) + Supabase Sync (Online).
- **PWA:** Service Worker for asset caching and installability.

## Setup Instructions

### 1. Prerequisites
- Node.js and npm installed.
- A Supabase account.

### 2. Supabase Setup
1. Create a new project in [Supabase](https://app.supabase.com).
2. Go to the SQL Editor.
3. Copy the content of `sql/schema.sql` and run it to create tables and security policies.
4. (Optional) Run `sql/seeds.sql` to populate initial test data.

### 3. Local Configuration
1. Create a `.env` file in the root directory.
2. Add your Supabase credentials (you can find these in your Supabase Project Settings > API):
   ```
   REACT_APP_SUPABASE_URL=your_project_url
   REACT_APP_SUPABASE_ANON_KEY=your_anon_key
   ```

### 4. Run
```bash
npm install
npm run dev
```

## User Guide (Painting Flow)
1. **Select Shift:** Tap a shift type in the bottom palette (e.g., Morning, Night).
2. **Paint:** Tap or drag across days in the calendar to assign that shift.
3. **Erase:** Select the "Clear" (Eraser) tool and tap days to remove shifts.
4. **Edit Types:** Click the Pencil icon in the palette to create or modify shift types.
5. **Navigation:** Use the top header to change months or jump to today.

## Deployment
This app is ready to be deployed to Vercel, Netlify, or any static host. Ensure build commands are set to `npm run build` and output directory is `build` or `dist`. 

**Important:** When deploying, you must configure the Environment Variables (`REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`) in your hosting provider's dashboard.

## Future Roadmap
- Google Calendar 2-way sync.
- Advanced rotation patterns (e.g., 6-on 2-off).
- Team sharing and readonly views.