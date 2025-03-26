import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ticket, User, Home, Music, MapPin, Crown, Palette, Settings } from 'lucide-react';
import { signOut } from '../lib/supabase';
import supabase from "../../supabase";
import { useSession } from '../context/SessionContext';

type NavbarProps = {
  user: any;
};

function Navbar(
  // { user }: NavbarProps
) {
  const navigate = useNavigate();
  const { user } = useSession();
  const { setAuthUser } = useSession();

  const handleSignOut = async () => {
    try {
      // await signOut();
      supabase.auth.signOut();
      
setAuthUser(null); // Global logout
      navigate('/account');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const showPortalButton = user?.role === 'admin';

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-4 left-4 right-4 z-50 transition-all duration-300 rounded-2xl hidden md:block glass-effect border border-gray-800/50">
        <div className="container mx-auto px-2">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group -ml-2">
              <Ticket className="h-8 w-8 text-gradient transition-transform group-hover:scale-110 duration-300" />
              <span className="text-xl font-bold text-white group-hover:text-gradient transition-colors">
                Real L!VE
              </span>
            </Link>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center justify-center flex-1 px-8">
              <div className="flex items-center justify-evenly w-full max-w-3xl">
                <NavLink to="/home" icon={<Home className="h-5 w-5" />} text="Home" />
                <NavLink to="/events" icon={<Ticket className="h-5 w-5" />} text="Events" />
                <NavLink to="/members" icon={<Music className="h-5 w-5" />} text="DJs & Promoters" />
                <NavLink to="/creatives" icon={<Palette className="h-5 w-5" />} text="Creatives" />
                <NavLink to="/venues" icon={<MapPin className="h-5 w-5" />} text="Venues" />
              </div>
            </div>

            {/* Account Links */}
            <div className="flex items-center space-x-8">
              {user && (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 text-gray-300 hover:text-purple-400 transition-colors"
                  >
                    <Crown className="h-5 w-5" />
                    <span className="hidden sm:inline">Rewards</span>
                  </Link>
                  {showPortalButton && (
                    <Link
                      to="/portal/dashboard"
                      className="flex items-center space-x-2 text-gray-300 hover:text-purple-400 transition-colors"
                    >
                      <Settings className="h-5 w-5" />
                      <span className="hidden sm:inline">Portal</span>
                    </Link>
                  )}
                </>
              )}
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 text-gray-300 hover:text-purple-400 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              ) : (
                <Link
                  to="/account"
                  className="flex items-center space-x-2 text-gray-300 hover:text-purple-400 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-4 left-4 right-4 z-50 md:hidden glass-effect border border-gray-800/50 rounded-2xl">
        <div className="px-2">
          <div className="flex items-center justify-between h-14">
            <MobileNavIcon to="/home" icon={<Home />} />
            <MobileNavIcon to="/events" icon={<Ticket />} />
            <MobileNavIcon to="/members" icon={<Music />} />
            <MobileNavIcon to="/creatives" icon={<Palette />} />
            <MobileNavIcon to="/venues" icon={<MapPin />} />
            {user ? (
              <>
                <MobileNavIcon to="/dashboard" icon={<Crown />} />
                {showPortalButton && <MobileNavIcon to="/portal/dashboard" icon={<Settings />} />}
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
                >
                  <User className="h-5 w-5" />
                </button>
              </>
            ) : (
              <MobileNavIcon to="/account" icon={<User />} />
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

function NavLink({ to, icon, text }: { to: string; icon: React.ReactNode; text: string }) {
  return (
    <Link
      to={to}
      className="flex items-center space-x-2 text-gray-300 hover:text-purple-400 transition-colors group"
    >
      <span className="transition-transform group-hover:scale-110 duration-300">
        {icon}
      </span>
      <span>{text}</span>
    </Link>
  );
}

function MobileNavIcon({ to, icon }: { to: string; icon: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
    >
      {icon}
    </Link>
  );
}

export default Navbar;