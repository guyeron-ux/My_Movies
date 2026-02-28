import { motion } from 'framer-motion'

const RATINGS = [
  {
    value: 1,
    emoji: '😢',
    label: 'לא אהבתי',
    className: 'gradient-disliked',
    hoverClass: 'hover:brightness-110',
  },
  {
    value: 2,
    emoji: '😐',
    label: 'בסדר',
    className: 'gradient-okay',
    hoverClass: 'hover:brightness-110',
  },
  {
    value: 3,
    emoji: '❤️',
    label: 'אהבתי מאוד',
    className: 'gradient-loved',
    hoverClass: 'hover:brightness-110',
  },
]

export default function RatingButtons({ currentRating, onRate, loading }) {
  return (
    <div className="flex gap-3 w-full">
      {RATINGS.map((r) => {
        const isSelected = currentRating === r.value
        return (
          <motion.button
            key={r.value}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onRate(r.value)}
            disabled={loading}
            className={`
              flex-1 flex flex-col items-center gap-2 py-4 px-3 rounded-2xl font-black text-white transition-all
              ${r.className} ${r.hoverClass}
              ${isSelected ? 'ring-4 ring-white/50 scale-105 shadow-lg' : 'opacity-85'}
              disabled:opacity-50 cursor-pointer
            `}
          >
            <span className="text-3xl">{r.emoji}</span>
            <span className="text-sm font-bold">{r.label}</span>
          </motion.button>
        )
      })}
    </div>
  )
}
