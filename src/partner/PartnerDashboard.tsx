import React, { useMemo, useState } from 'react';
import type { AdminUser } from '../admin/types/admin.types';
import { useEvents } from '../hooks/useEvents';
import { useUsers } from '../hooks/useUsers';
import { BookPerformerModal } from './components/BookPerformerModal';
import { EventDetailsModal } from './components/EventDetailsModal';
import { FestiveHeroBanner } from './components/FestiveHeroBanner';
import { LocationSelectorModal } from './components/LocationSelectorModal';
import { NotificationsModal } from './components/NotificationsModal';
import { PartnerFooter } from './components/PartnerFooter';
import { PartnerNavbar } from './components/PartnerNavbar';
import { PartnerProfileModal } from './components/PartnerProfileModal';
import { RecommendedPartnersSection } from './components/RecommendedPartnersSection';
import { StatsRow } from './components/StatsRow';
import { UpcomingEventsSection } from './components/UpcomingEventsSection';
import {
  CURRENT_USER,
  INITIAL_REQUESTS,
  UPCOMING_EVENTS
} from './data/partnerMockData';
import './partner.css';
import type { GarbaEvent, GarbaPartner, PartnerRequest, PartnerStats } from './types/partner.types';

// Helper to map DB AdminUser directly to UI GarbaPartner
function mapAdminUserToPartner(user: AdminUser, favoritePartnerIds: Set<string>): GarbaPartner {
  let age = 24;
  if (user.dateOfBirth) {
    const dob = new Date(user.dateOfBirth);
    if (!isNaN(dob.getTime())) {
      const diffYears = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000));
      if (diffYears >= 16 && diffYears <= 70) age = diffYears;
    }
  }

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

  return {
    id: user.id,
    name: user.name,
    age,
    gender: user.gender || 'OTHER',
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
  // Location State
  const [selectedState, setSelectedState] = useState<string>(CURRENT_USER.state);
  const [selectedCity, setSelectedCity] = useState<string>(CURRENT_USER.city);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favoritePartnerIds, setFavoritePartnerIds] = useState<Set<string>>(new Set());

  // Dynamic DB Data using TanStack Query - strictly fetch PERFORMER models
  const { data: usersData, isLoading: isUsersLoading } = useUsers({
    role: 'PERFORMER',
    page: 1,
    limit: 50,
  });

  // Dynamic DB Events using TanStack Query
  const { data: eventsData } = useEvents({
    page: 1,
    limit: 50,
  });

  const dynamicPartners: GarbaPartner[] = useMemo(() => {
    if (!usersData?.users || usersData.users.length === 0) return [];
    return usersData.users
      .filter((u) => u.role === 'PERFORMER')
      .map((u) => mapAdminUserToPartner(u, favoritePartnerIds));
  }, [usersData, favoritePartnerIds]);

  // Local state for event interactive actions (bookmark / RSVP)
  const [localEventState, setLocalEventState] = useState<Record<string, { isFavorite?: boolean; isJoined?: boolean }>>({});

  // Dynamic Events: use real created events from DB, fallback to UPCOMING_EVENTS if none exist
  const displayedEvents: GarbaEvent[] = useMemo(() => {
    const dbEvents = eventsData?.data?.events;
    const baseEvents = (dbEvents && dbEvents.length > 0) ? dbEvents : UPCOMING_EVENTS;

    return baseEvents.map((evt) => {
      const override = localEventState[evt.id];
      if (!override) return evt;
      return {
        ...evt,
        ...(override.isFavorite !== undefined ? { isFavorite: override.isFavorite } : {}),
        ...(override.isJoined !== undefined ? { isJoined: override.isJoined } : {}),
      };
    });
  }, [eventsData, localEventState]);

  const [requests, setRequests] = useState<PartnerRequest[]>(INITIAL_REQUESTS);
  const [bookedPerformersCount, setBookedPerformersCount] = useState(1);

  // Modal States
  const [selectedPartner, setSelectedPartner] = useState<GarbaPartner | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState<GarbaEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);

  // Filter dynamic partners based on search query & selected city
  const filteredPartners = useMemo(() => {
    return dynamicPartners.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      const matchesSearch = 
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.danceStyles.some(s => s.toLowerCase().includes(q));
      
      return matchesSearch;
    });
  }, [dynamicPartners, searchQuery]);

  // Stats Calculation
  const stats: PartnerStats = {
    partnerRequests: requests.length,
    matches: dynamicPartners.length > 0 ? Math.min(dynamicPartners.length, 6) : 4,
    newMessages: 8,
    upcomingEvents: displayedEvents.filter(e => e.isJoined).length + bookedPerformersCount,
  };

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

  const handleToggleSaveEvent = (eventId: string) => {
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
  };

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

  const handleBookingComplete = (_bookingRecord: any) => {
    setBookedPerformersCount((prev) => prev + 1);
  };

  const handleAcceptRequest = (requestId: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
    alert('Partner request accepted! You are now matched.');
  };

  const handleDeclineRequest = (requestId: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  const handleSelectStat = (type: 'requests' | 'matches' | 'messages' | 'events') => {
    if (type === 'requests') setIsNotificationsModalOpen(true);
    if (type === 'events') {
      const el = document.getElementById('events-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
    if (type === 'matches') {
      const el = document.getElementById('partners-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="partner-portal">
      {/* Top Navbar */}
      <PartnerNavbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedState={selectedState}
        selectedCity={selectedCity}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        onOpenMessages={() => setIsNotificationsModalOpen(true)}
        onSwitchToAdmin={onSwitchToAdmin || (() => {})}
      />

      {/* Main Body Container */}
      <main className="partner-container" style={{ paddingBottom: '60px' }}>
        {/* Festive Hero Carousel with Real Admin Events */}
        <FestiveHeroBanner
          events={displayedEvents}
          onSelectEvent={handleViewEventDetails}
        />

        {/* 4 Stats Cards */}
        <StatsRow stats={stats} onSelectStat={handleSelectStat} />

        {/* Upcoming Event Section */}
        <div id="events-section">
          <UpcomingEventsSection
            events={displayedEvents}
            onViewEventDetails={handleViewEventDetails}
            onFindPartnerForEvent={handleFindPartnerForEvent}
            onToggleSaveEvent={handleToggleSaveEvent}
          />
        </div>

        {/* Recommended Performers & Partners Section */}
        <div id="partners-section">
          <RecommendedPartnersSection
            partners={filteredPartners}
            isLoading={isUsersLoading}
            onOpenProfile={handleOpenProfile}
            onBookPartner={handleOpenBook}
            onToggleFavorite={handleToggleFavoritePartner}
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
    </div>
  );
};

export default PartnerDashboard;
