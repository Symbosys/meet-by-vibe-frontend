import React, { useEffect, useMemo, useState } from 'react';
import type { AdminUser } from '../admin/types/admin.types';
import { useEvents } from '../hooks/useEvents';
import { useUsers } from '../hooks/useUsers';
import { fetchCurrentLocationViaOlaMaps } from '../utils/olaMaps';
import { BookPerformerModal } from './components/BookPerformerModal';
import { EventDetailsModal } from './components/EventDetailsModal';
import { FestiveHeroBanner } from './components/FestiveHeroBanner';
import { GenderPreferenceModal } from './components/GenderPreferenceModal';
import { LocationSelectorModal } from './components/LocationSelectorModal';
import { NotificationsModal } from './components/NotificationsModal';
import { PartnerFooter } from './components/PartnerFooter';
import { PartnerNavbar } from './components/PartnerNavbar';
import { PartnerProfileModal } from './components/PartnerProfileModal';
import { RecommendedPartnersSection } from './components/RecommendedPartnersSection';
// import { UpcomingEventsSection } from './components/UpcomingEventsSection';
import {
  CURRENT_USER,
  INITIAL_REQUESTS,
} from './data/partnerMockData';
import './partner.css';
import type { GarbaEvent, GarbaPartner, PartnerRequest } from './types/partner.types';
import { getPartnerAge } from './utils/age.util';

