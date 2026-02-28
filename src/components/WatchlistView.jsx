import { useState } from 'react'
import { motion } from 'framer-motion'
import { posterUrl } from '../lib/tmdb'
import MovieModal from './MovieModal'

export default function WatchlistView({ profile, watchlist, watchlistIds, toggleWatchlist, loading, fetchDetails }) {
  const [selectedMovie, setSelectedMovie] = useState(null)

  if (loading) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-black mb-6">רשימת הצפייה שלי 📌</h2>
        <div className="flex flex-wrap gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-48 h-72 bg-brand-card rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black">
          רשימת הצפייה שלי 📌
          {watchlist.length > 0 && (
            <span className="mr-2 text-lg font-medium text-purple-300">
              ({watchlist.length})
            </span>
          )}
        </h2>
      </div>

      {watchlist.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔖</div>
          <p className="text-gray-400 text-lg">
            רשימת הצפייה שלך ריקה
          </p>
          <p className="text-gray-600 text-sm mt-2">
            לחץ על 🔖 על כרטיס סרט כדי להוסיף
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-5"
        >
          {watchlist.map((item, i) => {
            const movie = {
              id: item.movie_id,
              title: item.movie_title,
              poster_path: item.movie_poster,
            }
            return (
              <motion.div
                key={item.movie_id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="relative group"
              >
                {/* Poster */}
                <div
                  className="w-48 h-72 rounded-2xl overflow-hidden bg-brand-card border border-brand-border group-hover:border-purple-500 transition-colors cursor-pointer"
                  onClick={() => setSelectedMovie(movie)}
                >
                  {item.movie_poster ? (
                    <img
                      src={posterUrl(item.movie_poster)}
                      alt={item.movie_title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      🎬
                    </div>
                  )}
                </div>

                {/* Remove button */}
                <button
                  onClick={() => toggleWatchlist(movie)}
                  title="הסר מהרשימה"
                  className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 hover:bg-red-500 text-sm shadow-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  📌
                </button>

                <p
                  className="mt-2 text-white text-sm font-semibold line-clamp-2 text-right px-1 cursor-pointer"
                  onClick={() => setSelectedMovie(movie)}
                >
                  {item.movie_title}
                </p>
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
          fetchDetails={fetchDetails}
          isWatchlisted={watchlistIds.has(selectedMovie.id)}
          onWatchlist={toggleWatchlist}
        />
      )}
    </div>
  )
}
