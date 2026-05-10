import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OnboardingPage from './pages/OnboardingPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import MainLayout from './components/MainLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen bg-dark-bg flex items-center justify-center text-white">Loading...</div>;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route 
        path="/onboarding" 
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <div className="min-h-screen bg-dark-bg text-white p-20 text-center">
                <h1 className="text-4xl font-bold">Welcome to your Dashboard</h1>
                <p className="mt-4 text-slate-400">Onboarding and personalized matching coming soon.</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile/:id" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <SettingsPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: '#111112', color: '#fff', border: '1px solid rgba(255,255,255,0.05)' } }} />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
