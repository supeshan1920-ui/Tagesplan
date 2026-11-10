import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { KalenderPage } from './pages/KalenderPage'
import { AufgabenPage } from './pages/AufgabenPage'
import { NotizenPage } from './pages/NotizenPage'
import { StatistikPage } from './pages/StatistikPage'
import { ZeitrechnerPage } from './pages/ZeitrechnerPage'
import { EinstellungenPage } from './pages/EinstellungenPage'
import { LoginPage } from './pages/LoginPage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="kalender" element={<KalenderPage />} />
              <Route path="aufgaben" element={<AufgabenPage />} />
              <Route path="notizen" element={<NotizenPage />} />
              <Route path="statistik" element={<StatistikPage />} />
              <Route path="zeitrechner" element={<ZeitrechnerPage />} />
              <Route path="einstellungen" element={<EinstellungenPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
