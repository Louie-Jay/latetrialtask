import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Music, Users, ArrowRight, Clock } from 'lucide-react';

function Home() {
  const [videoError, setVideoError] = useState(false);

  const featuredEvents = [
    {
      id: '1',
      name: 'Neon Dreams Festival',
      description: 'Experience the ultimate electronic music festival with world-class DJs',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80',
      date: '2024-03-15T20:00:00Z',
      venue: 'Warehouse 23',
      price: 89.99,
      capacity: 1000,
      soldTickets: 750
    },
    {
      id: '2',
      name: 'Deep House Sessions',
      description: 'An intimate night of deep house music featuring top underground DJs',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80',
      date: '2024-03-20T21:00:00Z',
      venue: 'Club Nova',
      price: 49.99,
      capacity: 300,
      soldTickets: 180
    },
    {
      id: '3',
      name: 'Techno Underground',
      description: 'Raw and unfiltered techno music in an industrial setting',
      image: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?auto=format&fit=crop&q=80',
      date: '2024-03-25T22:00:00Z',
      venue: 'The Basement',
      price: 39.99,
      capacity: 400,
      soldTickets: 220
    }
  ];

  const formatDate = (date: string) => {
    const eventDate = new Date(date);
    return `${eventDate.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })} • ${eventDate.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center -mt-20">
        {/* Video/Image Background */}
        <div className="fixed inset-0 w-full h-full">
          {!videoError ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: 'blur(8px)' }}
              onError={() => setVideoError(true)}
            >
              <source src="https://assets.mixkit.co/videos/preview/mixkit-crowd-of-people-dancing-at-a-nightclub-3641-large.mp4" type="video/mp4" />
            </video>
          ) : (
            <img
              src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80"
              alt="Nightclub atmosphere"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: 'blur(8px)' }}
            />
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-premium-black" />
        </div>

        {/* Content */}
        <div className="relative w-full z-10">
          <div className="text-center">
            <h1 className="text-4xl sm:text-7xl font-bold tracking-tight text-gradient mb-6">
              Your Gateway to
              <br />
              Unforgettable Events
            </h1>
            <p className="mt-6 text-base sm:text-xl leading-7 sm:leading-8 text-gray-300 max-w-2xl mx-auto">
              Discover and book the hottest events in your area. From exclusive nightclubs to
              underground raves, we've got your nightlife covered.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-4">
              <Link
                to="/events"
                className="premium-button text-sm sm:text-base whitespace-nowrap px-6 py-3"
              >
                Browse Events
              </Link>
              <Link
                to="/members"
                className="secondary-button text-sm sm:text-base whitespace-nowrap px-6 py-3 flex items-center"
              >
                Meet Our DJs
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-purple-400">Why Choose Us</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything you need for the perfect night out
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {[
                {
                  icon: Calendar,
                  title: "Curated Events",
                  description: "Hand-picked events from the best venues and promoters in your area. Never miss out on the hottest parties and shows."
                },
                {
                  icon: Music,
                  title: "Top DJs & Artists",
                  description: "Connect with your favorite DJs and discover new talent. Follow their events and never miss a beat."
                },
                {
                  icon: Users,
                  title: "Exclusive Benefits",
                  description: "Earn points with every purchase and unlock VIP perks. Get access to exclusive pre-sales and special offers."
                }
              ].map((feature) => (
                <div key={feature.title} className="premium-card p-8">
                  <dt className="flex items-center gap-x-3 text-xl font-semibold leading-7 text-white mb-4">
                    <feature.icon className="h-8 w-8 text-purple-400" />
                    {feature.title}
                  </dt>
                  <dd className="text-gray-400">
                    {feature.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Featured Events Section */}
      <div className="relative py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0 mb-12">
            <h2 className="text-4xl font-bold tracking-tight text-gradient mb-4">
              Featured Events
            </h2>
            <p className="text-xl text-gray-400">
              Don't miss out on these incredible upcoming events. Book your tickets now!
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredEvents.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="premium-card card-hover group relative overflow-hidden"
              >
                {/* Event Image Container */}
                <div className="relative h-[28rem] overflow-hidden">
                  <div className="absolute inset-0 w-full h-full transform transition-transform duration-500 group-hover:scale-110">
                    {event.image ? (
                      <img
                        src={event.image}
                        alt={event.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-pink-900/50">
                        <Music className="h-16 w-16 text-white/20" />
                      </div>
                    )}
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-premium-black opacity-90 group-hover:opacity-95 transition-opacity" />
                  </div>

                  {/* Price Badge */}
                  <div className="absolute top-4 right-4 premium-gradient rounded-full px-4 py-2 text-white font-semibold shadow-lg transform group-hover:scale-105 transition-transform z-10">
                    From {formatPrice(event.price)}
                  </div>

                  {/* Event Details */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gradient transition-colors">
                      {event.name}
                    </h3>
                    
                    <p className="text-gray-300 line-clamp-2 mb-4">
                      {event.description}
                    </p>

                    <div className="space-y-2 text-gray-300">
                      <div className="flex items-center text-sm space-x-2">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center text-sm space-x-2">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    </div>

                    {/* Capacity Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <div className="stats-badge">
                          <Users className="h-4 w-4 mr-2 text-gray-400" />
                          <div className="pulse-dot" />
                          <span className="value">{event.capacity - event.soldTickets} spots left</span>
                        </div>
                        <span className="text-purple-400">
                          {Math.round((event.soldTickets / event.capacity) * 100)}% Sold
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-800/50 rounded-full overflow-hidden">
                        <div
                          className="h-full premium-gradient rounded-full transition-all duration-500 shadow-lg"
                          style={{
                            width: `${(event.soldTickets / event.capacity) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              to="/events"
              className="premium-button inline-flex items-center"
            >
              View all events
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;