/**
 * Main App Component with Routing
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { BuildingPage } from './components/BuildingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { UsersListPage } from './pages/admin/UsersListPage';
import { UserEditPage } from './pages/admin/UserEditPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* BuildingPage route - NO Layout */}
          <Route path="/" element={<BuildingPage />} />

          {/* Auth routes - WITH Layout */}
          <Route element={<Layout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            {/* Protected routes (require authentication) */}
            <Route element={<ProtectedRoute />}>
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Admin routes (require ADMIN role) */}
            <Route element={<AdminRoute />}>
              <Route path="admin/users" element={<UsersListPage />} />
              <Route path="admin/users/:slug" element={<UserEditPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
