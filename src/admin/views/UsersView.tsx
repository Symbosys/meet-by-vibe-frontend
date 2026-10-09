import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserPlus, 
  Search, 
  ShieldCheck, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Loader2,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { AdminUser, Role, SkillLevel } from '../types/admin.types';
import { useUsers, useDeleteUser, useToggleUserStatus } from '../../hooks/useUsers';

interface UsersViewProps {
  onAddUser: () => void;
  onEditUser: (user: AdminUser) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  onAddUser,
  onEditUser,
}) => {
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'FEMALE' | 'MALE'>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [skillFilter, setSkillFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // TanStack Query to fetch all users/models from backend
  const { data, isLoading, isError, error, refetch, isFetching } = useUsers({
    search: search || undefined,
    role: roleFilter === 'ALL' ? undefined : (roleFilter as Role),
    gender: genderFilter === 'ALL' ? undefined : (genderFilter as any),
    skillLevel: skillFilter !== 'ALL' ? (skillFilter as SkillLevel) : undefined,
    limit: 100,
  });

  const deleteUserMutation = useDeleteUser();
  const toggleStatusMutation = useToggleUserStatus();

  // Filter users/models dynamically based on search, gender, role and skill
  const users: AdminUser[] = useMemo(() => {
    const raw = data?.users || [];
    return raw.filter((u) => {
      // 1. Role Filter
      if (roleFilter !== 'ALL' && u.role !== roleFilter) {
        return false;
      }

      // 2. Gender Filter: ALL shows both, FEMALE shows only FEMALE, MALE shows only MALE
      if (genderFilter !== 'ALL') {
        const uGender = String(u.gender || '').trim().toUpperCase();
        if (uGender !== genderFilter) {
          return false;
        }
      }

      // 3. Skill Filter
      if (skillFilter !== 'ALL' && u.skillLevel !== skillFilter) {
        return false;
      }

      return true;
    });
  }, [data?.users, roleFilter, genderFilter, skillFilter]);

  // Reset to page 1 whenever filters or page size change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, genderFilter, roleFilter, skillFilter, pageSize]);

  // Calculate pagination
  const totalItems = users.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedUsers = users.slice(startIndex, endIndex);

  const handleDelete = async (user: AdminUser) => {
    if (confirm(`Are you sure you want to delete model/performer "${user.name}"? This action cannot be undone.`)) {
      try {
        await deleteUserMutation.mutateAsync(user.id);
      } catch (err: any) {
        alert(err.message || 'Failed to delete user');
      }
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    try {
      await toggleStatusMutation.mutateAsync({
        id: user.id,
        field: 'isActive',
      });
    } catch (err: any) {
      alert(err.message || 'Failed to toggle user status');
    }
  };

  return (
    <div className="admin-card">
      {/* Header with Filters & Actions */}
      <div className="admin-card-header" style={{ flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2>User & Performer Models ({users.length})</h2>
            {isFetching && <Loader2 size={16} className="spin" color="#f59e0b" />}
          </div>
          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
            Directory of verified Garba dancer models, performers and choreographers with live gender filters.
          </p>
        </div>

        <div className="admin-card-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Refresh Button */}
          <button 
            className="btn-admin-secondary" 
            style={{ padding: '6px 10px' }} 
            onClick={() => refetch()}
            title="Reload from server"
          >
            <RefreshCw size={14} className={isFetching ? 'spin' : ''} />
          </button>

          {/* Search */}
          <div className="admin-search-wrapper">
            <Search size={14} className="admin-search-icon" />
            <input
              type="text"
              className="admin-search-input"
              style={{ width: '150px' }}
              placeholder="Search models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Gender Filter Buttons Group */}
          <div style={{
            display: 'inline-flex',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '2px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            gap: '2px'
          }}>
            <button
              type="button"
              onClick={() => setGenderFilter('ALL')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                background: genderFilter === 'ALL' ? '#f59e0b' : 'transparent',
                color: genderFilter === 'ALL' ? '#000000' : '#94a3b8',
                transition: 'all 0.15s ease'
              }}
              title="Show all male and female models"
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setGenderFilter('FEMALE')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                background: genderFilter === 'FEMALE' ? '#ff1379' : 'transparent',
                color: genderFilter === 'FEMALE' ? '#ffffff' : '#94a3b8',
                transition: 'all 0.15s ease'
              }}
              title="Show only female models"
            >
              💃 Female
            </button>
            <button
              type="button"
              onClick={() => setGenderFilter('MALE')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                background: genderFilter === 'MALE' ? '#0284c7' : 'transparent',
                color: genderFilter === 'MALE' ? '#ffffff' : '#94a3b8',
                transition: 'all 0.15s ease'
              }}
              title="Show only male models"
            >
              🕺 Male
            </button>
          </div>

          {/* Role Filter */}
          <select
            className="admin-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="PERFORMER">Performers Only</option>
            <option value="CUSTOMER">Customers</option>
            <option value="ORGANIZER">Organizers</option>
            <option value="ADMIN">Admins</option>
          </select>

          {/* Skill Filter */}
          <select
            className="admin-select"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
          >
            <option value="ALL">All Skills</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
            <option value="PRO">Pro</option>
            <option value="CHOREOGRAPHER">Choreographer</option>
          </select>

          <button className="btn-admin-primary" onClick={onAddUser}>
            <UserPlus size={15} />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* Error state banner */}
      {isError && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '8px',
          margin: '16px',
          padding: '12px 16px',
          color: '#f87171',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>Error connecting to server: {(error as any)?.message || 'Could not fetch users'}</span>
          </div>
          <button className="btn-admin-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => refetch()}>
            Retry
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '24%' }}>User / Performer</th>
              <th style={{ width: '16%' }}>Role & Skills</th>
              <th style={{ width: '18%' }}>Physical / Location</th>
              <th style={{ width: '16%' }}>Hourly Rate & UPI</th>
              <th style={{ width: '14%' }}>Status & Availability</th>
              <th style={{ width: '12%', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>
                  <Loader2 size={24} className="spin" style={{ margin: '0 auto 8px auto', display: 'block', color: '#f59e0b' }} />
                  <span>Loading user models from database...</span>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No users found matching your filters.
                </td>
              </tr>
            ) : (
              paginatedUsers.map((u) => (
                <tr key={u.id}>
                  {/* User Profile */}
                  <td>
                    <div className="admin-user-cell">
                      <img
                        src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={u.name}
                        className="admin-user-thumb"
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</span>
                          {u.isVerified && <ShieldCheck size={14} color="#10b981" style={{ flexShrink: 0 }} />}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <span>{u.phone}</span>
                          <span>•</span>
                          <span style={{ color: '#cbd5e1' }}>{u.email}</span>
                        </div>
                        {u.instagramHandle && (
                          <div style={{ fontSize: '11px', color: '#ec4899', marginTop: '1px' }}>
                            @{u.instagramHandle}
                          </div>
                        )}
                        {u.photos && u.photos.length > 0 && (
                          <div style={{ fontSize: '10.5px', color: '#38bdf8', marginTop: '2px' }}>
                            📷 {u.photos.length} gallery photos
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Role & Skills */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div>
                        <span className={`status-pill role-${u.role}`}>{u.role}</span>
                      </div>
                      {u.role === 'PERFORMER' && (
                        <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
                          <span style={{ color: '#f59e0b', fontWeight: 600 }}>{u.skillLevel}</span>
                          <div style={{ color: '#94a3b8', fontSize: '10.5px' }}>
                            {u.danceStyles ? u.danceStyles.slice(0, 2).join(', ') : 'Traditional Garba'}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Physical & Location */}
                  <td>
                    <div style={{ fontSize: '12px', lineHeight: 1.35 }}>
                      <div>
                        <strong style={{ color: '#fff' }}>{u.city || 'N/A'}</strong>, {u.state || 'Gujarat'}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>
                        Height: <span style={{ color: '#f59e0b' }}>{u.height ? `${u.height} cm` : 'N/A'}</span> • <span style={{ color: u.gender === 'FEMALE' ? '#ff7eb6' : u.gender === 'MALE' ? '#38bdf8' : '#cbd5e1', fontWeight: 600 }}>{u.gender === 'FEMALE' ? '💃 Female' : u.gender === 'MALE' ? '🕺 Male' : u.gender || 'N/A'}</span>
                      </div>
                      {u.pincode && (
                        <div style={{ color: '#64748b', fontSize: '10px' }}>Pin: {u.pincode}</div>
                      )}
                    </div>
                  </td>

                  {/* Rate & UPI */}
                  <td>
                    {u.role === 'PERFORMER' ? (
                      <div>
                        <div style={{ fontWeight: 700, color: '#10b981', fontSize: '13.5px' }}>
                          ₹{u.hourlyRate || 399}
                        </div>
                        <div style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'monospace' }}>
                          {u.upiId || 'No UPI ID'}
                        </div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                          ⭐ {u.rating || 5.0} ({u.reviewCount || 0} reviews)
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '11.5px' }}>Standard Customer</span>
                    )}
                  </td>

                  {/* Status & Availability */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>
                        <span className={`status-pill ${u.isActive ? 'success' : 'cancelled'}`}>
                          {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                      {u.role === 'PERFORMER' && (
                        <span style={{ fontSize: '11px', color: u.isAvailable ? '#10b981' : '#f87171' }}>
                          {u.isAvailable ? '🟢 Available' : '🔴 Busy / Off'}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button
                        className="btn-admin-secondary"
                        style={{ padding: '5px 7px' }}
                        title="Edit User Model"
                        onClick={() => onEditUser(u)}
                      >
                        <Edit3 size={13} color="#f59e0b" />
                      </button>

                      <button
                        className="btn-admin-secondary"
                        style={{ padding: '5px 7px' }}
                        title="Toggle Active Status"
                        disabled={toggleStatusMutation.isPending}
                        onClick={() => handleToggleStatus(u)}
                      >
                        {u.isActive ? <XCircle size={13} color="#ef4444" /> : <CheckCircle2 size={13} color="#10b981" />}
                      </button>

                      <button
                        className="btn-admin-secondary"
                        style={{ padding: '5px 7px' }}
                        title="Delete User"
                        disabled={deleteUserMutation.isPending}
                        onClick={() => handleDelete(u)}
                      >
                        <Trash2 size={13} color="#ef4444" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && users.length > 0 && (
        <div className="admin-pagination">
          <div className="admin-pagination-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>
              Showing <strong style={{ color: '#fff' }}>{startIndex + 1}</strong> to{' '}
              <strong style={{ color: '#fff' }}>{endIndex}</strong> of{' '}
              <strong style={{ color: '#f59e0b' }}>{totalItems}</strong> models
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <span style={{ color: '#94a3b8' }}>Per page:</span>
              <select
                className="admin-select"
                style={{ padding: '3px 6px', fontSize: '12px' }}
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="admin-pagination-controls">
            <button
              className="admin-page-btn"
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              title="Previous Page"
            >
              <ChevronLeft size={14} />
              <span>Prev</span>
            </button>

            {/* Page number buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                // Show first, last, and pages near current
                if (totalPages <= 7) return true;
                if (page === 1 || page === totalPages) return true;
                return Math.abs(page - safeCurrentPage) <= 1;
              })
              .map((page, idx, arr) => {
                const showEllipsisBefore = idx > 0 && page - arr[idx - 1] > 1;
                return (
                  <React.Fragment key={page}>
                    {showEllipsisBefore && (
                      <span style={{ color: '#64748b', padding: '0 4px', fontSize: '12px' }}>...</span>
                    )}
                    <button
                      className={`admin-page-btn ${page === safeCurrentPage ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              className="admin-page-btn"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              title="Next Page"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