// Helper to map DB AdminUser directly to UI GarbaPartner
function mapAdminUserToPartner(user: AdminUser, favoritePartnerIds: Set<string>): GarbaPartner {
  // Render age dynamically distributed in the 21 to 26 range based on unique user
  const age = getPartnerAge(user.id, user.name);

  const photosList = user.photos && user.photos.length > 0 
    ? user.photos.map(p => p.imageUrl) 
    : [user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80'];

  const avatar = user.avatarUrl || photosList[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80';

  const skillMap: Record<string, string> = {
    BEGINNER: 'Beginner',
    INTERMEDIATE: 'Intermediate',
    ADVANCED: 'Advanced',
    PRO: 'Pro Performer',
    CHOREOGRAPHER: 'Choreographer',
  };

  const skillName = skillMap[user.skillLevel] || user.skillLevel || 'Choreographer';

  const normalizedGender: 'MALE' | 'FEMALE' | 'OTHER' = 
    String(user.gender || '').trim().toUpperCase() === 'MALE' ? 'MALE' :
    String(user.gender || '').trim().toUpperCase() === 'FEMALE' ? 'FEMALE' : 'OTHER';

  return {
    id: user.id,
    name: user.name,
    age,
    gender: normalizedGender,
    avatarUrl: avatar,
    isVerified: user.isVerified ?? true,
    isOnline: user.isAvailable ?? true,
    matchScore: user.rating ? Math.min(99, Math.max(80, Math.round(Number(user.rating) * 20))) : (88 + (user.name.length % 11)),
    tag: user.role === 'PERFORMER' ? 'Partner' : 'Partner',
    city: user.city || 'Ahmedabad',
    state: user.state || 'Gujarat',
    mySkill: skillName,
    theirSkill: user.role === 'PERFORMER' ? 'Expert Dancer' : 'All Welcome',
    preferredDate: 'Navratri 2026',
    danceStyles: user.danceStyles && user.danceStyles.length > 0 ? user.danceStyles : ['Traditional Garba', 'Dodhiya', 'Dandiya Raas'],
    photosCount: Math.max(photosList.length, 5),
    photos: photosList,
    bio: user.bio || 'Passionate Garba dancer & performer available for Navratri events, competitions, and stage choreography.',
    heightCm: user.height ? Number(user.height) : 168,
    instagram: user.instagramHandle || undefined,
    attendingEventIds: ['evt-1', 'evt-2', 'evt-3'],
    hourlyRate: user.hourlyRate ? Number(user.hourlyRate) : 800,
    upiId: user.upiId || 'garba.pay@okaxis',
    isFavorite: favoritePartnerIds.has(user.id),
    requestStatus: 'NONE',
  };
}

interface PartnerDashboardProps {
  onSwitchToAdmin?: () => void;
}

export const PartnerDashboard: React.FC<PartnerDashboardProps> = ({ onSwitchToAdmin }) => {
  // Location State & Ola Maps Live Detection
  const [selectedState, setSelectedState] = useState<string>(CURRENT_USER.state);
  const [selectedCity, setSelectedCity] = useState<string>(CURRENT_USER.city);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationDetected, setLocationDetected] = useState<boolean>(false);

  const handleDetectLocation = async () => {
    setIsLocating(true);
    try {
      const loc = await fetchCurrentLocationViaOlaMaps();
      if (loc.state) setSelectedState(loc.state);
      if (loc.city) setSelectedCity(loc.city);
      setLocationDetected(true);
    } catch (err) {
      console.warn('Could not auto-fetch location via Ola Maps:', err);
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    // Automatically detect user's current live location on mount using Ola Maps API
    handleDetectLocation();
  }, []);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favoritePartnerIds, setFavoritePartnerIds] = useState<Set<string>>(new Set());

  // Dynamic DB Data using TanStack Query - fetch all partner & performer models from DB
  const { data: usersData, isLoading: isUsersLoading } = useUsers({
    page: 1,
    limit: 100,
  });

  // Dynamic DB Events using TanStack Query
  const { data: eventsData, isLoading: isEventsLoading } = useEvents({
    page: 1,
    limit: 50,
  });

  const dynamicPartners: GarbaPartner[] = useMemo(() => {
    let rawUsers: AdminUser[] = [];
    if (Array.isArray(usersData)) {
      rawUsers = usersData;
    } else if (Array.isArray((usersData as any)?.users)) {
      rawUsers = (usersData as any).users;
    } else if (Array.isArray((usersData as any)?.data?.users)) {
      rawUsers = (usersData as any).data.users;
    } else if (Array.isArray((usersData as any)?.data)) {
      rawUsers = (usersData as any).data;
    }

    if (!rawUsers || rawUsers.length === 0) return [];

    // Exclude system admins from partner discovery, display all performer/user models
    const partnerUsers = rawUsers.filter((u) => u.role !== 'ADMIN');

    return partnerUsers.map((u) => mapAdminUserToPartner(u, favoritePartnerIds));
  }, [usersData, favoritePartnerIds]);

  // Local state for event interactive actions (bookmark / RSVP)
  const [localEventState, setLocalEventState] = useState<Record<string, { isFavorite?: boolean; isJoined?: boolean }>>({});

  // Dynamic Events: use real created events from DB without flashing static mock data
  const displayedEvents: GarbaEvent[] = useMemo(() => {
    const dbEvents = eventsData?.data?.events;
    if (dbEvents && dbEvents.length > 0) {
      return dbEvents.map((evt) => {
        const override = localEventState[evt.id];
        if (!override) return evt;
        return {
          ...evt,
          ...(override.isFavorite !== undefined ? { isFavorite: override.isFavorite } : {}),
          ...(override.isJoined !== undefined ? { isJoined: override.isJoined } : {}),
        };
      });
    }
    return [];
  }, [eventsData, localEventState]);

  const [requests, setRequests] = useState<PartnerRequest[]>(INITIAL_REQUESTS);

  // Modal States
  const [selectedPartner, setSelectedPartner] = useState<GarbaPartner | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState<GarbaEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);

  // Gender Preference Filter (persisted in localStorage to prevent popup on page refresh)
  const [selectedGenderPreference, setSelectedGenderPreference] = useState<'MALE' | 'FEMALE' | 'ALL'>(() => {
    try {
      const saved = localStorage.getItem('meetbyvibe_gender_preference');
      if (saved === 'MALE' || saved === 'FEMALE' || saved === 'ALL') {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'ALL';
  });

  const [isGenderModalOpen, setIsGenderModalOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('meetbyvibe_gender_preference');
      return !saved; // If already selected previously, do not open popup
    } catch {
      return true;
    }
  });

  const handleSelectGenderPreference = (gender: 'MALE' | 'FEMALE' | 'ALL') => {
    setSelectedGenderPreference(gender);
    try {
      localStorage.setItem('meetbyvibe_gender_preference', gender);
    } catch (e) {
      console.error('Failed to save gender preference to localStorage:', e);
    }
  };

  // Filter dynamic partners based on gender preference, search query & selected city
  const filteredPartners = useMemo(() => {
    return dynamicPartners.filter((p) => {
      // Gender filtering: ALL shows both Male & Female, FEMALE shows Female only, MALE shows Male only
      if (selectedGenderPreference && selectedGenderPreference !== 'ALL') {
        const pref = selectedGenderPreference.toUpperCase();
        const pGender = String(p.gender || '').toUpperCase();
        if (pGender !== pref) {
          return false;
        }
      }

      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      const matchesSearch = 
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.danceStyles.some(s => s.toLowerCase().includes(q));
      
      return matchesSearch;
    });
  }, [dynamicPartners, searchQuery, selectedGenderPreference]);

  // Handlers
  const handleOpenProfile = (partner: GarbaPartner) => {
    setSelectedPartner(partner);
    setIsProfileModalOpen(true);
  };

  const handleOpenBook = (partner: GarbaPartner) => {
    setSelectedPartner(partner);
    setIsBookModalOpen(true);
  };

  const handleToggleFavoritePartner = (partnerId: string) => {
    setFavoritePartnerIds((prev) => {
      const next = new Set(prev);
      if (next.has(partnerId)) next.delete(partnerId);
      else next.add(partnerId);
      return next;
    });
  };

  /* const handleToggleSaveEvent = (eventId: string) => {
    setLocalEventState((prev) => {
      const current = displayedEvents.find((e) => e.id === eventId);
      const isFav = prev[eventId]?.isFavorite !== undefined ? prev[eventId].isFavorite : current?.isFavorite;
      return {
        ...prev,
        [eventId]: {
          ...prev[eventId],
          isFavorite: !isFav,
        },
      };
    });
  }; */

  const handleToggleJoinEvent = (eventId: string) => {
    setSelectedEvent((prev) => (prev && prev.id === eventId ? { ...prev, isJoined: !prev.isJoined } : prev));
    setLocalEventState((prev) => {
      const current = displayedEvents.find((e) => e.id === eventId);
      const isJoined = prev[eventId]?.isJoined !== undefined ? prev[eventId].isJoined : current?.isJoined;
      return {
        ...prev,
        [eventId]: {
          ...prev[eventId],
          isJoined: !isJoined,
        },
      };
    });
  };

  const handleViewEventDetails = (event: GarbaEvent) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleFindPartnerForEvent = (event: GarbaEvent) => {
    setSearchQuery(event.city);
    const targetElement = document.getElementById('partners-section');
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookingComplete = () => {
    // Booking confirmation handled inside modal
  };

  const handleAcceptRequest = (requestId: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
    alert('Partner request accepted! You are now matched.');
  };

  const handleDeclineRequest = (requestId: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  return (
    <div className="partner-portal">
      {/* Top Navbar */}
      <PartnerNavbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedState={selectedState}
        selectedCity={selectedCity}
        isLocating={isLocating}
        locationDetected={locationDetected}
        onDetectLocation={handleDetectLocation}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        onOpenMessages={() => setIsNotificationsModalOpen(true)}
        onSwitchToAdmin={onSwitchToAdmin || (() => {})}
        onRegisterEvent={() => {
          window.location.href = '/create-event';
        }}
      />

      {/* Main Body Container */}
      <main className="partner-container" style={{ paddingBottom: '60px' }}>
        {/* Festive Hero Carousel with Real Admin Events */}
        <FestiveHeroBanner
          events={displayedEvents}
          isLoading={isEventsLoading}
          onSelectEvent={handleViewEventDetails}
        />

        {/* Upcoming Event Section (Commented Out) */}
        {/* <div id="events-section">
          <UpcomingEventsSection
            events={displayedEvents}
            onViewEventDetails={handleViewEventDetails}
            onFindPartnerForEvent={handleFindPartnerForEvent}
            onToggleSaveEvent={handleToggleSaveEvent}
          />
        </div> */}

        {/* Recommended Performers & Partners Section */}
        <div id="partners-section">
          <RecommendedPartnersSection
            partners={filteredPartners}
            isLoading={isUsersLoading}
            onOpenProfile={handleOpenProfile}
            onBookPartner={handleOpenBook}
            onToggleFavorite={handleToggleFavoritePartner}
            selectedGender={selectedGenderPreference}
            onChangeGender={handleSelectGenderPreference}
            onOpenGenderModal={() => setIsGenderModalOpen(true)}
          />
        </div>
      </main>

      {/* Deep Dark Footer */}
      <PartnerFooter selectedCity={selectedCity} />

      {/* Interactive Modals */}
      <PartnerProfileModal
        partner={selectedPartner}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onBookPartner={handleOpenBook}
      />

      {/* Comprehensive Booking Modal matching Prisma schema */}
      <BookPerformerModal
        partner={selectedPartner}
        events={displayedEvents}
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onBookingComplete={handleBookingComplete}
      />

      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        selectedState={selectedState}
        selectedCity={selectedCity}
        onClose={() => setIsLocationModalOpen(false)}
        onSelectLocation={(state, city) => {
          setSelectedState(state);
          setSelectedCity(city);
        }}
      />

      <EventDetailsModal
        event={selectedEvent}
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onFindPartner={handleFindPartnerForEvent}
        onToggleJoin={handleToggleJoinEvent}
      />

      <NotificationsModal
        requests={requests}
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        onAcceptRequest={handleAcceptRequest}
        onDeclineRequest={handleDeclineRequest}
      />

      {/* Auto Pop-up on Page Load for Gender Selection */}
      <GenderPreferenceModal
        isOpen={isGenderModalOpen}
        onClose={() => setIsGenderModalOpen(false)}
        selectedGender={selectedGenderPreference}
        onSelectGender={(gender) => {
          handleSelectGenderPreference(gender);
          setIsGenderModalOpen(false);
        }}
      />
    </div>
  );
};

export default PartnerDashboard;
