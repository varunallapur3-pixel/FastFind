import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Place, CategoryId, User, ActiveView, SearchFilter, Coords } from './types';
import { api } from './services/api';
import { geocodeLocation } from './services/googlePlaces';
import { getUserLocation } from './utils/geo';
import { DEFAULT_RADIUS_KM, normalizeRadius } from './config/maps';
import { auth } from './config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { HeaderNavbar } from './components/HeaderNavbar';
import { HeroSection } from './components/HeroSection';
import { CategoryGrid } from './components/CategoryGrid';
import { FilterBar } from './components/FilterBar';
import { ResultCard } from './components/ResultCard';
import { MapView } from './components/MapView';
import { SkeletonGrid } from './components/SkeletonCard';
import { EmptyState } from './components/EmptyState';
import { PlaceDetailsModal } from './components/PlaceDetailsModal';
import { AutoNavigateModal } from './components/AutoNavigateModal';
import { AuthModal } from './components/AuthModal';
import { AuthScreen } from './components/AuthScreen';
import { BottomNav } from './components/BottomNav';
import { getSavedFavorites, saveFavorites } from './utils/storage';
import { Map, Grid, CheckCircle2, X } from 'lucide-react';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // User Hardware GPS Coordinates
  const [userCoords, setUserCoords] = useState<Coords | null>(null);
  const [locationLabel, setLocationLabel] = useState<string>('Detecting location...');
  const [gpsStatus, setGpsStatus] = useState<'requesting' | 'locked' | 'denied'>('requesting');

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  // Request counter to cancel stale search responses (Race condition protection)
  const requestIdRef = useRef(0);

  // View & Interaction States
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [hoveredPlace, setHoveredPlace] = useState<Place | null>(null);
  const [autoNavPlace, setAutoNavPlace] = useState<Place | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => getSavedFavorites());
  const [alertNotification, setAlertNotification] = useState<string | null>(null);

  // Search Filter State (defaults strictly to 4 km radius)
  const [filter, setFilter] = useState<SearchFilter>({
    query: '',
    category: 'all',
    minRating: 0,
    maxDistanceKm: DEFAULT_RADIUS_KM,
    openNow: false,
    sortBy: 'rating',
  });

  // Listen for Firebase Auth Persistence State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const token = await fbUser.getIdToken();
        const favKey = `fastfind_favs_${fbUser.uid}`;
        const userFavs = getSavedFavorites(favKey);
        setUser({
          id: fbUser.uid,
          name: (fbUser.displayName || fbUser.email?.split('@')[0] || 'User').toUpperCase(),
          email: fbUser.email || '',
          avatar: fbUser.photoURL || undefined,
          token,
          favorites: userFavs,
          recentSearches: [],
        });
        setFavorites(userFavs);
        setHasStarted(true);
      }
    });
    return () => unsubscribe();
  }, []);

  // Request user location via browser native GPS prompt
  const requestGPSLocation = useCallback(async () => {
    setGpsStatus('requesting');
    try {
      const details = await getUserLocation();
      setUserCoords({ lat: details.lat, lng: details.lng });
      const city = details.cityName || 'Live Device GPS';
      setLocationLabel(city);
      setGpsStatus('locked');
      setAlertNotification(`📍 Location Locked: ${city}`);
      setTimeout(() => setAlertNotification(null), 4000);
    } catch {
      setGpsStatus('denied');
      setUserCoords(null);
      setLocationLabel('Location Access Denied');
      setPlaces([]);
      setAlertNotification('⚠️ Location permission required to find places near you.');
    }
  }, []);

  useEffect(() => {
    requestGPSLocation();
  }, [requestGPSLocation]);

  // Handle manual city selection / geocoding override
  const handleSelectCityLocation = async (cityName: string) => {
    setLoading(true);
    setAlertNotification(`🔍 Geocoding "${cityName}"...`);
    try {
      const geo = await geocodeLocation(cityName);
      setUserCoords({ lat: geo.lat, lng: geo.lng });
      setLocationLabel(geo.label);
      setGpsStatus('locked');
      setAlertNotification(`📍 Location updated: ${geo.label}`);
    } catch {
      setAlertNotification(`⚠️ Could not find location "${cityName}".`);
    } finally {
      setLoading(false);
      setTimeout(() => setAlertNotification(null), 4000);
    }
  };

  // Fetch places centered on userCoords with Race Condition protection
  const fetchPlaces = useCallback(async (currentFilter: SearchFilter, coords: Coords | null) => {
    if (!coords) {
      setPlaces([]);
      return;
    }

    const currentReqId = ++requestIdRef.current;
    setLoading(true);

    try {
      const results = await api.searchPlaces(currentFilter, coords);
      if (currentReqId === requestIdRef.current) {
        setPlaces(results);
      }
    } catch (err) {
      console.error('Search places error:', err);
      if (currentReqId === requestIdRef.current) {
        setPlaces([]);
      }
    } finally {
      if (currentReqId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (hasStarted && userCoords) {
      fetchPlaces(filter, userCoords);
    }
  }, [filter, userCoords, fetchPlaces, hasStarted]);

  // Handle Search Input Change (PRESERVES ACTIVE RADIUS)
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

  // Handle Manual Search Submit (STRICTLY PRESERVES USER SELECTED RADIUS)
  const handleManualSearchSubmit = useCallback(
    async (query: string) => {
      const activeQuery = query.trim();

      setFilter((prev) => ({
        ...prev,
        query: activeQuery,
        category: activeQuery ? 'all' : prev.category,
      }));

      if (!userCoords) {
        setAlertNotification('⚠️ Please allow location access to search nearby places.');
        setTimeout(() => setAlertNotification(null), 3000);
        return;
      }

      setAlertNotification(`🔍 Searching "${activeQuery || 'nearby places'}" within ${filter.maxDistanceKm} km...`);
      setTimeout(() => setAlertNotification(null), 3000);

      const topPlace = await api.getTopRatedPlace(activeQuery || filter.category, userCoords, filter.maxDistanceKm);
      if (topPlace) {
        setAutoNavPlace(topPlace);
      }

      setTimeout(() => {
        const section = document.getElementById('results-section');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    },
    [userCoords, filter.category, filter.maxDistanceKm]
  );

  // Handle Category Select (PRESERVES ACTIVE RADIUS)
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
    if (!userCoords) {
      setAlertNotification('⚠️ Please allow location access.');
      setTimeout(() => setAlertNotification(null), 3000);
      return;
    }
    const activeRadius = filter.maxDistanceKm ?? DEFAULT_RADIUS_KM;
    const topPlace = await api.getTopRatedPlace(searchTermOrCat, userCoords, activeRadius);
    if (topPlace) {
      setAutoNavPlace(topPlace);
    } else {
      setAlertNotification(`No top match found within ${activeRadius} km.`);
      setTimeout(() => setAlertNotification(null), 3000);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (placeId: string) => {
    const updated = await api.toggleFavorite(placeId, user?.id);
    setFavorites(updated);
  };

  const handleUpdateFilter = (partialFilter: Partial<SearchFilter>) => {
    setFilter((prev) => ({ ...prev, ...partialFilter }));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setUser(null);
    setFavorites(getSavedFavorites());
    setHasStarted(false);
  };

  // Render Auth Screen on initial load if user has not entered guest mode
  if (!hasStarted && !user) {
    return (
      <AuthScreen
        onAuthSuccess={(authenticatedUser) => {
          setUser(authenticatedUser);
          setHasStarted(true);
          requestGPSLocation();
        }}
        onContinueAsGuest={() => {
          setHasStarted(true);
          requestGPSLocation();
        }}
      />
    );
  }

  // Filter places for Favorites tab
  const displayedPlaces = activeView === 'favorites'
    ? places.filter((p) => favorites.includes(p.id))
    : places;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between pb-24 md:pb-12 font-sans overflow-x-hidden">
      {/* Header Navigation */}
      <HeaderNavbar
        user={user}
        activeView={activeView}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onGoHome={() => {
          setActiveView('home');
          setFilter((prev) => ({ ...prev, query: '', category: 'all', minRating: 0, openNow: false, sortBy: 'rating' }));
        }}
        onOpenFavorites={() => setActiveView('favorites')}
        favoritesCount={favorites.length}
        locationLabel={locationLabel}
        onRequestGPS={requestGPSLocation}
        onSelectCityLocation={handleSelectCityLocation}
      />

      {/* Main App Body */}
      <main className="flex-1">
        {/* Banner Alert Notification */}
        {alertNotification && (
          <div className="max-w-7xl mx-auto px-4 pt-4">
            <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium flex items-center justify-between animate-fade-in">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400" /> {alertNotification}
              </span>
              <button onClick={() => setAlertNotification(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Hero Section */}
        {activeView !== 'favorites' && (
          <HeroSection
            onSearch={handleSearch}
            currentQuery={filter.query}
            selectedCategory={filter.category}
            onSelectCategory={handleSelectCategory}
            onManualSearchSubmit={handleManualSearchSubmit}
            locationLabel={locationLabel}
            onRequestGPS={requestGPSLocation}
            gpsLocked={gpsStatus === 'locked'}
            activeRadiusKm={filter.maxDistanceKm}
          />
        )}

        {/* Category Bento & Hierarchy Grid */}
        {activeView !== 'favorites' && (
          <CategoryGrid
            selectedCategory={filter.category}
            onSelectCategory={handleSelectCategory}
            onAutoNavigateCategory={(catId) => handleAutoNavigateTopRated(catId)}
          />
        )}

        {/* Filter Toolbar */}
        <FilterBar
          filter={filter}
          onChangeFilter={handleUpdateFilter}
          totalResults={displayedPlaces.length}
        />

        {/* Main Discovery Results Section */}
        <section id="results-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          {/* Mobile View Switcher Button */}
          <div className="md:hidden mb-4 flex justify-end">
            <button
              onClick={() => setShowMobileMap(!showMobileMap)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold text-xs shadow-subtle cursor-pointer"
            >
              {showMobileMap ? <Grid className="w-4 h-4" /> : <Map className="w-4 h-4" />}
              <span>{showMobileMap ? 'View Result Cards' : 'View Full Map'}</span>
            </button>
          </div>

          {/* Loading & Empty States */}
          {loading ? (
            <SkeletonGrid count={6} />
          ) : gpsStatus === 'denied' ? (
            <EmptyState type="location_denied" onResyncGPS={requestGPSLocation} />
          ) : activeView === 'favorites' && displayedPlaces.length === 0 ? (
            <EmptyState type="no_favorites" />
          ) : displayedPlaces.length === 0 ? (
            <EmptyState
              type="no_results"
              searchQuery={filter.query || filter.category}
              currentRadius={filter.maxDistanceKm}
              onResetFilters={() =>
                setFilter((prev) => ({ ...prev, query: '', category: 'all', minRating: 0, openNow: false, sortBy: 'rating' }))
              }
              onExpandRadius={() => setFilter((prev) => ({ ...prev, maxDistanceKm: Math.min(25, (prev.maxDistanceKm || 4) + 2) }))}
              onFocusSearch={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
          ) : (
            /* Split View Layout (Results 45% | Map 55%) */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left Column: Result Cards List (45%) */}
              <div className={`${showMobileMap ? 'hidden md:block' : 'block'} md:col-span-5 space-y-4`}>
                <div className="grid grid-cols-1 gap-4">
                  {displayedPlaces.map((place) => (
                    <ResultCard
                      key={place.id}
                      place={place}
                      isFavorite={favorites.includes(place.id)}
                      isSelected={selectedPlace?.id === place.id}
                      userCoords={userCoords}
                      onToggleFavorite={handleToggleFavorite}
                      onSelectPlace={setSelectedPlace}
                      onHoverPlace={setHoveredPlace}
                    />
                  ))}
                </div>
              </div>

              {/* Right Column: Sticky MapView (55%) */}
              <div className={`${showMobileMap ? 'block' : 'hidden md:block'} md:col-span-7 md:sticky md:top-20`}>
                <MapView
                  places={displayedPlaces}
                  selectedPlace={selectedPlace || displayedPlaces[0]}
                  hoveredPlace={hoveredPlace}
                  onSelectPlace={setSelectedPlace}
                  userCoords={userCoords}
                  activeRadiusKm={filter.maxDistanceKm}
                  heightClass="h-[500px] md:h-[calc(100vh-120px)]"
                />
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer Branding */}
      <footer className="border-t border-slate-800/80 py-8 bg-[#090d16] text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
              F
            </div>
            <span className="font-bold text-slate-100">FastFind</span>
            <span>— Discover highly rated places near you and get there faster.</span>
          </div>

          <p className="text-slate-500 text-[11px]">
            © {new Date().getFullYear()} FastFind. All rights reserved. Powered by Google Places & Maps API.
          </p>
        </div>
      </footer>

      {/* Modals & Overlays */}
      {/* 1. Place Detail Modal */}
      {selectedPlace && (
        <PlaceDetailsModal
          place={selectedPlace}
          userCoords={userCoords}
          isFavorite={favorites.includes(selectedPlace.id)}
          onClose={() => setSelectedPlace(null)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* 2. Auto-Navigate Top Rated Modal */}
      {autoNavPlace && (
        <AutoNavigateModal
          place={autoNavPlace}
          userCoords={userCoords}
          onClose={() => setAutoNavPlace(null)}
          onViewDetails={(p) => {
            setAutoNavPlace(null);
            setSelectedPlace(p);
          }}
        />
      )}

      {/* 3. Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(u) => {
            setUser(u);
            setShowAuthModal(false);
            setAlertNotification(`Welcome back, ${u.name}!`);
            requestGPSLocation();
          }}
        />
      )}

      {/* Mobile Navigation Bar */}
      <BottomNav
        activeView={activeView}
        onChangeView={(view) => {
          if (view === 'profile' && !user) {
            setShowAuthModal(true);
            return;
          }
          setActiveView(view);
          if (view === 'explore') {
            setFilter((prev) => ({ ...prev, query: '', category: 'all', openNow: true }));
          }
        }}
        favoritesCount={favorites.length}
      />
    </div>
  );
}
