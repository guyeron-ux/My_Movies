import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  posterUrl,
  logoUrl,
  extractWatchProviders,
  extractCast,
  extractDirector,
} from '../lib/tmdb'
import {
  upsertRating,
  getRatingForMovie,
  updateTasteProfile,
} from '../lib/supabase'
import RatingButtons from './RatingButtons'

export default function MovieModal({ movie, profileId, onClose, onRated, fetchDetails, isWatchlisted, onWatchlist }) {
  const [details, setDetails] = useState(null)
  const [providers, setProviders] = useState([])
  const [currentRating, setCurrentRating] = useState(null)
  const [loading, setLoading] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(true)

  useEffect(() => {
    if (!movie) return

    async function load() {
      setDetailsLoading(true)
      try {
        const [d, existingRating] = await Promise.all([
          fetchDetails(movie.id),
          getRatingForMovie(profileId, movie.id),
        ])
        setDetails(d)
        setProviders(extractWatchProviders(d))
        setCurrentRating(existingRating)
      } catch (e) {
        console.error(e)
      } finally {
        setDetailsLoading(false)
      }
    }

    load()
  }, [movie?.id])

  async function handleRate(ratingValue) {
    if (!details) return
    setLoading(true)
    try {
      const cast = extractCast(details)
      const director = extractDirector(details)

      await upsertRating({
        profileId,
        movieId: movie.id,
        movieTitle: movie.title,
        moviePoster: movie.poster_path,
        genreIds: (details.genres ?? []).map((g) => g.id),
        castIds: cast.map((c) => c.id),
        directorId: director?.id ?? null,
        rating: ratingValue,
      })

      await updateTasteProfile({
        profileId,
        genreIds: (details.genres ?? []).map((g) => g.id),
        castIds: cast.map((c) => c.id),
        directorId: director?.id ?? null,
        rating: ratingValue,
      })

      setCurrentRating(ratingValue)

      const labels = { 1: 'לא אהבת 😢', 2: 'בסדר 😐', 3: 'אהבת מאוד ❤️' }
      toast.success(`הדירוג נשמר! ${labels[ratingValue]}`)
      onRated?.()
    } catch (e) {
      console.error(e)
      toast.error('שגיאה בשמירת הדירוג')
    } finally {
      setLoading(false)
    }
  }

  const poster = posterUrl(movie?.poster_path, 'w500')
  const backdropUrl = details?.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}`
    : null

  return (
    <AnimatePresence>
      {movie && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            className="fixed inset-4 z-50 max-w-3xl mx-auto my-auto h-fit max-h-[90vh] overflow-y-auto rounded-3xl card-glass shadow-2xl"
          >
            {/* Backdrop image */}
            {backdropUrl && (
              <div className="relative h-48 overflow-hidden rounded-t-3xl">
                <img
                  src={backdropUrl}
                  alt=""
                  className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-card/90" />
              </div>
            )}

            <div className="p-6">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10 text-xl"
              >
                ✕
              </button>

              {/* Watchlist button */}
              {onWatchlist && (
                <button
                  onClick={() => onWatchlist(movie)}
                  title={isWatchlisted ? 'הסר מרשימת הצפייה' : 'הוסף לרשימת הצפייה'}
                  className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-bold transition-all z-10 ${
                    isWatchlisted
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-black/50 text-white hover:bg-blue-500'
                  }`}
                >
                  <span>{isWatchlisted ? '📌' : '🔖'}</span>
                  <span>{isWatchlisted ? 'ברשימה' : 'שמור'}</span>
                </button>
              )}

              <div className="flex gap-6">
                {/* Poster */}
                <div className="flex-shrink-0">
                  {poster ? (
                    <img
                      src={poster}
                      alt={movie.title}
                      className="w-32 h-48 object-cover rounded-xl shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-48 bg-brand-border rounded-xl flex items-center justify-center text-4xl">
                      🎬
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-black text-white leading-tight mb-2">
                    {movie.title}
                  </h2>

                  {detailsLoading ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-brand-border rounded animate-pulse w-3/4" />
                      <div className="h-4 bg-brand-border rounded animate-pulse w-1/2" />
                    </div>
                  ) : (
                    <>
                      {/* Year & rating */}
                      <div className="flex items-center gap-3 mb-3 text-sm text-gray-400">
                        {details?.release_date && (
                          <span>{details.release_date.slice(0, 4)}</span>
                        )}
                        {details?.vote_average > 0 && (
                          <span className="flex items-center gap-1">
                            ⭐ {details.vote_average.toFixed(1)}
                          </span>
                        )}
                        {details?.runtime > 0 && (
                          <span>{details.runtime} דקות</span>
                        )}
                      </div>

                      {/* Genres */}
                      {details?.genres?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {details.genres.map((g) => (
                            <span
                              key={g.id}
                              className="px-2 py-0.5 bg-purple-900/50 text-purple-300 rounded-full text-xs font-medium border border-purple-800/50"
                            >
                              {g.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Streaming providers */}
                      {providers.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-2">זמין ב:</p>
                          <div className="flex gap-2">
                            {providers.map((p) => (
                              <img
                                key={p.provider_id}
                                src={logoUrl(p.logo_path)}
                                alt={p.provider_name}
                                title={p.provider_name}
                                className="w-8 h-8 rounded-lg object-cover"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Overview */}
              {details?.overview && (
                <p className="text-gray-300 text-sm leading-relaxed mt-4 text-right">
                  {details.overview}
                </p>
              )}

              {/* Rating buttons */}
              <div className="mt-6">
                <p className="text-center text-purple-300 font-bold mb-3">
                  מה חשבת על הסרט?
                </p>
                <RatingButtons
                  currentRating={currentRating}
                  onRate={handleRate}
                  loading={loading}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
