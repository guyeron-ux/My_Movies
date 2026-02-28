import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// DEBUG — remove after confirming env vars are set
console.log('[debug] VITE_SUPABASE_URL:', supabaseUrl)
console.log('[debug] VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? supabaseAnonKey.slice(0, 20) + '…' : 'undefined')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Profiles ───────────────────────────────────────────────────────────────

export async function getProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function createProfile({ name, avatar, pin }) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({ name, avatar, pin })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function verifyPin(profileId, pin) {
  const { data, error } = await supabase
    .from('profiles')
    .select('pin')
    .eq('id', profileId)
    .single()
  if (error) throw error
  return data.pin === pin
}

// ─── Ratings ─────────────────────────────────────────────────────────────────

export async function getRatingsByProfile(profileId) {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getRatingForMovie(profileId, movieId) {
  const { data, error } = await supabase
    .from('ratings')
    .select('rating')
    .eq('profile_id', profileId)
    .eq('movie_id', movieId)
    .maybeSingle()
  if (error) throw error
  return data?.rating ?? null
}

export async function upsertRating({
  profileId,
  movieId,
  movieTitle,
  moviePoster,
  genreIds,
  castIds,
  directorId,
  rating,
}) {
  const { error } = await supabase.from('ratings').upsert(
    {
      profile_id: profileId,
      movie_id: movieId,
      movie_title: movieTitle,
      movie_poster: moviePoster,
      genre_ids: genreIds,
      cast_ids: castIds,
      director_id: directorId,
      rating,
    },
    { onConflict: 'profile_id,movie_id' },
  )
  if (error) throw error
}

export async function getRatedMovieIds(profileId) {
  const { data, error } = await supabase
    .from('ratings')
    .select('movie_id')
    .eq('profile_id', profileId)
  if (error) throw error
  return data.map((r) => r.movie_id)
}

// ─── Watchlist ───────────────────────────────────────────────────────────────

export async function getWatchlist(profileId) {
  const { data, error } = await supabase
    .from('watchlist')
    .select('*')
    .eq('profile_id', profileId)
    .order('added_at', { ascending: false })
  if (error) throw error
  return data
}

export async function addToWatchlist({ profileId, movieId, movieTitle, moviePoster }) {
  const { error } = await supabase.from('watchlist').upsert(
    { profile_id: profileId, movie_id: movieId, movie_title: movieTitle, movie_poster: moviePoster },
    { onConflict: 'profile_id,movie_id' },
  )
  if (error) throw error
}

export async function removeFromWatchlist(profileId, movieId) {
  const { error } = await supabase
    .from('watchlist')
    .delete()
    .eq('profile_id', profileId)
    .eq('movie_id', movieId)
  if (error) throw error
}

export async function getWatchlistIds(profileId) {
  const { data, error } = await supabase
    .from('watchlist')
    .select('movie_id')
    .eq('profile_id', profileId)
  if (error) throw error
  return new Set(data.map((w) => w.movie_id))
}

// ─── Taste Profile ───────────────────────────────────────────────────────────

export async function getTasteProfile(profileId) {
  const { data, error } = await supabase
    .from('taste_profiles')
    .select('*')
    .eq('profile_id', profileId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function upsertTasteProfile(profileId, updates) {
  const { error } = await supabase.from('taste_profiles').upsert(
    { profile_id: profileId, ...updates, updated_at: new Date().toISOString() },
    { onConflict: 'profile_id' },
  )
  if (error) throw error
}

// ─── Taste Profile Update Logic ──────────────────────────────────────────────

export async function updateTasteProfile({
  profileId,
  genreIds,
  castIds,
  directorId,
  rating,
}) {
  const existing = await getTasteProfile(profileId)

  const likedGenres = { ...(existing?.liked_genres ?? {}) }
  const dislikedGenres = { ...(existing?.disliked_genres ?? {}) }
  const likedActors = { ...(existing?.liked_actors ?? {}) }
  const likedDirectors = { ...(existing?.liked_directors ?? {}) }

  if (rating === 3) {
    // Loved
    for (const g of genreIds) {
      likedGenres[g] = (likedGenres[g] ?? 0) + 2
    }
    for (const a of castIds) {
      likedActors[a] = (likedActors[a] ?? 0) + 1
    }
    if (directorId) {
      likedDirectors[directorId] = (likedDirectors[directorId] ?? 0) + 1
    }
  } else if (rating === 2) {
    // Okay
    for (const g of genreIds) {
      likedGenres[g] = (likedGenres[g] ?? 0) + 0.5
    }
  } else if (rating === 1) {
    // Disliked
    for (const g of genreIds) {
      dislikedGenres[g] = (dislikedGenres[g] ?? 0) + 1
      likedGenres[g] = (likedGenres[g] ?? 0) - 1
    }
  }

  await upsertTasteProfile(profileId, {
    liked_genres: likedGenres,
    disliked_genres: dislikedGenres,
    liked_actors: likedActors,
    liked_directors: likedDirectors,
  })
}
