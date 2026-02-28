import { motion } from 'framer-motion'

const TABS = [
  { id: 'recommendations', label: 'המלצות', icon: '⭐' },
  { id: 'search', label: 'חיפוש', icon: '🔍' },
  { id: 'watchlist', label: 'רשימת צפייה', icon: '📌' },
  { id: 'myratings', label: 'הדירוגים שלי', icon: '🎬' },
]

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 card-glass border-t border-brand-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex-1 relative py-4 flex flex-col items-center gap-1 transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute top-0 left-4 right-4 h-0.5 bg-purple-500 rounded-full"
                  />
                )}
                <span className="text-2xl">{tab.icon}</span>
                <span
                  className={`text-xs font-medium transition-colors ${
                    isActive ? 'text-purple-300' : 'text-gray-500'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
