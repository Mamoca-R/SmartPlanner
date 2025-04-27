import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useEventStore } from '../store/eventStore'; // Import event store

interface AuthContextType {
  token: string | null;
  userId: number | null;
  username: string | null;
  isAuthenticated: boolean;
  login: (token: string, userId: number, username: string) => void;
  logout: () => void;
  isLoading: boolean; // To handle initial token check
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading initially

  useEffect(() => {
    // Check local storage for existing token on initial load
    const storedToken = localStorage.getItem('authToken');
    const storedUserId = localStorage.getItem('authUserId');
    const storedUsername = localStorage.getItem('authUsername');
    
    if (storedToken && storedUserId && storedUsername) {
      setToken(storedToken);
      setUserId(parseInt(storedUserId, 10)); // Ensure userId is a number
      setUsername(storedUsername);
      // If token found on load, fetch initial events
      useEventStore.getState().fetchEvents(); 
    }
    setIsLoading(false); // Finished loading check
  }, []);

  const login = (newToken: string, newUserId: number, newUsername: string) => {
    setToken(newToken);
    setUserId(newUserId);
    setUsername(newUsername);
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUserId', newUserId.toString());
    localStorage.setItem('authUsername', newUsername);
    // Fetch events after successful login
    useEventStore.getState().fetchEvents(); 
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    setUsername(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUserId');
    localStorage.removeItem('authUsername');
    // Clear events from the store on logout
    useEventStore.getState().clearEvents(); 
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, userId, username, isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
