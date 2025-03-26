import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';

type RouteTransitionProps = {
  children: React.ReactNode;
};

export default function RouteTransition({ children }: RouteTransitionProps) {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(children);

  useEffect(() => {
    // Only show loading on route changes, not initial load
    if (location.pathname !== '/') {
      setLoading(true);
    }
  }, [location]);

  const handleLoadComplete = () => {
    setLoading(false);
    setContent(children);
  };

  // Update content after loading is complete
  useEffect(() => {
    if (!loading) {
      setContent(children);
    }
  }, [children, loading]);

  return (
    <>
      {loading && <LoadingScreen onLoadComplete={handleLoadComplete} />}
      <div className={loading ? 'hidden' : undefined}>
        {content}
      </div>
    </>
  );
}