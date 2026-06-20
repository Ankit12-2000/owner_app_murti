import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import CreateShop from './pages/CreateShop'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/DashboardLayout'
import Dashboard from './pages/Dashboard'
import MyProducts from './pages/MyProducts'
import AddProduct from './pages/AddProduct'
import EditProduct from './pages/EditProduct'
import Inquiries from './pages/Inquiries'
import Settings from './pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth — public */}
        <Route path="/login" element={<Login />} />

        {/* Onboarding — protected */}
        <Route path="/create-shop" element={<ProtectedRoute><CreateShop /></ProtectedRoute>} />

        {/* Dashboard — protected with sidebar */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<MyProducts />} />
          <Route path="/products/add" element={<AddProduct />} />
          <Route path="/products/edit/:id" element={<EditProduct />} />
          <Route path="/inquiries" element={<Inquiries />} />

          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
