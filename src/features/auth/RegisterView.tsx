import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

// Define your API base URL - adjust if needed
const API_BASE_URL = 'http://localhost:3001/api'; 

interface FormData {
  username: string;
  password: string;
  confirmPassword: string;
  apiKey: string; // Add API Key field
}

const RegisterView: React.FC = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Watch password field to validate confirmPassword
  const password = watch('password');

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send username, password, and apiKey to the backend
        body: JSON.stringify({ 
          username: data.username, 
          password: data.password, 
          apiKey: data.apiKey // Include API Key
        }), 
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed. Please try again.');
      }

      toast.success('Registration successful! Please log in.');
      navigate('/login'); // Redirect to login page after successful registration

    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.message || 'An unexpected error occurred during registration.';
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
           <UserPlus className="w-10 h-10 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Register for PlannerSmart
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
              {...register('username', { 
                required: 'Username is required',
                minLength: { value: 3, message: 'Username must be at least 3 characters' } 
              })}
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
              {...register('password', { 
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' } 
              })}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } dark:bg-gray-700 dark:text-white`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          {/* Add API Key Input Field */}
          <div>
            <label 
              htmlFor="apiKey" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Google AI API Key 
            </label>
            <input
              id="apiKey"
              type="password" // Use password type to obscure the key
              {...register('apiKey', { 
                required: 'API Key is required',
                // Basic validation - you might want more specific checks
                minLength: { value: 10, message: 'API Key seems too short' } 
              })}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.apiKey ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } dark:bg-gray-700 dark:text-white`}
              placeholder="Enter your Google AI API Key"
            />
            {errors.apiKey && (
              <p className="mt-1 text-sm text-red-500">{errors.apiKey.message}</p>
            )}
             <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Needed for AI task generation. Your key is stored securely.
            </p>
          </div>
          {/* End API Key Input Field */}
           <div>
            <label 
              htmlFor="confirmPassword" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword', { 
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match' 
              })}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } dark:bg-gray-700 dark:text-white`}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
         <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterView;
