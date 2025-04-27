import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';

// Define your API base URL - adjust if needed
const API_BASE_URL = 'http://localhost:3001/api'; 

interface FormData {
  username: string;
  password: string;
}

const LoginView: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed. Please check your credentials.');
      }

      // Assuming the backend returns { token, userId, username } on successful login
      if (result.token && result.userId && result.username) {
        login(result.token, result.userId, result.username);
        toast.success('Login successful!');
        navigate('/'); // Redirect to calendar view after login
      } else {
         throw new Error('Login response did not contain expected data.');
      }

    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'An unexpected error occurred during login.';
      setApiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="flex justify-center">
           <LogIn className="w-10 h-10 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Login to PlannerSmart
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {apiError && (
            <p className="text-center text-red-500 text-sm">{apiError}</p>
          )}
          <div>
            <label 
              htmlFor="username" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              {...register('username', { required: 'Username is required' })}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } dark:bg-gray-700 dark:text-white`}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password', { required: 'Password is required' })}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } dark:bg-gray-700 dark:text-white`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginView;
