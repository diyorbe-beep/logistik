import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
import Layout from './components/Layout/Layout';
import './App.scss';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
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
        <Route
          path="/"
          element={<Home />}
        />
        <Route
          path="/services"
          element={<Services />}
        />
        <Route
          path="/about"
          element={<About />}
        />
        <Route
          path="/contact"
          element={<Contact />}
        />
        <Route
          path="/news"
          element={<News />}
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Register />
            )
          }
        />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/shipments"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Shipments />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/shipments/new"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <ShipmentForm />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/shipments/edit/:id"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <ShipmentForm />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/users"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Users />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/vehicles"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Vehicles />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/vehicles/new"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <VehicleForm />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/vehicles/edit/:id"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <VehicleForm />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/carriers"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Carriers />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/pricing"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Pricing />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/pricing/new"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <PricingForm />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/pricing/edit/:id"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <PricingForm />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/profile"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Profile />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
