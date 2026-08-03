import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useParams } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';

const GamePlayWrapper = () => {
  const { slug } = useParams();
  return <GamePlay slug={slug} />;
};
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import { WalletProvider } from '@/components/WalletProvider';
import Home from '@/pages/Home';
import GamePlay from '@/pages/GamePlay';
import Affiliate from '@/pages/Affiliate';
import Admin from '@/pages/Admin';
import Vip from '@/pages/Vip';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
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
      <Routes>
        {/* Add your page Route elements here */}
        <Route path="/" element={<Home />} />
        <Route path="/game/:slug" element={<GamePlayWrapper />} />
        <Route path="/affiliate" element={<Affiliate />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/vip" element={<Vip />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
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