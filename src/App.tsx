import React, { useState, useEffect, useCallback } from 'react';
import { Place, CategoryId, User, ActiveView, SearchFilter, Coords } from './types';
import { api } from './services/api';
import { getUserLocation, getGoogleMapsDirUrl, CITY_COORDS } from './utils/geo';
import { Navbar } from './components/Navbar';
import { SearchHUD } from './components/SearchHUD';
import { CategoryGrid } from './components/CategoryGrid';
import { AutoNavigateModal } from './components/AutoNavigateModal';
import { InteractiveMap } from './components/InteractiveMap';
import { LiveNavigationOverlay } from './components/LiveNavigationOverlay';
import { PlaceDetailModal } from './components/PlaceDetailModal';
import { AuthModal } from './components/AuthModal';
import { AuthScreen } from './components/AuthScreen';
import { BottomHUD } from './components/BottomHUD';
import { Star, MapPin, Navigation, Heart, Filter, Zap, Shield, Sparkles, ExternalLink, Locate, Compass } from 'lucide-react';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // User Live Hardware GPS Coords (Default: Vijayapura)
  const [userCoords, setUserCoords] = useState<Coords>({ lat: 16.8302, lng: 75.7100 });
  const [locationLabel, setLocationLabel] = useState<string>('Vijayapura');
  const [gpsStatus, setGpsStatus] = useState<'requesting' | 'locked' | 'manual'>('requesting');

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  // View States
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [autoNavPlace, setAutoNavPlace] = useState<Place | null>(null);
  const [activeNavPlace, setActiveNavPlace] = useState<Place | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(['nearby_cafe_0']);
  const [alertNotification, setAlertNotification] = useState<string | null>(null);

  // Search Filter State (Defaults to < 4 KM / 4000m Radius!)
  const [filter, setFilter] = useState<SearchFilter>({
    query: '',
    category: 'all',
    minRating: 0,
    maxDistanceKm: 4, // Default < 4 KM / 4000m radius
    openNow: false,
    sortBy: 'rating',
  });

  const [selectedCity, setSelectedCity] = useState<string>('gps');

  // Request browser Hardware GPS location
  const requestGPSLocation = useCallback(async () => {
    setGpsStatus('requesting');
    try {
      const details = await getUserLocation();
      setUserCoords({ lat: details.lat, lng: details.lng });
      setLocationLabel('Your Exact GPS Location');
      setGpsStatus('locked');
      setSelectedCity('gps');
      setAlertNotification(`📍 Live GPS Locked (${details.lat.toFixed(4)}, ${details.lng.toFixed(4)}) - Searching within 4km radius`);
      setTimeout(() => setAlertNotification(null), 4000);
    } catch (err: any) {
      setGpsStatus('manual');
      setSelectedCity('vijayapura');
      setAlertNotification('⚠️ Browser location permission required. Click "GRANT / RE-SYNC GPS" to enable live nearby search.');
    }
  }, []);

  useEffect(() => {
    requestGPSLocation();
  }, [requestGPSLocation]);

  // Handle Manual City Select
  const handleCitySelect = (cityKey: string) => {
    if (cityKey === 'gps') {
      requestGPSLocation();
      return;
    }
    const city = CITY_COORDS[cityKey];
    if (city) {
      setUserCoords({ lat: city.lat, lng: city.lng });
      setLocationLabel(city.name);
      setGpsStatus('manual');
      setSelectedCity(cityKey);
      setAlertNotification(`Location manually set to ${city.name}`);
      setTimeout(() => setAlertNotification(null), 3000);
    }
  };

  // Fetch places centered on userCoords
  const fetchPlaces = useCallback(async (currentFilter: SearchFilter, coords: Coords, label: string) => {
    try {
      const results = await api.searchPlaces(currentFilter, coords, label);
      setPlaces(results);
    } catch (err) {
      console.error('Search places error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasStarted) {
      fetchPlaces(filter, userCoords, locationLabel);
    }
  }, [filter, userCoords, locationLabel, fetchPlaces, hasStarted]);

  // Handle Search Input Change
  const handleSearch = useCallback((query: string) => {
    setFilter((prev) => {
      const nextCategory = query.trim() !== '' ? 'all' : prev.category;
      if (prev.query === query && prev.category === nextCategory) return prev;
      return {
        ...prev,
        query,
        category: nextCategory,
      };
    });
  }, []);

  // Handle Manual Search Submit (Click on SEARCH NEARBY button or Enter key)
  const handleManualSearchSubmit = useCallback((query: string) => {
    const activeQuery = query.trim();
    setFilter((prev) => {
      const nextCategory = activeQuery !== '' ? 'all' : prev.category;
      return {
        ...prev,
        query: activeQuery,
        category: nextCategory,
      };
    });

    setAlertNotification(`🔍 Searching 4km radius for "${activeQuery || 'All Places'}"...`);
    setTimeout(() => setAlertNotification(null), 3000);

    setTimeout(() => {
      const section = document.getElementById('results-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 480, behavior: 'smooth' });
      }
    }, 50);
  }, []);

  // Handle Category Select
  const handleSelectCategory = useCallback((cat: CategoryId) => {
    setFilter((prev) => {
      if (prev.category === cat && prev.query === '') return prev;
      return {
        ...prev,
        category: cat,
        query: '',
      };
    });
  }, []);

  const handleAutoNavigateTopRated = async (searchTermOrCat: string) => {
    const topPlace = await api.getTopRatedPlace(searchTermOrCat, userCoords, locationLabel);
    if (topPlace) {
      setAutoNavPlace(topPlace);
    } else {
      setAlertNotification('No top match found within 2km radius.');
      setTimeout(() => setAlertNotification(null), 3000);
    }
  };

  // Open Direct Google Maps Navigation starting ALWAYS from user's live GPS ("My Location")
  const openGoogleMapsNav = (place: Place) => {
    const mapsUrl = getGoogleMapsDirUrl(
      place.name,
      place.address,
      place.coords.lat,
      place.coords.lng,
      userCoords.lat,
      userCoords.lng
    );
    window.open(mapsUrl, '_blank');
  };

  // Toggle Favorite
  const handleToggleFavorite = async (placeId: string) => {
    const updated = await api.toggleFavorite(placeId);
    setFavorites(updated);
  };

  // Render Start Auth Landing Screen first
  if (!hasStarted && !user) {
    return (
      <AuthScreen
        onAuthSuccess={(authenticatedUser) => {
          setUser(authenticatedUser);
          setHasStarted(true);
          setAlertNotification(`Welcome back, ${authenticatedUser.name}!`);
          requestGPSLocation();
        }}
        onContinueAsGuest={() => {
          setHasStarted(true);
          requestGPSLocation();
        }}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-[#050505] text-[#e5e2e1] pb-32 pt-20">
      {/* Background Scanline */}
      <div className="scanline" />

      {/* Top Navbar */}
      <Navbar
        user={user}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={() => {
          setUser(null);
          setHasStarted(false);
        }}
        onGoHome={() => {
          setActiveView('home');
          setFilter({ query: '', category: 'all', minRating: 0, maxDistanceKm: 2, openNow: false, sortBy: 'rating' });
        }}
        onOpenFavorites={() => setActiveView('favorites')}
        favoritesCount={favorites.length}
      />

      {/* Main Canvas Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Banner Alert Notification */}
        {alertNotification && (
          <div className="mb-4 p-3 rounded-xl bg-[#00dbe9]/10 border border-[#00dbe9] font-mono text-xs text-[#00dbe9] flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#a9f900]" /> {alertNotification}
            </span>
            <button onClick={() => setAlertNotification(null)} className="text-white hover:underline cursor-pointer">
              DISMISS
            </button>
          </div>
        )}

        {/* GPS LIVE LOCATION & CITY SELECTOR HUD BAR */}
        <section className="mb-6 p-3.5 rounded-xl bg-[#131313] border border-white/10 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Locate className={`w-4 h-4 ${gpsStatus === 'locked' ? 'text-[#a9f900] animate-pulse' : 'text-[#00dbe9]'}`} />
            <span className="text-[#849495] uppercase">CURRENT HARDWARE GPS:</span>
            <span className="text-[#00dbe9] font-bold">
              {locationLabel} ({userCoords.lat.toFixed(4)}, {userCoords.lng.toFixed(4)})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick City Switcher Dropdown */}
            <select
              onChange={(e) => handleCitySelect(e.target.value)}
              className="bg-[#1c1b1b] border border-white/15 text-[#a9f900] rounded-lg px-2.5 py-1 text-xs outline-none cursor-pointer font-bold"
              value={selectedCity}
            >
              <option value="gps">📍 GPS Location (Active)</option>
              <option value="vijayapura">Vijayapura</option>
              <option value="bengaluru">Bengaluru</option>
              <option value="hyderabad">Hyderabad</option>
              <option value="mumbai">Mumbai</option>
              <option value="delhi">New Delhi</option>
              <option value="pune">Pune</option>
            </select>

            <button
              onClick={requestGPSLocation}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#a9f900]/10 text-[#a9f900] border border-[#a9f900]/30 hover:bg-[#a9f900] hover:text-[#223600] transition-all cursor-pointer font-bold"
            >
              <Locate className="w-3.5 h-3.5" />
              <span>GRANT / RE-SYNC GPS</span>
            </button>
          </div>
        </section>

        {/* HERO HEADER & PERSISTENT SEARCH HUD */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
            <div>
              <span className="text-xs font-mono text-[#a9f900] tracking-widest uppercase block mb-1 font-bold">
                AI-POWERED PROXIMITY MATRIX
              </span>
              <h1 className="font-headline font-bold text-3xl sm:text-5xl text-[#e5e2e1] tracking-tight">
                Find the best place near you{' '}
                <span className="text-[#00dbe9] italic neon-text-cyan">instantly.</span>
              </h1>
            </div>

            {/* Quick Mode Pill */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#1c1b1b] border border-[#a9f900]/30 font-mono text-xs text-[#a9f900] shrink-0">
              <Shield className="w-4 h-4 text-[#a9f900]" />
              <span>RADIUS: &lt; 4KM (4000M) PROXIMITY</span>
            </div>
          </div>

          {/* Search HUD Input */}
          <SearchHUD
            onSearch={handleSearch}
            currentQuery={filter.query}
            selectedCategory={filter.category}
            onSelectCategory={handleSelectCategory}
            onAutoNavigateTopRated={handleAutoNavigateTopRated}
            onManualSearchSubmit={handleManualSearchSubmit}
          />

          {/* Category Bento Grid */}
          <CategoryGrid
            selectedCategory={filter.category}
            onSelectCategory={handleSelectCategory}
            onAutoNavigateCategory={(catId) => handleAutoNavigateTopRated(catId)}
          />
        </section>

        {/* RATING, DISTANCE RADIUS & SORT FILTER CONTROLS */}
        <section className="mb-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#131313] border border-white/10 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#00dbe9]" />
            <span className="text-[#849495] uppercase">DISTANCE RADIUS FILTER:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Distance Radius Filter Buttons */}
            <div className="flex rounded-lg bg-[#1c1b1b] p-1 border border-white/10">
              <button
                onClick={() => setFilter((prev) => ({ ...prev, maxDistanceKm: 2 }))}
                className={`px-2.5 py-1 rounded font-bold transition-colors cursor-pointer ${
                  filter.maxDistanceKm === 2 ? 'bg-[#a9f900] text-[#223600]' : 'text-[#849495] hover:text-white'
                }`}
              >
                &lt; 2 KM
              </button>
              <button
                onClick={() => setFilter((prev) => ({ ...prev, maxDistanceKm: 4 }))}
                className={`px-2.5 py-1 rounded font-bold transition-colors cursor-pointer ${
                  filter.maxDistanceKm === 4 ? 'bg-[#a9f900] text-[#223600]' : 'text-[#849495] hover:text-white'
                }`}
              >
                &lt; 4 KM (4000M)
              </button>
              <button
                onClick={() => setFilter((prev) => ({ ...prev, maxDistanceKm: 10 }))}
                className={`px-2.5 py-1 rounded font-bold transition-colors cursor-pointer ${
                  filter.maxDistanceKm === 10 ? 'bg-[#a9f900] text-[#223600]' : 'text-[#849495] hover:text-white'
                }`}
              >
                &lt; 10 KM
              </button>
              <button
                onClick={() => setFilter((prev) => ({ ...prev, maxDistanceKm: 0 }))}
                className={`px-2.5 py-1 rounded font-bold transition-colors cursor-pointer ${
                  filter.maxDistanceKm === 0 ? 'bg-[#00dbe9] text-[#00363a]' : 'text-[#849495] hover:text-white'
                }`}
              >
                ALL DISTANCES
              </button>
            </div>

            {/* Sort Buttons */}
            <div className="flex rounded-lg bg-[#1c1b1b] p-1 border border-white/10">
              <button
                onClick={() => setFilter((prev) => ({ ...prev, sortBy: 'rating' }))}
                className={`px-3 py-1 rounded font-bold transition-colors cursor-pointer ${
                  filter.sortBy === 'rating' ? 'bg-[#00dbe9] text-[#00363a]' : 'text-[#849495] hover:text-white'
                }`}
              >
                ★ HIGHEST RATED
              </button>
              <button
                onClick={() => setFilter((prev) => ({ ...prev, sortBy: 'distance' }))}
                className={`px-3 py-1 rounded font-bold transition-colors cursor-pointer ${
                  filter.sortBy === 'distance' ? 'bg-[#00dbe9] text-[#00363a]' : 'text-[#849495] hover:text-white'
                }`}
              >
                NEAREST DISTANCE
              </button>
            </div>
          </div>
        </section>

        {/* RESULTS GRID / FAVORITES VIEW */}
        <section id="results-section" className="mb-12">
          <div className="flex items-center justify-between mb-4 font-mono text-xs">
            <h2 className="text-[#b9cacb] uppercase tracking-wider">
              {activeView === 'favorites'
                ? `SAVED FAVORITE PLACES (${places.filter((p) => favorites.includes(p.id)).length})`
                : `${Boolean(filter.maxDistanceKm && filter.maxDistanceKm > 0) ? `HIGHEST RATED PLACES WITHIN ${filter.maxDistanceKm}KM RADIUS` : 'ALL HIGHEST RATED PLACES'} (${places.length} FOUND)`}
            </h2>
            <span className="text-[#00dbe9]">AUTO-SORT: HIGHEST RATING FIRST</span>
          </div>

          {loading ? (
            <div className="py-16 text-center font-mono text-sm text-[#00dbe9] animate-pulse">
              CALCULATING EXACT DISTANCE FROM YOUR HARDWARE GPS...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(activeView === 'favorites'
                ? places.filter((p) => favorites.includes(p.id))
                : places
              ).map((place, index) => {
                const isFav = favorites.includes(place.id);
                const isTopMatch = index === 0;

                return (
                  <article
                    key={place.id}
                    className={`glass-card rounded-2xl overflow-hidden group transition-all duration-300 relative border flex flex-col justify-between ${
                      isTopMatch
                        ? 'border-[#00dbe9]/60 shadow-[0_0_30px_rgba(0,219,233,0.25)]'
                        : 'border-white/10 hover:border-[#00dbe9]/40'
                    }`}
                  >
                    {/* Top gradient bar for top match */}
                    {isTopMatch && (
                      <div className="w-full h-1 bg-gradient-to-r from-[#a9f900] via-[#00dbe9] to-[#ffcaed]" />
                    )}

                    <div className="p-5">
                      {/* Image Header & Badges */}
                      <div className="relative h-40 rounded-xl overflow-hidden mb-4">
                        <img
                          src={place.image}
                          alt={place.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                        {/* Top Match Tag */}
                        {isTopMatch && (
                          <span className="absolute top-3 left-3 bg-[#a9f900] text-[#223600] font-mono text-[10px] font-bold px-2.5 py-1 rounded-full shadow-[0_0_10px_#a9f900] flex items-center gap-1">
                            <Sparkles className="w-3 h-3 fill-current" /> #1 HIGHEST RATED MATCH
                          </span>
                        )}

                        {/* Favorite Button */}
                        <button
                          onClick={() => handleToggleFavorite(place.id)}
                          className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 active:scale-90 transition-transform cursor-pointer"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isFav ? 'fill-[#fface8] text-[#fface8]' : 'text-white'
                            }`}
                          />
                        </button>

                        {/* Bottom overlay text with exact km distance from user */}
                        <div className="absolute bottom-2 left-3 right-3 flex justify-between items-center font-mono text-[11px] text-[#e5e2e1]">
                          <span className="text-[#00dbe9] font-bold">
                            {place.distanceKm} km from your GPS
                          </span>
                          <span className="text-[#a9f900] font-bold">{place.durationMins} mins ETA</span>
                        </div>
                      </div>

                      {/* Title, Ratings, Reviews & Open Status */}
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <div>
                          <h3 className="font-headline font-bold text-xl text-[#e5e2e1] group-hover:text-[#00dbe9] transition-colors">
                            {place.name}
                          </h3>
                          <p className="text-xs font-mono text-[#849495] mt-0.5">{place.address}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#a9f900]/10 border border-[#a9f900]/30 text-[#a9f900] font-mono font-bold text-xs">
                            <Star className="w-3.5 h-3.5 fill-current text-[#a9f900]" />
                            <span>{place.rating}</span>
                            <span className="text-[#849495] text-[10px]">({place.totalReviews})</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border uppercase ${
                            place.openStatus
                              ? 'bg-[#a9f900]/10 text-[#a9f900] border-[#a9f900]/30'
                              : 'bg-[#ff5252]/10 text-[#ff5252] border-[#ff5252]/30'
                          }`}>
                            {place.openStatus ? 'OPEN NOW' : 'CLOSED'}
                          </span>
                        </div>
                      </div>

                      {/* AI Summary */}
                      <p className="text-xs text-[#b9cacb] line-clamp-2 mb-4 leading-relaxed font-sans">
                        "{place.aiSummary}"
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-5 pb-5 pt-2 grid grid-cols-2 gap-2 border-t border-white/5">
                      <button
                        onClick={() => openGoogleMapsNav(place)}
                        className="flex items-center justify-center gap-1 bg-[#a9f900] hover:bg-white text-[#223600] font-headline font-bold text-xs py-3 rounded-xl shadow-[0_0_15px_rgba(169,249,0,0.3)] active:scale-95 transition-all cursor-pointer"
                        title="Open Google Maps turn-by-turn navigation starting directly from your device location"
                      >
                        <Navigation className="w-3.5 h-3.5 fill-current" />
                        <span>GOOGLE MAPS</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </button>

                      <button
                        onClick={() => setSelectedPlace(place)}
                        className="flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-[#e5e2e1] font-mono text-xs py-3 rounded-xl border border-white/10 active:scale-95 transition-all cursor-pointer"
                      >
                        <span>DETAILS</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* MODALS & OVERLAYS */}
      {/* 1. Auto-Navigate Top Rated Modal */}
      {autoNavPlace && (
        <AutoNavigateModal
          place={autoNavPlace}
          userCoords={userCoords}
          onClose={() => setAutoNavPlace(null)}
          onStartInAppNavigation={(p) => {
            setAutoNavPlace(null);
            setActiveNavPlace(p);
          }}
          onViewDetails={(p) => {
            setAutoNavPlace(null);
            setSelectedPlace(p);
          }}
        />
      )}

      {/* 2. Place Detail Modal */}
      {selectedPlace && (
        <PlaceDetailModal
          place={selectedPlace}
          userCoords={userCoords}
          isFavorite={favorites.includes(selectedPlace.id)}
          onClose={() => setSelectedPlace(null)}
          onToggleFavorite={handleToggleFavorite}
          onStartNavigation={(p) => {
            setSelectedPlace(null);
            setActiveNavPlace(p);
          }}
        />
      )}

      {/* 3. Live Navigation Turn-by-Turn Overlay */}
      {activeNavPlace && (
        <LiveNavigationOverlay
          place={activeNavPlace}
          userCoords={userCoords}
          onEndNavigation={() => setActiveNavPlace(null)}
          onArrived={() => {
            setAlertNotification(`You have arrived at ${activeNavPlace.name}!`);
            setActiveNavPlace(null);
          }}
        />
      )}

      {/* 4. User Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(u) => {
            setUser(u);
            setShowAuthModal(false);
            setAlertNotification(`Welcome back, ${u.name}! Signed in successfully.`);
          }}
        />
      )}

      {/* Bottom Floating Navigation HUD */}
      <BottomHUD
        activeView={activeView}
        onChangeView={(view) => {
          setActiveView(view);
          if (view === 'explore') {
            setFilter({ query: '', category: 'all', minRating: 0, openNow: true, sortBy: 'rating' });
          } else if (view === 'alerts') {
            setAlertNotification('GPS Traffic conditions optimal. 0 bottlenecks reported.');
          }
        }}
        favoritesCount={favorites.length}
        userCoords={userCoords}
        locationLabel={locationLabel}
      />
    </div>
  );
}
