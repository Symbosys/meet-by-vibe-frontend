import React, { useState } from 'react';
import { useBookings, useDeleteBooking, useUpdateBookingStatus } from '../hooks/useBookings';
import { useEvents } from '../hooks/useEvents';
import { useUsers } from '../hooks/useUsers';
import './admin.css';
import { AdminPinLockScreen } from './components/AdminPinLockScreen';
import { BookingDetailsModal } from './components/BookingDetailsModal';
import { EventModal } from './components/EventModal';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { UserModal } from './components/UserModal';
import { CreateEventScreen } from './CreateEventScreen';
import { INITIAL_BOOKINGS } from './data/mockData';
import type { ActiveTab, AdminBooking, AdminUser, BookingStatus } from './types/admin.types';
import { BookingsView } from './views/BookingsView';
import { EventsView } from './views/EventsView';
import { PaymentsView } from './views/PaymentsView';
import { UsersView } from './views/UsersView';

export const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('users');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isCreateEventScreenOpen, setIsCreateEventScreenOpen] = useState<boolean>(false);

  // TanStack Query for users, events, and bookings count & syncing
  const { data: usersData } = useUsers({ limit: 100 });
  const { data: eventsData } = useEvents({ limit: 100 });
  const { data: bookingsData } = useBookings();
  const updateBookingMutation = useUpdateBookingStatus();
  const deleteBookingMutation = useDeleteBooking();

  const userCount = (usersData?.users || []).filter((u) => u.role !== 'ADMIN').length;
  const eventCount = eventsData?.data?.pagination?.total ?? eventsData?.data?.events?.length ?? 0;
  
  // Fallback to local bookings state if backend is initializing
  const [fallbackBookings, setFallbackBookings] = useState<AdminBooking[]>(INITIAL_BOOKINGS);
  const bookings = bookingsData?.bookings || fallbackBookings;
  const bookingCount = bookingsData?.pagination?.total ?? bookings.length;

  // Modal States
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Handlers for User Modal
  const handleAddUser = () => {
    setSelectedUser(null);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  // Handlers for Event Modal & Screen
  const handleAddEvent = () => {
    setIsCreateEventScreenOpen(true);
  };

  const handleEditEvent = (event: any) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  // Handlers for Bookings
  const handleViewBooking = (booking: AdminBooking) => {
    setSelectedBooking(booking);
    setIsBookingModalOpen(true);
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      await updateBookingMutation.mutateAsync({ id: bookingId, status: newStatus });
    } catch {
      // Fallback local update
      setFallbackBookings((prev) =>
        prev.map((b) => {
          if (b.id === bookingId) {
            const updated = { ...b, status: newStatus };
            if (newStatus === 'CONFIRMED' && updated.payment) {
              updated.payment = {
                ...updated.payment,
                paymentStatus: 'SUCCESS',
                paidAt: new Date().toISOString()
              };
            }
            return updated;
          }
          return b;
        })
      );
    }

    if (selectedBooking && selectedBooking.id === bookingId) {
      setSelectedBooking((prev) => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleDeleteBooking = async (booking: AdminBooking) => {
    if (confirm(`Are you sure you want to delete booking "${booking.bookingCode}"? This will permanently remove it from the database.`)) {
      try {
        await deleteBookingMutation.mutateAsync(booking.id);
      } catch (err: any) {
        alert(err.message || 'Failed to delete booking');
      } finally {
        setFallbackBookings((prev) => prev.filter((b) => b.id !== booking.id));
        if (selectedBooking && selectedBooking.id === booking.id) {
          setSelectedBooking(null);
          setIsBookingModalOpen(false);
        }
      }
    }
  };

  const pendingBookingsCount = bookings.filter(
    (b) => b.status === 'PENDING' || b.status === 'PAYMENT_VERIFIED'
  ).length;

  if (!isAuthenticated) {
    return <AdminPinLockScreen onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  if (isCreateEventScreenOpen) {
    return <CreateEventScreen onBack={() => setIsCreateEventScreenOpen(false)} />;
  }

  return (
    <div className="admin-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userCount={userCount}
        eventCount={eventCount}
        bookingCount={bookingCount}
        pendingCount={pendingBookingsCount}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="admin-main">
        <Header
          activeTab={activeTab}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        <div className="admin-content">
          {activeTab === 'users' && (
            <UsersView
              onAddUser={handleAddUser}
              onEditUser={handleEditUser}
            />
          )}

          {activeTab === 'events' && (
            <EventsView
              onAddEvent={handleAddEvent}
              onEditEvent={handleEditEvent}
            />
          )}

          {activeTab === 'bookings' && (
            <BookingsView
              bookings={bookings}
              onViewBooking={handleViewBooking}
              onUpdateStatus={handleUpdateBookingStatus}
              onDeleteBooking={handleDeleteBooking}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsView bookings={bookings} />
          )}
        </div>
      </main>

      {/* Modals */}
      <UserModal
        isOpen={isUserModalOpen}
        user={selectedUser}
        onClose={() => setIsUserModalOpen(false)}
      />

      <EventModal
        isOpen={isEventModalOpen}
        event={selectedEvent}
        onClose={() => setIsEventModalOpen(false)}
      />

      <BookingDetailsModal
        isOpen={isBookingModalOpen}
        booking={selectedBooking}
        onClose={() => setIsBookingModalOpen(false)}
        onUpdateStatus={handleUpdateBookingStatus}
        onDeleteBooking={handleDeleteBooking}
      />
    </div>
  );
};

export default AdminDashboard;
