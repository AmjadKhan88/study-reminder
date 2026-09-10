import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseCreate from './pages/CourseCreate';
import CourseDetail from './pages/CourseDetail';
import DayContent from './pages/DayContent';
import Flashcards from './pages/Flashcards';
import Quiz from './pages/Quiz';
import Notes from './pages/Notes';
import Settings from './pages/Settings';
import { useEffect, useState } from 'react';
import api from './api/axios';
import { getMe } from './api/auth.api';
import { useAuthStore } from './store/authStore';

export default function App() {
  const [checking, setChecking] = useState(true);
  const login = useAuthStore((s) => s.login);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.post('/auth/refresh', {}, { withCredentials: true });
        useAuthStore.getState().setAccessToken(data.accessToken);
        const me = await getMe();
        login(data.accessToken, me.data.user);
      } catch {
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  if (checking) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses/new" element={<CourseCreate />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/courses/:id/days/:dayNumber" element={<DayContent />} />
        <Route path="/courses/:id/days/:dayNumber/flashcards" element={<Flashcards />} />
        <Route path="/courses/:id/days/:dayNumber/quiz" element={<Quiz />} />
        <Route path="/courses/:id/notes" element={<Notes />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}