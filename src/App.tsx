import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { TropelsPage } from './pages/TropelsPage'
import { SignalFeedPage } from './pages/SignalFeedPage'
import { SignalDetailModal } from './pages/SignalDetailModal'
import { SectorStoryPage } from './pages/SectorStoryPage'
import { ProtectedRoute } from './routes/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/tropels" element={<ProtectedRoute><TropelsPage /></ProtectedRoute>} />
      {/* El detalle es una ruta hija: el feed permanece montado debajo (conserva
          posicion y paginas cargadas) y el detalle se muestra como modal. */}
      <Route path="/signals" element={<ProtectedRoute><SignalFeedPage /></ProtectedRoute>}>
        <Route path=":id" element={<SignalDetailModal />} />
      </Route>
      <Route path="/sectors/:id/story" element={<ProtectedRoute><SectorStoryPage /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App