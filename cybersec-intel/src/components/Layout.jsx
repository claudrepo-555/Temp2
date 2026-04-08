import Sidebar from './Sidebar'
import IntelList from './IntelList'
import IntelThread from './IntelThread'

export default function Layout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-950">
      <Sidebar />
      <IntelList />
      <IntelThread />
    </div>
  )
}
