import { useState, useCallback } from 'react'
import { getPopularMovies, searchMovies, getMovieDetails } from '../lib/tmdb'

const detailCache = new Map()

export function useMovies() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPopular = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getPopularMovies()
      setMovies(data.results ?? [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const search = useCallback(async (query) => {
    if (!query.trim()) {
      setMovies([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await searchMovies(query)
      setMovies(data.results ?? [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchDetails = useCallback(async (movieId) => {
    if (detailCache.has(movieId)) return detailCache.get(movieId)
    const data = await getMovieDetails(movieId)
    detailCache.set(movieId, data)
    return data
  }, [])

  return { movies, loading, error, fetchPopular, search, fetchDetails }
}
