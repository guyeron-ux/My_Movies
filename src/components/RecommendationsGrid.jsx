import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRecommendations } from '../hooks/useRecommendations'
import MovieCard from './MovieCard'
import MovieModal from './MovieModal'

export default function RecommendationsGrid({ profile, fetchDetails, watchlistProps = {} }) {
  const { recommendations, loading, error, refresh } = useRecommendations(
    profile.id,
  )
  const [selectedMovie, setSelectedMovie] = useState(null)
  const { watchlistIds = new Set(), onWatchlist } = watchlistProps

  function handleRated() {
    // Refresh recommendations after rating
    setTimeout(refresh, 500)
  }

  if (loading) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-black mb-6">המלצות בשבילך ⭐</h2>
        <div className="flex flex-wrap gap-5">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="w-48 h-72 bg-brand-card rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-4">😬</div>
        <p className="text-red-400 mb-4">שגיאה בטעינת המלצות</p>
        <button
          onClick={refresh}
          className="px-6 py-2 bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors"
        >
          נסה שוב
        </button>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black">
          {recommendations.length > 0 ? 'המלצות בשבילך ⭐' : 'סרטים פופולריים 🔥'}
        </h2>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={refresh}
          className="text-purple-300 hover:text-white transition-colors text-sm font-medium"
        >
          🔄 רענן
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-wrap gap-5"
      >
        {recommendations.map((movie, i) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <MovieCard
              movie={movie}
              onClick={() => setSelectedMovie(movie)}
              isWatchlisted={watchlistIds.has(movie.id)}
              onWatchlist={onWatchlist}
            />
          </motion.div>
        ))}
      </motion.div>

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          profileId={profile.id}
          onClose={() => setSelectedMovie(null)}
          onRated={handleRated}
          fetchDetails={fetchDetails}
          isWatchlisted={watchlistIds.has(selectedMovie.id)}
          onWatchlist={onWatchlist}
        />
      )}
    </div>
  )
}
