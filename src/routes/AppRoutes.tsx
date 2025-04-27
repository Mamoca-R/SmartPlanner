import React, { ReactNode } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import CalendarView from '../features/calendar/CalendarView';
import EventsView from '../features/events/EventsView';
import CompletedTasksView from '../features/events/CompletedTasksView';
import AlarmsView from '../features/alarms/AlarmsView';
import TaskManagerView from '../features/ai/TaskManagerView';
import LoginView from '../features/auth/LoginView';       // Import LoginView
import RegisterView from '../features/auth/RegisterView'; // Import RegisterView
import Layout from '../components/layout/Layout';         // Import Layout for protected routes

// Component to protect routes
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Optional: Show a loading spinner while checking auth status
    return <div>Loading...</div>; 
  }

  return isAuthenticated ? <Layout><Outlet /></Layout> : <Navigate to="/login" replace />;
};

// Component for public routes (Login, Register)
const PublicRoute: React.FC = () => {
   const { isAuthenticated, isLoading } = useAuth();

   if (isLoading) {
     return <div>Loading...</div>; 
   }

   return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};


const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes (Login/Register) */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginView />} />
        <Route path="/register" element={<RegisterView />} />
      </Route>

      {/* Protected Routes (Main App) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<CalendarView />} />
        <Route path="/events" element={<EventsView />} />
        <Route path="/completed-tasks" element={<CompletedTasksView />} />
        <Route path="/alarms" element={<AlarmsView />} />
        <Route path="/ai-tasks" element={<TaskManagerView />} />
      </Route>
      
      {/* Optional: Redirect any unknown paths */}
      <Route path="*" element={<Navigate to="/" replace />} /> 
    </Routes>
  );
};

export default AppRoutes;
