import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import RegisterParent from './pages/parent/RegisterParent';
import ParentLogin from './pages/parent/ParentLogin';
import ParentDashboard from './pages/parent/ParentDashboard';
import AddChild from './pages/parent/AddChild';
import ManageFamily from './pages/parent/ManageFamily';
import TransactionForm from './pages/parent/TransactionForm';
import Transactions from './pages/parent/Transactions';
import ChildLogin from './pages/child/ChildLogin';
import ChildDashboard from './pages/child/ChildDashboard';

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
    // Redirect to appropriate login page based on intended user type
    if (userType === 'child') {
      return <Navigate to="/child/login" replace />;
    }
    return <Navigate to="/parent/login" replace />;
  }

  if (userType && user?.user_type !== userType) {
    // Redirect to appropriate dashboard based on user type
    if (user?.user_type === 'child') {
      return <Navigate to="/child/dashboard" replace />;
    }
    return <Navigate to="/parent/dashboard" replace />;
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
      <Route
        path="/parent/manage-family"
        element={
          <ProtectedRoute userType="parent">
            <ManageFamily />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/child/:childId/deposit"
        element={
          <ProtectedRoute userType="parent">
            <TransactionForm type="deposit" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/child/:childId/deduct"
        element={
          <ProtectedRoute userType="parent">
            <TransactionForm type="deduct" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/transactions"
        element={
          <ProtectedRoute userType="parent">
            <Transactions />
          </ProtectedRoute>
        }
      />
      {/* Child Routes */}
      <Route path="/child/login" element={<ChildLogin />} />
      <Route
        path="/child/dashboard"
        element={
          <ProtectedRoute userType="child">
            <ChildDashboard />
          </ProtectedRoute>
        }
      />
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
