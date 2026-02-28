import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useMovies } from '../hooks/useMovies'
import MovieCard from './MovieCard'
import MovieModal from './MovieModal'

export default function SearchView({ profile, fetchDetails, watchlistProps = {} }) {
  const { movies, loading, search } = useMovies()
  const [query, setQuery] = useState('')
  const [selectedMovie, setSelectedMovie] = useState(null)
  const debounceRef = useRef(null)
  const { watchlistIds = new Set(), onWatchlist } = watchlistProps

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      search(query)
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  return (
    <div className="p-8">
      <h2 className="text-2xl font-black mb-6">חפש סרט 🔍</h2>

      {/* Search input */}
      <div className="relative mb-8">
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
          🔍
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="שם הסרט..."
          className="w-full max-w-xl bg-brand-card border border-brand-border rounded-2xl px-4 py-4 pr-12 text-white text-lg focus:outline-none focus:border-purple-500 transition-colors text-right placeholder:text-gray-500"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="flex flex-wrap gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-48 h-72 bg-brand-card rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && movies.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-5"
        >
          {movies.map((movie, i) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 16 }}
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
      )}

      {/* Empty state */}
      {!loading && query && movies.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🤷</div>
          <p className="text-gray-400 text-lg">לא נמצאו סרטים עבור "{query}"</p>
        </div>
      )}

      {/* Placeholder */}
      {!loading && !query && movies.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎬</div>
          <p className="text-gray-400 text-lg">הקלד שם סרט כדי לחפש</p>
        </div>
      )}

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          profileId={profile.id}
          onClose={() => setSelectedMovie(null)}
          fetchDetails={fetchDetails}
          isWatchlisted={watchlistIds.has(selectedMovie.id)}
          onWatchlist={onWatchlist}
        />
      )}
    </div>
  )
}
