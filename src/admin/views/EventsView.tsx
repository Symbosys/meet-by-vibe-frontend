import {
    AlertCircle,
    Calendar,
    CalendarCheck2,
    Clock,
    Edit3,
    Loader2,
    MapPin,
    Plus,
    RefreshCw,
    Search,
    Sparkles,
    Trash2,
    Users
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useDeleteEvent, useEvents, useUpdateEvent } from '../../hooks/useEvents';
import type { GarbaEvent } from '../../partner/types/partner.types';

interface EventsViewProps {
  onAddEvent: () => void;
  onEditEvent: (event: any) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  onAddEvent,
  onEditEvent,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [cityFilter, setCityFilter] = useState<string>('ALL');
  const [featuredOnly, setFeaturedOnly] = useState(false);

  // Fetch events from backend
  const { data, isLoading, isError, error, refetch, isFetching } = useEvents({
    search: search || undefined,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    city: cityFilter === 'ALL' ? undefined : cityFilter,
    isFeatured: featuredOnly ? true : undefined,
    limit: 50,
  });

  const deleteEventMutation = useDeleteEvent();
  const updateEventMutation = useUpdateEvent();

  const events = data?.data?.events || [];
  const totalCount = data?.data?.pagination?.total ?? events.length;

  // Derive unique cities
  const uniqueCities = useMemo(() => {
    const cities = new Set<string>();
    events.forEach((e) => {
      if (e.city) cities.add(e.city);
    });
    return Array.from(cities);
  }, [events]);

  // Quick stats
  const upcomingCount = events.filter((e) => (e as any).status === 'UPCOMING' || !((e as any).status)).length;
  const featuredCount = events.filter((e) => e.isFeatured).length;
  const totalAttendees = events.reduce((sum, e) => sum + (e.attendeesCount || 0), 0);

  const handleDelete = async (event: GarbaEvent) => {
    if (confirm(`Are you sure you want to delete event "${event.title}"? This cannot be undone.`)) {
      try {
        await deleteEventMutation.mutateAsync(event.id);
      } catch (err: any) {
        alert(err.message || 'Failed to delete event');
      }
    }
  };

  const handleToggleFeatured = async (event: GarbaEvent) => {
    try {
      await updateEventMutation.mutateAsync({
        id: event.id,
        data: { isFeatured: !event.isFeatured },
      });
    } catch (err: any) {
      alert(err.message || 'Failed to update event');
    }
  };

  const getStatusBadge = (status?: string) => {
    const s = (status || 'UPCOMING').toUpperCase();
    switch (s) {
      case 'ONGOING':
        return <span className="event-badge status-ongoing">🟢 Live Now</span>;
      case 'COMPLETED':
        return <span className="event-badge status-completed">Completed</span>;
      case 'DRAFT':
        return <span className="event-badge status-draft">Draft</span>;
      case 'CANCELLED':
        return <span className="event-badge status-cancelled">Cancelled</span>;
      case 'UPCOMING':
      default:
        return <span className="event-badge status-upcoming">Upcoming</span>;
    }
  };

