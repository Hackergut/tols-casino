import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useParams } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import React, { Suspense, lazy } from 'react';

const GamePlayWrapper = () => {
  const { slug } = useParams();
  return <GamePlay slug={slug} />;
};
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import { WalletProvider } from '@/components/WalletProvider';
import { WalletModalProvider } from '@/components/wallet/useWalletModal';
import Layout from '@/components/Layout';
const Home = lazy(() => import('@/pages/Home'));
const GameCategory = lazy(() => import('@/pages/GameCategory'));
const GamePlay = lazy(() => import('@/pages/GamePlay'));
const Affiliate = lazy(() => import('@/pages/Affiliate'));
const Admin = lazy(() => import('@/pages/Admin'));
const Vip = lazy(() => import('@/pages/Vip'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const Community = lazy(() => import('@/pages/Community'));
const Wallet = lazy(() => import('@/pages/Wallet'));
const Tournaments = lazy(() => import('@/pages/Tournaments'));
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const ResponsibleGaming = lazy(() => import('@/pages/ResponsibleGaming'));
const Packs = lazy(() => import('@/pages/Packs'));
const Collection = lazy(() => import('@/pages/Collection'));
const Swap = lazy(() => import('@/pages/Swap'));
const Marketplace = lazy(() => import('@/pages/Marketplace'));
const Terms = lazy(() => import('@/pages/Terms'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const License = lazy(() => import('@/pages/License'));

const PageFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-white/10 border-t-lime rounded-full animate-spin" />
  </div>
);
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#080808]">
        <div className="w-8 h-8 border-4 border-white/10 border-t-lime rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <WalletProvider>
      <WalletModalProvider>
      <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Auth routes (pubbliche, senza layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* App routes (con layout) */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/game/:slug" element={<GamePlayWrapper />} />
          <Route path="/games/:slug" element={<GamePlayWrapper />} />
          <Route path="/games/category/:cat" element={<GameCategory mode="category" />} />
          <Route path="/games/provider/:provider" element={<GameCategory mode="provider" />} />
          <Route path="/affiliate" element={<Affiliate />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/vip" element={<Vip />} />
          <Route path="/community" element={<Community />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/responsible-gaming" element={<ResponsibleGaming />} />
          <Route path="/packs" element={<Packs />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/swap" element={<Swap />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/license" element={<License />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      </Suspense>
      </WalletModalProvider>
    </WalletProvider>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
