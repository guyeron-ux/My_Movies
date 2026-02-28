import { useState } from 'react'
import { motion } from 'framer-motion'
import { createProfile } from '../lib/supabase'
import toast from 'react-hot-toast'

const EMOJIS = [
  '🦁', '🐯', '🐻', '🦊', '🐼', '🐨',
  '🦄', '🐲', '🦋', '🐬', '🦁', '🦅',
  '🎮', '🚀', '⚽', '🎸', '🌈', '🍕',
  '🎭', '🏆',
]

export default function CreateProfile({ onCreated, onBack }) {
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(EMOJIS[0])
  const [pin, setPin] = useState('')
  const [step, setStep] = useState('info') // 'info' | 'pin'
  const [loading, setLoading] = useState(false)

  function handlePinDigit(digit) {
    if (pin.length < 4) {
      setPin((p) => p + digit)
    }
  }

  function handlePinBackspace() {
    setPin((p) => p.slice(0, -1))
  }

  async function handleSubmit() {
    if (pin.length !== 4) return
    setLoading(true)
    try {
      const profile = await createProfile({ name, avatar, pin })
      toast.success(`ברוך הבא, ${name}! 🎉`)
      onCreated(profile)
    } catch (e) {
      toast.error('שגיאה ביצירת הפרופיל')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (step === 'pin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-glass rounded-3xl p-10 w-full max-w-sm text-center"
        >
          <div className="text-6xl mb-4">{avatar}</div>
          <h2 className="text-2xl font-bold mb-2">{name}</h2>
          <p className="text-purple-300 mb-8">בחר קוד סודי (4 ספרות)</p>

          <div className="flex gap-4 justify-center mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl font-bold transition-all ${
                  pin.length > i
                    ? 'bg-purple-600 border-purple-400 text-white'
                    : 'border-brand-border text-transparent'
                }`}
              >
                ●
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
              <motion.button
                key={d}
                whileTap={{ scale: 0.9 }}
                onClick={() => handlePinDigit(String(d))}
                className="h-14 bg-brand-card rounded-xl text-xl font-bold hover:bg-purple-900/50 transition-colors border border-brand-border"
              >
                {d}
              </motion.button>
            ))}
            <div />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePinDigit('0')}
              className="h-14 bg-brand-card rounded-xl text-xl font-bold hover:bg-purple-900/50 transition-colors border border-brand-border"
            >
              0
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handlePinBackspace}
              className="h-14 bg-brand-card rounded-xl text-xl hover:bg-purple-900/50 transition-colors border border-brand-border"
            >
              ⌫
            </motion.button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setPin(''); setStep('info') }}
              className="flex-1 py-3 rounded-xl border border-brand-border text-purple-300 hover:bg-brand-card transition-colors"
            >
              חזרה
            </button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={pin.length !== 4 || loading}
              className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 font-bold disabled:opacity-40 transition-colors"
            >
              {loading ? '...' : 'יצירה!'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-glass rounded-3xl p-10 w-full max-w-lg"
      >
        <button
          onClick={onBack}
          className="text-purple-300 hover:text-white mb-6 flex items-center gap-2 transition-colors"
        >
          ← חזרה
        </button>

        <h2 className="text-3xl font-black mb-8 text-center">פרופיל חדש</h2>

        {/* Avatar picker */}
        <div className="text-center mb-6">
          <div className="text-7xl mb-4">{avatar}</div>
          <div className="grid grid-cols-10 gap-2">
            {EMOJIS.map((e, i) => (
              <button
                key={i}
                onClick={() => setAvatar(e)}
                className={`text-2xl p-1 rounded-lg transition-all ${
                  avatar === e
                    ? 'bg-purple-600 scale-110'
                    : 'hover:bg-brand-border'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Name input */}
        <div className="mb-6">
          <label className="block text-purple-300 mb-2 font-medium">שם</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="הכנס שם..."
            maxLength={20}
            className="w-full bg-brand-card border border-brand-border rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-purple-500 transition-colors text-right"
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setStep('pin')}
          disabled={!name.trim()}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-xl font-black disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          הבא: קוד סודי →
        </motion.button>
      </motion.div>
    </div>
  )
}
