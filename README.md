# 🎬 הסרטים שלי

אפליקציית דירוג סרטים לילדים בעברית. פרופילים אישיים עם קוד סודי, המלצות מותאמות אישית, וחיפוש סרטים עם מידע על שירותי הסטרימינג בישראל.

## Setup

### 1. Clone & Install

```bash
git clone <repo>
cd my-movies
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
```

Fill in `.env`:

| Variable | Where to get it |
|---|---|
| `VITE_TMDB_ACCESS_TOKEN` | [TMDB API Settings](https://www.themoviedb.org/settings/api) → "API Read Access Token" |
| `VITE_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |

### 3. Supabase Database

Run this SQL in your Supabase SQL editor:

```sql
-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  pin TEXT NOT NULL,
  avatar TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ratings
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  movie_title TEXT NOT NULL,
  movie_poster TEXT,
  genre_ids JSONB DEFAULT '[]',
  cast_ids JSONB DEFAULT '[]',
  director_id INTEGER,
  rating INTEGER NOT NULL CHECK (rating IN (1, 2, 3)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, movie_id)
);

-- Taste profile
CREATE TABLE taste_profiles (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  liked_genres JSONB DEFAULT '{}',
  disliked_genres JSONB DEFAULT '{}',
  liked_actors JSONB DEFAULT '{}',
  liked_directors JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Watchlist
CREATE TABLE watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  movie_title TEXT NOT NULL,
  movie_poster TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, movie_id)
);

-- RLS (open access — PIN-protected at app level)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE taste_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow all" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all" ON ratings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all" ON taste_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all" ON watchlist FOR ALL USING (true) WITH CHECK (true);
```

### 4. Run Locally

```bash
npm run dev
# → http://localhost:5173
```

### 5. Deploy to Vercel

1. Push to GitHub
2. Import repo in [Vercel](https://vercel.com)
3. Add the 3 environment variables
4. Deploy ✅

## Features

- **Multiple profiles** — each child has a name, emoji avatar, and 4-digit PIN
- **Movie search** — Hebrew titles via TMDB, with Israeli streaming providers
- **3-button rating** — ❤️ אהבתי מאוד / 😐 בסדר / 😢 לא אהבתי
- **Personalized recommendations** — based on liked genres/actors
- **RTL Hebrew UI** — Heebo font, dark theme

## Tech Stack

- Vite + React 18
- Tailwind CSS (RTL)
- Framer Motion
- Supabase (PostgreSQL)
- TMDB API
