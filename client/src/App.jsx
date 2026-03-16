import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar    from './components/layout/Navbar';
import Footer    from './components/layout/Footer';

import Home       from './pages/Home';
import Login      from './pages/Login';
import Register   from './pages/Register';
import ItemDetail from './pages/ItemDetail';
import PostItem   from './pages/PostItem';
import Dashboard  from './pages/Dashboard';
import Messages   from './pages/Messages';
import Profile    from './pages/Profile';
import NotFound   from './pages/NotFound';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const AppRoutes = () => (
  <>
    <Navbar />
    <main className="main-content">
      <Routes>
        <Route path="/"           element={<Home />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/register"   element={<Register />} />
        <Route path="/items/:id"  element={<ItemDetail />} />
        <Route path="/post"       element={<PrivateRoute><PostItem /></PrivateRoute>} />
        <Route path="/dashboard"  element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/messages"   element={<PrivateRoute><Messages /></PrivateRoute>} />
        <Route path="/profile"    element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="*"           element={<NotFound />} />
      </Routes>
    </main>
    <Footer />
    <ToastContainer position="top-right" autoClose={3000} />
  </>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
