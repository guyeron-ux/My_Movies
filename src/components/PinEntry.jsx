import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { verifyPin } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function PinEntry({ profile, onSuccess, onBack }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  function handlePinDigit(digit) {
    if (pin.length < 4) {
      const newPin = pin + digit
      setPin(newPin)
      setError(false)
      if (newPin.length === 4) {
        checkPin(newPin)
      }
    }
  }

  function handlePinBackspace() {
    setPin((p) => p.slice(0, -1))
    setError(false)
  }

  async function checkPin(enteredPin) {
    setLoading(true)
    try {
      const ok = await verifyPin(profile.id, enteredPin)
      if (ok) {
        toast.success(`שלום, ${profile.name}! 👋`)
        onSuccess(profile)
      } else {
        setError(true)
        setPin('')
        toast.error('קוד שגוי, נסה שנית')
      }
    } catch (e) {
      console.error(e)
      toast.error('שגיאה, נסה שנית')
      setPin('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600 rounded-full opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600 rounded-full opacity-10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-glass rounded-3xl p-10 w-full max-w-sm text-center relative"
      >
        <button
          onClick={onBack}
          className="absolute top-4 right-4 text-purple-300 hover:text-white transition-colors text-sm"
        >
          ← חזרה
        </button>

        <div className="text-6xl mb-3">{profile.avatar}</div>
        <h2 className="text-2xl font-bold mb-1">{profile.name}</h2>
        <p className="text-purple-300 mb-8">הכנס קוד סודי</p>

        {/* PIN dots */}
        <div className="flex gap-4 justify-center mb-8">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={error ? { x: [-4, 4, -4, 4, 0] } : {}}
              transition={{ duration: 0.3 }}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl font-bold transition-all ${
                error
                  ? 'bg-red-600/30 border-red-400'
                  : pin.length > i
                  ? 'bg-purple-600 border-purple-400'
                  : 'border-brand-border'
              }`}
            >
              {pin.length > i ? '●' : ''}
            </motion.div>
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
            <motion.button
              key={d}
              whileTap={{ scale: 0.88 }}
              onClick={() => handlePinDigit(String(d))}
              disabled={loading}
              className="h-14 bg-brand-card rounded-xl text-xl font-bold hover:bg-purple-900/50 transition-colors border border-brand-border disabled:opacity-50"
            >
              {d}
            </motion.button>
          ))}
          <div />
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => handlePinDigit('0')}
            disabled={loading}
            className="h-14 bg-brand-card rounded-xl text-xl font-bold hover:bg-purple-900/50 transition-colors border border-brand-border disabled:opacity-50"
          >
            0
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={handlePinBackspace}
            disabled={loading}
            className="h-14 bg-brand-card rounded-xl text-xl hover:bg-purple-900/50 transition-colors border border-brand-border disabled:opacity-50"
          >
            ⌫
          </motion.button>
        </div>

        {loading && (
          <div className="text-purple-300 text-sm mt-2">בודק...</div>
        )}
      </motion.div>
    </div>
  )
}
