import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { TropelsPage } from './pages/TropelsPage'
import { SignalFeedPage } from './pages/SignalFeedPage'
import { SignalDetailPage } from './pages/SignalDetailPage'
import { ProtectedRoute } from './routes/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/tropels" element={<ProtectedRoute><TropelsPage /></ProtectedRoute>} />
      <Route path="/signals" element={<ProtectedRoute><SignalFeedPage /></ProtectedRoute>} />
      <Route path="/signals/:id" element={<ProtectedRoute><SignalDetailPage /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App