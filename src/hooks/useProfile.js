import { useState, useEffect } from 'react'

const SESSION_KEY = 'active_profile'

export function useProfile() {
  const [profile, setProfileState] = useState(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  function setProfile(p) {
    if (p) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(p))
    } else {
      sessionStorage.removeItem(SESSION_KEY)
    }
    setProfileState(p)
  }

  function logout() {
    setProfile(null)
  }

  return { profile, setProfile, logout }
}
