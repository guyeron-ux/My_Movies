import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { posterUrl, logoUrl, getWatchProviders } from '../lib/tmdb'

const RATING_BADGE = {
  1: { emoji: '😢', bg: 'bg-red-600' },
  2: { emoji: '😐', bg: 'bg-amber-500' },
  3: { emoji: '❤️', bg: 'bg-green-600' },
}

export default function MovieCard({ movie, onClick, userRating, isWatchlisted, onWatchlist }) {
  const poster = posterUrl(movie.poster_path)
  const badge = RATING_BADGE[userRating]

  // null = loading, [] = none available, [...] = has providers
  const [providers, setProviders] = useState(null)

  useEffect(() => {
    let cancelled = false
    getWatchProviders(movie.id)
      .then((p) => { if (!cancelled) setProviders(p) })
      .catch(() => { if (!cancelled) setProviders([]) })
    return () => { cancelled = true }
  }, [movie.id])

  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative cursor-pointer group"
    >
      {/* Poster */}
      <div className="w-48 h-72 rounded-2xl overflow-hidden bg-brand-card border border-brand-border group-hover:border-purple-500 transition-colors shadow-lg">
        {poster ? (
          <img
            src={poster}
            alt={movie.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl text-brand-border">
            🎬
          </div>
        )}
      </div>

      {/* Rating badge — top-left */}
      {badge && (
        <div
          className={`absolute top-2 left-2 ${badge.bg} rounded-full w-8 h-8 flex items-center justify-center text-sm shadow-lg`}
        >
          {badge.emoji}
        </div>
      )}

      {/* Watchlist button — top-right */}
      {onWatchlist && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onWatchlist(movie)
          }}
          title={isWatchlisted ? 'הסר מרשימת הצפייה' : 'הוסף לרשימת הצפייה'}
          className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full shadow-lg transition-all text-sm
            ${isWatchlisted
              ? 'bg-blue-500 opacity-100'
              : 'bg-black/60 opacity-0 group-hover:opacity-100'
            }`}
        >
          {isWatchlisted ? '📌' : '🔖'}
        </button>
      )}

      {/* Streaming availability */}
      <div className="mt-2 px-1 h-7 flex items-center">
        {providers === null ? (
          // Loading — subtle skeleton bar
          <div className="h-3 w-20 bg-brand-border rounded animate-pulse" />
        ) : providers.length > 0 ? (
          <div className="flex items-center gap-1">
            {providers.slice(0, 4).map((p) => (
              <img
                key={p.provider_id}
                src={logoUrl(p.logo_path)}
                alt={p.provider_name}
                title={p.provider_name}
                className="w-6 h-6 rounded-md object-cover shadow-sm"
              />
            ))}
            {providers.length > 4 && (
              <span className="text-gray-500 text-xs">+{providers.length - 4}</span>
            )}
          </div>
        ) : (
          <p className="text-gray-600 text-xs">לא זמין לצפייה כרגע</p>
        )}
      </div>

      {/* Title */}
      <div className="px-1">
        <p className="text-white text-sm font-semibold leading-tight line-clamp-2 text-right">
          {movie.title}
        </p>
        {movie.release_date && (
          <p className="text-gray-500 text-xs mt-0.5">
            {movie.release_date.slice(0, 4)}
          </p>
        )}
      </div>
    </motion.div>
  )
}
