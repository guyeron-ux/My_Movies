const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE = 'https://image.tmdb.org/t/p'

function getHeaders() {
  return {
    Authorization: `Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  }
}

async function tmdbFetch(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`)
  url.searchParams.set('language', 'he-IL')
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value)
    }
  }

  const res = await fetch(url.toString(), { headers: getHeaders() })
  if (!res.ok) {
    throw new Error(`TMDB error ${res.status}: ${res.statusText}`)
  }
  return res.json()
}

export function posterUrl(posterPath, size = 'w500') {
  if (!posterPath) return null
  return `${IMAGE_BASE}/${size}${posterPath}`
}

export function logoUrl(logoPath) {
  if (!logoPath) return null
  return `${IMAGE_BASE}/original${logoPath}`
}

export async function getPopularMovies(page = 1) {
  return tmdbFetch('/movie/popular', { region: 'IL', page })
}

export async function searchMovies(query, page = 1) {
  return tmdbFetch('/search/movie', {
    query,
    include_adult: false,
    page,
  })
}

export async function getMovieDetails(movieId) {
  const data = await tmdbFetch(`/movie/${movieId}`, {
    append_to_response: 'credits,watch/providers',
  })
  return data
}

export async function discoverMovies({
  genreIds = [],
  page = 1,
  minVoteCount = 100,
} = {}) {
  return tmdbFetch('/discover/movie', {
    with_genres: genreIds.join(','),
    sort_by: 'vote_average.desc',
    include_adult: false,
    'vote_count.gte': minVoteCount,
    watch_region: 'IL',
    page,
  })
}

export function extractWatchProviders(movieDetails) {
  const results = movieDetails?.['watch/providers']?.results
  if (!results?.IL) return []

  const il = results.IL
  const providers = [
    ...(il.flatrate ?? []),
    ...(il.free ?? []),
    ...(il.ads ?? []),
  ]

  // Deduplicate by provider_id
  const seen = new Set()
  return providers.filter((p) => {
    if (seen.has(p.provider_id)) return false
    seen.add(p.provider_id)
    return true
  })
}

// Lightweight per-movie providers fetch with session cache
const _providerCache = new Map()

export async function getWatchProviders(movieId) {
  if (_providerCache.has(movieId)) return _providerCache.get(movieId)

  const data = await tmdbFetch(`/movie/${movieId}/watch/providers`)
  const il = data?.results?.IL

  const providers = il
    ? (() => {
        const all = [
          ...(il.flatrate ?? []),
          ...(il.free ?? []),
          ...(il.ads ?? []),
        ]
        const seen = new Set()
        return all.filter((p) => {
          if (seen.has(p.provider_id)) return false
          seen.add(p.provider_id)
          return true
        })
      })()
    : []

  _providerCache.set(movieId, providers)
  return providers
}

export function extractCast(movieDetails) {
  return (movieDetails?.credits?.cast ?? []).slice(0, 3).map((c) => ({
    id: c.id,
    name: c.name,
  }))
}

export function extractDirector(movieDetails) {
  const crew = movieDetails?.credits?.crew ?? []
  return crew.find((c) => c.job === 'Director') ?? null
}
