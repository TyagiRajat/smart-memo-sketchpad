
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect to dashboard if authenticated, otherwise to landing page
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/landing" replace />;
};

export default Index;