  return (
    <div className="admin-events-view">
      {/* Top Metric Cards */}
      <div className="admin-stats-grid" style={{ marginBottom: '20px' }}>
        <div className="admin-stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(255, 19, 121, 0.15)', color: '#ff1379' }}>
            <Calendar size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Events</span>
            <span className="stat-value">{totalCount}</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
            <CalendarCheck2 size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Upcoming / Live</span>
            <span className="stat-value">{upcomingCount}</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Sparkles size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Featured Nights</span>
            <span className="stat-value">{featuredCount}</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Users size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total RSVPs & Attendees</span>
            <span className="stat-value">{totalAttendees}</span>
          </div>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="admin-card">
        {/* Header with Title & Action */}
        <div className="admin-card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2>Garba & Dandiya Events ({events.length})</h2>
              {isFetching && <Loader2 size={16} className="spin" color="#ff1379" />}
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
              Create, manage, and publish Navratri Mahotsavs, Dandiya Nights, passes & passes capacity.
            </p>
          </div>

          <div className="admin-card-actions">
            <button
              className="admin-btn-secondary"
              onClick={() => refetch()}
              title="Refresh events list"
              disabled={isFetching}
            >
              <RefreshCw size={15} className={isFetching ? 'spin' : ''} />
              <span>Refresh</span>
            </button>

            <button
              className="admin-btn-primary"
              onClick={onAddEvent}
              style={{
                background: 'linear-gradient(135deg, #ff1379, #9b19f5)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Plus size={16} />
              <span>Create New Event</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="events-filters-bar">
          {/* Search Input Box */}
          <div className="events-search-box">
            <Search size={16} className="events-search-icon" />
            <input
              type="text"
              className="events-search-input"
              placeholder="Search by event title, venue, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Select Filter Controls Row */}
          <div className="events-filter-controls-row">
            {/* Status Filter */}
            <div className="events-filter-item">
              <span className="events-filter-label">Status:</span>
              <select
                className="events-filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="ONGOING">Ongoing</option>
                <option value="DRAFT">Draft</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* City Filter */}
            <div className="events-filter-item">
              <span className="events-filter-label">City:</span>
              <select
                className="events-filter-select"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              >
                <option value="ALL">All Cities</option>
                {uniqueCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Featured Filter Toggle Button */}
          <button
            type="button"
            className={`events-featured-btn ${featuredOnly ? 'active' : ''}`}
            onClick={() => setFeaturedOnly(!featuredOnly)}
          >
            <Sparkles size={15} />
            <span>Featured Only</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="events-cards-content-area">
          {isLoading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
              <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px', color: '#ff1379' }} />
              <p>Loading events from database...</p>
            </div>
          ) : isError ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#f87171' }}>
              <AlertCircle size={32} style={{ margin: '0 auto 8px' }} />
              <p>Failed to load events: {(error as any)?.message || 'Server error'}</p>
              <button
                className="admin-btn-secondary"
                onClick={() => refetch()}
                style={{ marginTop: '12px' }}
              >
                Retry
              </button>
            </div>
          ) : events.length === 0 ? (
            <div
              style={{
                padding: '60px 20px',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '12px',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
              }}
            >
              <Calendar size={48} color="#64748b" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ margin: '0 0 6px', color: '#fff', fontSize: '16px' }}>No events found</h3>
              <p style={{ margin: '0 0 16px', color: '#94a3b8', fontSize: '13px' }}>
                {search || statusFilter !== 'ALL' || cityFilter !== 'ALL'
                  ? 'No events match your current filter criteria.'
                  : 'Start by creating your first Navratri Dandiya Night event.'}
              </p>
              <button className="admin-btn-primary" onClick={onAddEvent}>
                <Plus size={16} />
                <span>Create New Event</span>
              </button>
            </div>
          ) : (
            /* Events Grid Cards */
            <div className="admin-events-grid">
              {events.map((evt: any) => (
                <div key={evt.id} className="admin-event-card">
                  {/* Banner Image Container */}
                  <div className="event-card-banner">
                    <img
                      src={evt.imageUrl || 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&auto=format&fit=crop&q=80'}
                      alt={evt.title}
                      loading="lazy"
                    />
                    <div className="event-banner-badges">
                      {getStatusBadge(evt.status)}
                      {evt.isFeatured && (
                        <span className="event-badge badge-featured">
                          ⭐ Featured
                        </span>
                      )}
                    </div>

                    <div className="event-banner-price">
                      {evt.pricePerPass && Number(evt.pricePerPass) > 0 ? (
                        <span>₹{evt.pricePerPass} / Pass</span>
                      ) : (
                        <span style={{ color: '#4ade80' }}>Free Entry</span>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="event-card-content">
                    <h3 className="event-card-title" title={evt.title}>
                      {evt.title}
                    </h3>

                    <p className="event-card-desc">
                      {evt.description || 'No description provided.'}
                    </p>

                    {/* Meta Details: Date, Time, Venue, City */}
                    <div className="event-meta-list">
                      <div className="event-meta-item">
                        <Calendar size={14} color="#ff1379" />
                        <span>{evt.date || 'Date TBA'}</span>
                      </div>

                      <div className="event-meta-item">
                        <Clock size={14} color="#a855f7" />
                        <span>{evt.time || '07:30 PM'}</span>
                      </div>

                      <div className="event-meta-item" style={{ gridColumn: 'span 2' }}>
                        <MapPin size={14} color="#f59e0b" />
                        <span title={`${evt.venue}, ${evt.city}`}>{evt.venue}, {evt.city}</span>
                      </div>
                    </div>

                    {/* Stats bar: Attendees & Partner Search */}
                    <div className="event-attendees-bar">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={14} color="#38bdf8" />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>
                          {evt.attendeesCount || 0} RSVPs
                        </span>
                      </div>

                      {evt.lookingForPartnerCount !== undefined && evt.lookingForPartnerCount > 0 && (
                        <span
                          style={{
                            fontSize: '11px',
                            background: 'rgba(255, 19, 121, 0.15)',
                            color: '#ff1379',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontWeight: 600,
                          }}
                        >
                          👥 {evt.lookingForPartnerCount} looking for partner
                        </span>
                      )}
                    </div>

                    {/* Actions Bar */}
                    <div className="event-card-actions">
                      <button
                        className="event-action-btn edit"
                        onClick={() => onEditEvent(evt)}
                        title="Edit event"
                      >
                        <Edit3 size={14} />
                        <span>Edit</span>
                      </button>

                      <button
                        className={`event-action-btn feature ${evt.isFeatured ? 'active' : ''}`}
                        onClick={() => handleToggleFeatured(evt)}
                        title={evt.isFeatured ? 'Remove from Featured' : 'Mark as Featured'}
                      >
                        <Sparkles size={14} />
                        <span>{evt.isFeatured ? 'Featured' : 'Feature'}</span>
                      </button>

                      <button
                        className="event-action-btn delete"
                        onClick={() => handleDelete(evt)}
                        title="Delete event"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
