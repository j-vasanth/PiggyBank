import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import RegisterParent from './pages/parent/RegisterParent';
import ParentLogin from './pages/parent/ParentLogin';
import ParentDashboard from './pages/parent/ParentDashboard';
import AddChild from './pages/parent/AddChild';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; userType?: 'parent' | 'child' }> = ({
  children,
  userType,
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/register" replace />;
  }

  if (userType && user?.user_type !== userType) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/parent/login" replace />} />
      <Route path="/register" element={<RegisterParent />} />
      <Route path="/parent/login" element={<ParentLogin />} />
      <Route
        path="/parent/dashboard"
        element={
          <ProtectedRoute userType="parent">
            <ParentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/add-child"
        element={
          <ProtectedRoute userType="parent">
            <AddChild />
          </ProtectedRoute>
        }
      />
      {/* Additional routes will be added here */}
    </Routes>
  );
}

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
