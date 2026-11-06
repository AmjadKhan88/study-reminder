import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import GeminiKeyModal from './GeminiKeyModal';
import PineconeKeyModal from './PineconeKeyModal';

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <>
      <Outlet />
      <GeminiKeyModal />
      <PineconeKeyModal />
    </>
  );
}