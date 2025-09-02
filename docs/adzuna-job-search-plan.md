# Adzuna Quick-Win Integration Plan

## 1. Adzuna Signup & Env
1. Sign up at https://developer.adzuna.com/ and get your `APP_ID` & `APP_KEY`.
2. Add to your `.env` (and Vercel settings):
   ```bash
   ADZUNA_APP_ID=your_app_id
   ADZUNA_APP_KEY=your_app_key
   ADZUNA_COUNTRY=us    # default country code
   ```

## 2. Server-Side Proxy Endpoint
Create a Next.js API route at `pages/api/jobs.ts` (or equivalent):

- Accept query params: `q`, `location`, `page`, and filters (`salary_min`, `full_time`, etc.)
- Build Adzuna URL:
  ```js
  const url = `https://api.adzuna.com/v1/api/jobs/${process.env.ADZUNA_COUNTRY}/search/${page}` +
    `?app_id=${process.env.ADZUNA_APP_ID}` +
    `&app_key=${process.env.ADZUNA_APP_KEY}` +
    `&what=${q}&where=${location}` +
    (salary_min ? `&salary_min=${salary_min}` : '') +
    (full_time ? `&full_time=1` : '');
  ```
- Proxy the JSON response back to the client.

## 3. Front-End Search Page
Under `pages/jobs/index.tsx`:

1. **Search Form**: Inputs for keywords, location, and filter controls (salary slider, full-time toggle).
2. **Fetch Logic**: On submit or filter change, `fetch('/api/jobs?q=…&location=…&page=…&…')`, store results & pagination meta in state.
3. **Result List**: Render `JobCard` components showing title, company, location, salary, snippet, and an “Apply” link/button.
4. **Pagination Controls**: Prev/Next or page numbers.

## 4. “Save Job” Feature

1. **DB Schema** (Supabase):
   ```sql
   CREATE TABLE saved_jobs (
     id SERIAL PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id),
     job_id TEXT,
     title TEXT,
     company TEXT,
     location TEXT,
     redirect_url TEXT,
     saved_at TIMESTAMP DEFAULT NOW()
   );
   ```
2. **API Routes**:
   - `POST /api/jobs/save` → Upsert a job into `saved_jobs` for the authenticated user.
   - `GET  /api/jobs/saved` → List the current user’s saved jobs.
3. **UI**:
   - Add a “Save” icon/button on each `JobCard`.
   - Create `/jobs/saved` page to list and remove saved jobs.

## 5. UX & Polish
- Show loading spinners and error states.
- Debounce search input (≈300 ms) for instant feedback.
- Display “No results found” messaging when appropriate.
- Style forms and cards to match your site’s theme.

## 6. Testing & Deployment
1. Test search and save flows locally.
2. Verify Vercel function limits and add throttling if needed.
3. Deploy to staging, QA end-to-end, then push to production.
