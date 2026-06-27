# SmilePad MVP

One-page SmilePad waitlist site built with Vite, React, TypeScript, and Supabase.

## Local Setup

Create `.env.local` with the browser-safe Supabase values:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

Do not expose `SUPABASE_SECRET_KEY` in frontend code. It is server-side only.

## Supabase Schema

Run `supabase/migrations/20260626120000_create_waitlist_signups.sql` in the target project SQL Editor, or apply it through a Supabase account that has permission to manage the project.

If the site returns `PGRST205` (`Could not find the table 'public.waitlist_signups' in the schema cache`), the table has not been created in the target project or PostgREST has not refreshed yet. Re-run the migration SQL above; it ends with `notify pgrst, 'reload schema';` to refresh the Data API schema cache.

Expected security model:

- anonymous users can insert waitlist emails
- anonymous users cannot read, update, or delete waitlist rows
- no child name, age, school, or health details are collected

## Commands

```bash
npm install
npm run dev
npm run build
npm run waitlist:emails
```

## Hero Image Optimization

The homepage hero image uses responsive JPEG variants generated from the original large PNG:

- `public/assets/hero/smilepad-hero-480.jpg`
- `public/assets/hero/smilepad-hero-768.jpg`
- `public/assets/hero/smilepad-hero-1100.jpg`
- `public/assets/hero/smilepad-hero-1510.jpg`

The React page uses `srcset`/`sizes`, so phones download the smaller image and desktop screens download the larger image. The image is above the fold, so it is preloaded in `index.html` and marked with `fetchPriority="high"`.
