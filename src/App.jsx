import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useUser } from './contexts/UserContext';
import Navbar from './components/Navbar/Navbar';
import Home from './components/Home/Home';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Shipments from './components/Shipments/Shipments';
import ShipmentForm from './components/Shipments/ShipmentForm';
import Users from './components/Users/Users';
import Vehicles from './components/Vehicles/Vehicles';
import VehicleForm from './components/Vehicles/VehicleForm.jsx';
import Pricing from './components/Pricing/Pricing';
import PricingForm from './components/Pricing/PricingForm';
import Services from './components/Services/Services';
import About from './components/About/About';
import Contact from './components/Contact/Contact';
import Profile from './components/Profile/Profile';
import News from './components/News/News';
import Carriers from './components/Carriers/Carriers';
import OrderForm from './components/Orders/OrderForm';
import Layout from './components/Layout/Layout';
import './App.scss';

// Role-based route wrapper
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useUser();
  const token = localStorage.getItem('token');

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect based on role
    if (user.role === 'customer') {
      return <Navigate to="/profile" replace />;
    } else if (user.role === 'carrier') {
      return <Navigate to="/profile" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

// Redirect after login based on role
const getDefaultRoute = (role) => {
  switch (role) {
    case 'admin':
    case 'operator':
      return '/dashboard';
    case 'carrier':
    case 'customer':
      return '/profile';
    default:
      return '/';
  }
};

function App() {
  const { user, loading, logout, refetchUser } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    if (token && !user) {
      refetchUser();
    }
  }, [user, refetchUser]);

  const handleLogin = async (token, userData) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    await refetchUser();
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/news" element={<News />} />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={getDefaultRoute(user?.role)} replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to={getDefaultRoute(user?.role)} replace />
            ) : (
              <Register />
            )
          }
        />
        
        {/* Protected Routes - Dashboard (Operator & Admin only) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin', 'operator']}>
              <Layout onLogout={handleLogout}>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Shipments (Operator & Admin only) */}
        <Route
          path="/shipments"
          element={
            <ProtectedRoute allowedRoles={['admin', 'operator']}>
              <Layout onLogout={handleLogout}>
                <Shipments />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/shipments/new"
          element={
            <ProtectedRoute allowedRoles={['admin', 'operator']}>
              <Layout onLogout={handleLogout}>
                <ShipmentForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/shipments/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['admin', 'operator']}>
              <Layout onLogout={handleLogout}>
                <ShipmentForm />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Users (Admin only) */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout onLogout={handleLogout}>
                <Users />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Vehicles (Admin only) */}
        <Route
          path="/vehicles"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout onLogout={handleLogout}>
                <Vehicles />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehicles/new"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout onLogout={handleLogout}>
                <VehicleForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehicles/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout onLogout={handleLogout}>
                <VehicleForm />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Carriers (Admin & Operator only) */}
        <Route
          path="/carriers"
          element={
            <ProtectedRoute allowedRoles={['admin', 'operator']}>
              <Layout onLogout={handleLogout}>
                <Carriers />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Pricing Management (Admin only) */}
        <Route
          path="/pricing/new"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout onLogout={handleLogout}>
                <PricingForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pricing/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout onLogout={handleLogout}>
                <PricingForm />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Orders (Customer only) */}
        <Route
          path="/orders/new"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <Layout onLogout={handleLogout}>
                <OrderForm />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Profile (All authenticated users) */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout onLogout={handleLogout}>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
