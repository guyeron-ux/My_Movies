import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useProfile } from './hooks/useProfile'
import { useMovies } from './hooks/useMovies'
import { useWatchlist } from './hooks/useWatchlist'
import ProfileSelector from './components/ProfileSelector'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import RecommendationsGrid from './components/RecommendationsGrid'
import SearchView from './components/SearchView'
import WatchlistView from './components/WatchlistView'
import MyRatingsView from './components/MyRatingsView'

const PAGE_PADDING_BOTTOM = 'pb-24' // room for BottomNav

export default function App() {
  const { profile, setProfile, logout } = useProfile()
  const [activeTab, setActiveTab] = useState('recommendations')
  const { fetchDetails } = useMovies()
  const { watchlist, watchlistIds, toggleWatchlist, loading: watchlistLoading } = useWatchlist(
    profile?.id,
  )

  // Not logged in — show profile selector
  if (!profile) {
    return <ProfileSelector onProfileSelected={setProfile} />
  }

  // Shared watchlist props passed to every view that shows MovieCards
  const watchlistProps = { watchlistIds, onWatchlist: toggleWatchlist }

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={profile} onLogout={logout} />

      <main className={`flex-1 max-w-6xl mx-auto w-full ${PAGE_PADDING_BOTTOM}`}>
        <AnimatePresence mode="wait">
          {activeTab === 'recommendations' && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <RecommendationsGrid
                profile={profile}
                fetchDetails={fetchDetails}
                watchlistProps={watchlistProps}
              />
            </motion.div>
          )}

          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <SearchView
                profile={profile}
                fetchDetails={fetchDetails}
                watchlistProps={watchlistProps}
              />
            </motion.div>
          )}

          {activeTab === 'watchlist' && (
            <motion.div
              key="watchlist"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <WatchlistView
                profile={profile}
                watchlist={watchlist}
                watchlistIds={watchlistIds}
                toggleWatchlist={toggleWatchlist}
                loading={watchlistLoading}
                fetchDetails={fetchDetails}
              />
            </motion.div>
          )}

          {activeTab === 'myratings' && (
            <motion.div
              key="myratings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <MyRatingsView
                profile={profile}
                fetchDetails={fetchDetails}
                watchlistProps={watchlistProps}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
