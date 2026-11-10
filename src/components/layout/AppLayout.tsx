import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BackgroundScene } from './BackgroundScene'

export function AppLayout() {
  return (
    <div className="relative min-h-screen">
      <BackgroundScene />
      <Sidebar />
      <main className="relative min-h-screen pl-[72px]">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-8 sm:py-7">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
