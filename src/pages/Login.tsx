
import { Link } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { BookText } from 'lucide-react';

const Login = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="mb-8 text-center">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="bg-accent rounded-md p-1.5">
            <BookText className="h-8 w-8 text-accent-foreground" />
          </div>
          <h1 className="text-3xl font-bold">AI Notes</h1>
        </Link>
      </div>
      <LoginForm />
    </div>
  );
};

export default Login;
