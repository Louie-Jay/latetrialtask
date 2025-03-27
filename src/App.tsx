import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';
import RouteTransition from './components/RouteTransition';
// import { useAuth } from './hooks/useAuth';

// Pages
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Dashboard from './pages/Dashboard';
import Account from './pages/Account';
import EditProfile from './pages/EditProfile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import Members from './pages/Members';
import MemberProfile from './pages/MemberProfile';
import Venues from './pages/Venues';
import VenueDetails from './pages/VenueDetails';
import Creatives from './pages/Creatives';
import CreativeProfile from './pages/CreativeProfile';
import TicketPurchase from './pages/TicketPurchase';
import Checkout from './pages/Checkout';
import TicketConfirmation from './pages/TicketConfirmation';
import Error404 from './pages/Error404';
import Error500 from './pages/Error500';
import Terms from './pages/legal/Terms';
import Privacy from './pages/legal/Privacy';
import Contact from './pages/support/Contact';
import PortalDashboard from './pages/portal/PortalDashboard';
import PortalLogin from './pages/portal/PortalLogin';
import PortalEventForm from './pages/portal/EventForm';
import ScannerPage from './pages/portal/ScannerPage';
// import { useSession } from './context/SessionContext';

function App() {
  // const { user, loading, error } = useAuth();

  // const { user } = useSession();
  const loading = false;
  const error = false;

  if (loading) {
    return <LoadingScreen onLoadComplete={() => {}} />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-premium-black">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="premium-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <GlobalErrorBoundary>
      <div className="min-h-screen bg-premium-black">
        <div className="dynamic-bg" />
        <Navbar />
        
        <main className="container mx-auto px-4 py-8 mt-20 relative">
          <RouteTransition>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/account" element={<Account />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/members" element={<Members />} />
              <Route path="/members/:id" element={<MemberProfile />} />
              <Route path="/venues" element={<Venues />} />
              <Route path="/venues/:id" element={<VenueDetails />} />
              <Route path="/creatives" element={<Creatives />} />
              <Route path="/creatives/:id" element={<CreativeProfile />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/contact" element={<Contact />} />

              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={<Dashboard />} 
              />
              <Route 
                path="/account/edit" 
                element={<EditProfile />} 
              />
              <Route 
                path="/tickets/purchase/:id" 
                element={<TicketPurchase />} 
              />
              <Route 
                path="/checkout" 
                element={<Checkout />} 
              />
              <Route 
                path="/confirmation" 
                element={<TicketConfirmation />} 
              />

              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <AdminDashboard />
                } 
              />

              {/* Portal Routes */}
              <Route path="/portal/login" element={<PortalLogin />} />
              <Route 
                path="/portal/dashboard" 
                element={
                  <PortalDashboard /> 
                } 
              />
              <Route 
                path="/portal/events/new" 
                element={
                  <PortalEventForm />
                }
              />
              <Route 
                path="/portal/scanner" 
                element={
                  <ScannerPage />
                }
              />

              {/* Error Routes */}
              <Route path="/500" element={<Error500 />} />
              <Route path="*" element={<Error404 />} />
            </Routes>
          </RouteTransition>
        </main>
      </div>
    </GlobalErrorBoundary>
  );
}

export default App;