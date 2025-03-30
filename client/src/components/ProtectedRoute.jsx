import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/useToast';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const toast = useToast();
  

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated()) {
    toast.error('Please sign in to access this page');
    return <Navigate to="/signin" replace />;
  }
 
  return <Outlet />;
};

export default ProtectedRoute; 