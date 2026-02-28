import { getTasteProfile, getRatedMovieIds } from './supabase'
import { discoverMovies, getPopularMovies } from './tmdb'

function topKeys(obj, n = 3, excludeKeys = []) {
  return Object.entries(obj ?? {})
    .filter(([k]) => !excludeKeys.includes(k))
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([k]) => k)
}

export async function getRecommendations(profileId, { startPage = 1 } = {}) {
  const [taste, ratedIds] = await Promise.all([
    getTasteProfile(profileId),
    getRatedMovieIds(profileId),
  ])

  const ratedSet = new Set(ratedIds)

  let movies = []

  if (taste && Object.keys(taste.liked_genres ?? {}).length > 0) {
    const dislikedKeys = Object.keys(taste.disliked_genres ?? {})
    const topGenres = topKeys(taste.liked_genres, 3, dislikedKeys)

    if (topGenres.length > 0) {
      const [page1, page2] = await Promise.all([
        discoverMovies({ genreIds: topGenres, page: startPage }),
        discoverMovies({ genreIds: topGenres, page: startPage + 1 }),
      ])
      movies = [...(page1.results ?? []), ...(page2.results ?? [])]
    }
  }

  // Fallback to popular if not enough results
  if (movies.length < 10) {
    const popular = await getPopularMovies(startPage)
    movies = [...movies, ...(popular.results ?? [])]
  }

  // Deduplicate and filter already-rated
  const seen = new Set()
  return movies
    .filter((m) => {
      if (seen.has(m.id) || ratedSet.has(m.id)) return false
      seen.add(m.id)
      return true
    })
    .slice(0, 20)
}
