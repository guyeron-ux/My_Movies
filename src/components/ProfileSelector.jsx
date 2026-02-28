import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getProfiles } from '../lib/supabase'
import PinEntry from './PinEntry'
import CreateProfile from './CreateProfile'

export default function ProfileSelector({ onProfileSelected }) {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [pinTarget, setPinTarget] = useState(null)

  async function loadProfiles() {
    try {
      const data = await getProfiles()
      setProfiles(data)
    } catch (e) {
      console.error('Failed to load profiles', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfiles()
  }, [])

  function handleProfileClick(profile) {
    setPinTarget(profile)
  }

  function handlePinSuccess(profile) {
    setPinTarget(null)
    onProfileSelected(profile)
  }

  function handleProfileCreated(profile) {
    setShowCreate(false)
    setProfiles((prev) => [...prev, profile])
    onProfileSelected(profile)
  }

  if (showCreate) {
    return (
      <CreateProfile
        onCreated={handleProfileCreated}
        onBack={() => setShowCreate(false)}
      />
    )
  }

  if (pinTarget) {
    return (
      <PinEntry
        profile={pinTarget}
        onSuccess={handlePinSuccess}
        onBack={() => setPinTarget(null)}
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600 rounded-full opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600 rounded-full opacity-10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 relative"
      >
        <div className="text-6xl mb-4">🎬</div>
        <h1 className="text-5xl font-black text-white mb-2">הסרטים שלי</h1>
        <p className="text-purple-300 text-xl">מי אתה?</p>
      </motion.div>

      {loading ? (
        <div className="flex gap-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-36 h-44 bg-brand-card rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-6 justify-center max-w-3xl relative"
        >
          {profiles.map((profile, i) => (
            <motion.button
              key={profile.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleProfileClick(profile)}
              className="flex flex-col items-center gap-3 p-6 bg-brand-card rounded-2xl border border-brand-border hover:border-purple-500 transition-colors cursor-pointer w-36"
            >
              <span className="text-6xl">{profile.avatar}</span>
              <span className="text-white font-bold text-lg leading-tight text-center">
                {profile.name}
              </span>
            </motion.button>
          ))}

          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: profiles.length * 0.08 }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreate(true)}
            className="flex flex-col items-center gap-3 p-6 bg-brand-card rounded-2xl border-2 border-dashed border-brand-border hover:border-purple-500 transition-colors cursor-pointer w-36"
          >
            <span className="text-5xl text-purple-400">+</span>
            <span className="text-purple-300 font-bold text-base">
              הוסף פרופיל
            </span>
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
