import { useEffect } from 'react'
import Layout from './components/Layout'
import { useIntelStore } from './store/useIntelStore'

export default function App() {
  const fetchLiveData = useIntelStore((s) => s.fetchLiveData)

  useEffect(() => {
    fetchLiveData()
  }, [])

  return <Layout />
}
