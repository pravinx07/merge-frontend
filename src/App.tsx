import React, { lazy, Suspense } from 'react';
import MainLayout from './components/MainLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { PWAProvider } from './context/PWAContext';
import { PWAPrompt } from './components/PWAPrompt';
import { PWAInstallBanner } from './components/PWAInstallBanner';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const DiscoverPage = lazy(() => import('./pages/DiscoverPage'));
const MatchesPage = lazy(() => import('./pages/MatchesPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailsPage = lazy(() => import('./pages/ProjectDetailsPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const HackathonsPage = lazy(() => import('./pages/HackathonsPage'));
const HackathonDetailsPage = lazy(() => import('./pages/HackathonDetailsPage'));

const LoadingScreen = () => (
  <div className="min-h-screen bg-dark-bg flex items-center justify-center text-white">
    Loading...
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
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
        element={<Navigate to="/community" replace />} 
      />
      <Route 
        path="/feed" 
        element={<Navigate to="/community" replace />} 
      />
      <Route 
        path="/community" 
        element={
          <ProtectedRoute>
            <CommunityPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/discover" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <DiscoverPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/matches" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <MatchesPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/messages" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <MessagesPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/chat/:chatId" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <ChatPage />
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
        path="/projects" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProjectsPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/projects/:id" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProjectDetailsPage />
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
      <Route 
        path="/hackathons" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <HackathonsPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/hackathons/:id" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <HackathonDetailsPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <PWAProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <Toaster position="bottom-right" toastOptions={{ duration: 3000, style: { background: '#111112', color: '#fff', border: '1px solid rgba(255,255,255,0.05)' } }} />
            <AppRoutes />
            <PWAPrompt />
            <PWAInstallBanner />
          </Router>
        </SocketProvider>
      </AuthProvider>
    </PWAProvider>
  );
}

export default App;
