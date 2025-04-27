import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Moon, Sun, AlertCircle, BrainCircuit, ListChecks, CheckSquare, LogOut, User } from 'lucide-react'; // Added LogOut, User
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import { toast } from 'sonner';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, username, logout } = useAuth(); // Get auth state and functions
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/login'); // Redirect to login after logout
  };
  
  // Don't render header on login/register pages if Layout isn't used there
  // Note: The current routing setup applies Layout only to protected routes,
  // so this check might be redundant but adds robustness.
  if (location.pathname === '/login' || location.pathname === '/register') {
     return null; 
  }

  return (
    <header className={`sticky top-0 z-10 transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
    } shadow-md`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="w-6 h-6 text-blue-500" />
          <h1 className="text-xl font-semibold">PlannerSmart</h1>
        </div>
        
        {/* Navigation - Show only if authenticated */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center space-x-6">
            <NavItem to="/" icon={<Calendar size={18} />} label="Calendar" active={location.pathname === '/'} />
            <NavItem to="/events" icon={<ListChecks size={18} />} label="Events" active={location.pathname === '/events'} />
            <NavItem to="/completed-tasks" icon={<CheckSquare size={18} />} label="Completed" active={location.pathname === '/completed-tasks'} />
            <NavItem to="/alarms" icon={<AlertCircle size={18} />} label="Alarms" active={location.pathname === '/alarms'} />
            <NavItem to="/ai-tasks" icon={<BrainCircuit size={18} />} label="AI Tasks" active={location.pathname === '/ai-tasks'} />
          </nav>
        )}

        {/* Right side controls */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-colors ${
            theme === 'dark' 
              ? 'bg-gray-700 hover:bg-gray-600' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun size={20} className="text-yellow-400" />
          ) : (
              <Moon size={20} className="text-blue-500" />
            )}
          </button>

          {/* User Info & Logout Button */}
          {isAuthenticated && (
            <>
              <span className="text-sm hidden sm:inline">
                 <User size={16} className="inline mr-1 align-middle" /> 
                 {username || 'User'}
              </span>
              <button
                onClick={handleLogout}
                className={`p-2 rounded-full transition-colors text-sm flex items-center ${
                  theme === 'dark' 
                    ? 'bg-red-700 hover:bg-red-600 text-white' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

interface NavItemProps {
  to: string; // Add 'to' prop for routing
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, active = false }) => { // Destructure 'to' prop
  return (
    <Link // Use Link component
      to={to} // Pass 'to' prop to Link
      className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
        active 
          ? 'text-blue-500 font-medium' 
          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export default Header;
