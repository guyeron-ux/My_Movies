import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getRatingsByProfile } from '../lib/supabase'
import { posterUrl } from '../lib/tmdb'
import MovieModal from './MovieModal'

const FILTER_OPTIONS = [
  { value: 'all', label: 'הכל', icon: '🎬' },
  { value: 3, label: 'אהבתי מאוד', icon: '❤️' },
  { value: 2, label: 'בסדר', icon: '😐' },
  { value: 1, label: 'לא אהבתי', icon: '😢' },
]

export default function MyRatingsView({ profile, fetchDetails, watchlistProps = {} }) {
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedMovie, setSelectedMovie] = useState(null)
  const { watchlistIds = new Set(), onWatchlist } = watchlistProps

  async function loadRatings() {
    setLoading(true)
    try {
      const data = await getRatingsByProfile(profile.id)
      setRatings(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRatings()
  }, [profile.id])

  const filtered =
    filter === 'all' ? ratings : ratings.filter((r) => r.rating === filter)

  return (
    <div className="p-8">
      <h2 className="text-2xl font-black mb-6">הדירוגים שלי 🎬</h2>

      {/* Filter tabs */}
      <div className="flex gap-3 mb-8 flex-wrap">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              filter === opt.value
                ? 'bg-purple-600 text-white'
                : 'bg-brand-card border border-brand-border text-gray-400 hover:text-white hover:border-purple-500'
            }`}
          >
            <span>{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-wrap gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-48 h-72 bg-brand-card rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🍿</div>
          <p className="text-gray-400 text-lg">
            {ratings.length === 0
              ? 'עדיין לא דירגת סרטים. לך לחפש!'
              : 'אין סרטים בקטגוריה הזו'}
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-5"
        >
          {filtered.map((r, i) => {
            const movie = {
              id: r.movie_id,
              title: r.movie_title,
              poster_path: r.movie_poster,
            }
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedMovie(movie)}
                className="cursor-pointer group"
              >
                <div className="relative w-48">
                  <div className="w-48 h-72 rounded-2xl overflow-hidden bg-brand-card border border-brand-border group-hover:border-purple-500 transition-colors">
                    {r.movie_poster ? (
                      <img
                        src={posterUrl(r.movie_poster)}
                        alt={r.movie_title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">
                        🎬
                      </div>
                    )}
                  </div>

                  {/* Rating badge */}
                  <div
                    className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                      r.rating === 3
                        ? 'bg-green-600'
                        : r.rating === 2
                        ? 'bg-amber-500'
                        : 'bg-red-600'
                    }`}
                  >
                    {r.rating === 3 ? '❤️' : r.rating === 2 ? '😐' : '😢'}
                  </div>

                  <p className="mt-2 text-white text-sm font-semibold line-clamp-2 text-right px-1">
                    {r.movie_title}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          profileId={profile.id}
          onClose={() => setSelectedMovie(null)}
          onRated={loadRatings}
          fetchDetails={fetchDetails}
          isWatchlisted={watchlistIds.has(selectedMovie.id)}
          onWatchlist={onWatchlist}
        />
      )}
    </div>
  )
}
