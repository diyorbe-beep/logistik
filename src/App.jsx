import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, Suspense, lazy } from 'react';
import { useUser } from './contexts/UserContext';
import Navbar from './components/Navbar/Navbar';
import Loading from './components/Loading/Loading';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import './App.scss';

// Lazy load components for better performance
const Home = lazy(() => import('./components/Home/Home'));
const Login = lazy(() => import('./components/Login/Login'));
const Register = lazy(() => import('./components/Register/Register'));
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const Shipments = lazy(() => import('./components/Shipments/Shipments'));
const ShipmentForm = lazy(() => import('./components/Shipments/ShipmentForm'));
const Users = lazy(() => import('./components/Users/Users'));
const Vehicles = lazy(() => import('./components/Vehicles/Vehicles'));
const VehicleForm = lazy(() => import('./components/Vehicles/VehicleForm.jsx'));
const Pricing = lazy(() => import('./components/Pricing/Pricing'));
const PricingForm = lazy(() => import('./components/Pricing/PricingForm'));
const Services = lazy(() => import('./components/Services/Services'));
const About = lazy(() => import('./components/About/About'));
const Contact = lazy(() => import('./components/Contact/Contact'));
const Profile = lazy(() => import('./components/Profile/ProfileNew'));
const News = lazy(() => import('./components/News/News'));
const Carriers = lazy(() => import('./components/Carriers/Carriers'));
const OrderForm = lazy(() => import('./components/Orders/OrderForm'));
const Layout = lazy(() => import('./components/Layout/Layout'));

// Optimized loading component
const PageLoader = ({ message = 'Sahifa yuklanmoqda...' }) => (
  <Loading message={message} size="medium" />
);

// Role-based route wrapper with better loading
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, error } = useUser();
  const token = localStorage.getItem('token');

  console.log('ProtectedRoute - User:', user);
  console.log('ProtectedRoute - Loading:', loading);
  console.log('ProtectedRoute - Error:', error);
  console.log('ProtectedRoute - Token:', !!token);
  console.log('ProtectedRoute - Allowed roles:', allowedRoles);

  if (loading) {
    return <PageLoader message="Foydalanuvchi ma'lumotlari tekshirilmoqda..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Xatolik yuz berdi</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Qayta yuklash</button>
      </div>
    );
  }

  if (!token || !user) {
    console.log('ProtectedRoute - Redirecting to login: no token or user');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.log(`ProtectedRoute - Access denied: user role "${user.role}" not in allowed roles:`, allowedRoles);
    // Redirect based on role
    if (user.role === 'customer') {
      return <Navigate to="/profile" replace />;
    } else if (user.role === 'carrier') {
      return <Navigate to="/profile" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  console.log('ProtectedRoute - Access granted');
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
    if (token && !user && !loading) {
      refetchUser();
    }
  }, [user, refetchUser, loading]);

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
    return <PageLoader message="Ilova yuklanmoqda..." />;
  }

  return (
    <ErrorBoundary>
      <Router basename="/">
        <Navbar />
        <Suspense fallback={<PageLoader />}>
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

            {/* Protected Routes - Orders (All authenticated users) */}
            <Route
              path="/orders/new"
              element={
                <ProtectedRoute allowedRoles={['customer', 'user']}>
                  <OrderForm />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes - Profile (All authenticated users) - No Layout */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <Profile />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />

            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
