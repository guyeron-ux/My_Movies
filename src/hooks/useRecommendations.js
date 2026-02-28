import { useState, useEffect } from 'react'
import { getRecommendations } from '../lib/recommendations'

export function useRecommendations(profileId) {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function load(startPage = 1) {
    if (!profileId) return
    setLoading(true)
    setError(null)
    try {
      const data = await getRecommendations(profileId, { startPage })
      setRecommendations(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Manual refresh picks a random page so results differ each time
  function refresh() {
    const randomPage = Math.floor(Math.random() * 8) + 1
    load(randomPage)
  }

  useEffect(() => {
    load(1)
  }, [profileId])

  return { recommendations, loading, error, refresh }
}
