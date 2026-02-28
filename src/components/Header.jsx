import { motion } from 'framer-motion'

export default function Header({ profile, onLogout }) {
  return (
    <header className="sticky top-0 z-40 card-glass border-b border-brand-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-black text-white">🎬 הסרטים שלי</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{profile.avatar}</span>
            <span className="text-white font-semibold">{profile.name}</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="px-4 py-2 rounded-lg bg-brand-card border border-brand-border text-purple-300 hover:text-white hover:border-purple-500 transition-colors text-sm font-medium"
          >
            החלף משתמש
          </motion.button>
        </div>
      </div>
    </header>
  )
}
