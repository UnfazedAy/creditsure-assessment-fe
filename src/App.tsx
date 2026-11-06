import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import { FullScreenLoader } from './components/LoadingState';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import MyDashboardPage from './pages/MyDashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import WelcomePage from './pages/WelcomePage';
import UsersPage from './pages/UsersPage';

function RootRedirect() {
  const { status, user } = useAuth();
  if (status === 'loading') return <FullScreenLoader />;
  if (status === 'unauthenticated') return <WelcomePage />;
  return <Navigate to={user?.role === 'admin' ? '/dashboard' : '/my-dashboard'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage mode="user" />} />
      <Route path="/admin/login" element={<LoginPage mode="admin" />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute allowedRoles={['admin']} loginPath="/admin/login" />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['user']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/my-dashboard" element={<MyDashboardPage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
