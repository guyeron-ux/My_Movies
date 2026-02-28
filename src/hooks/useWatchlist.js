import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from '../lib/supabase'

export function useWatchlist(profileId) {
  const [watchlist, setWatchlist] = useState([])
  const [watchlistIds, setWatchlistIds] = useState(new Set())
  const [loading, setLoading] = useState(false)

  async function load() {
    if (!profileId) return
    setLoading(true)
    try {
      const data = await getWatchlist(profileId)
      setWatchlist(data)
      setWatchlistIds(new Set(data.map((w) => w.movie_id)))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function toggleWatchlist(movie) {
    const isIn = watchlistIds.has(movie.id)
    try {
      if (isIn) {
        await removeFromWatchlist(profileId, movie.id)
        setWatchlist((prev) => prev.filter((w) => w.movie_id !== movie.id))
        setWatchlistIds((prev) => {
          const s = new Set(prev)
          s.delete(movie.id)
          return s
        })
        toast('הוסר מרשימת הצפייה', { icon: '🗑️' })
      } else {
        await addToWatchlist({
          profileId,
          movieId: movie.id,
          movieTitle: movie.title,
          moviePoster: movie.poster_path,
        })
        setWatchlist((prev) => [
          {
            movie_id: movie.id,
            movie_title: movie.title,
            movie_poster: movie.poster_path,
            added_at: new Date().toISOString(),
          },
          ...prev,
        ])
        setWatchlistIds((prev) => new Set([...prev, movie.id]))
        toast.success('נוסף לרשימת הצפייה! 📌')
      }
    } catch (e) {
      console.error(e)
      toast.error('שגיאה בעדכון הרשימה')
    }
  }

  useEffect(() => {
    load()
  }, [profileId])

  return { watchlist, watchlistIds, toggleWatchlist, loading, reload: load }
}
