import React, { useEffect, useMemo, useState } from 'react';
import { adminHelpers } from '../../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  plan: string;
  status: string;
  trial_left: string;
  trial_claimed: boolean;
  motion_downloads_used?: number;
}

interface UserStats {
  totalUsers: number;
  joinsToday: number;
}

type DraftState = Record<string, { full_name: string }>;

export const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [drafts, setDrafts] = useState<DraftState>({});

  useEffect(() => {
    void loadData();
  }, []);

  const showStatus = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setStatusMessage({ text, type });
    window.setTimeout(() => setStatusMessage(null), 4200);
  };

  const loadData = async () => {
    setLoading(true);
    const [usersResult, statsResult] = await Promise.all([
      adminHelpers.getAllUsers(),
      adminHelpers.getUserStats(),
    ]);

    if (usersResult.data) {
      setUsers(usersResult.data);
      setDrafts(
        Object.fromEntries(
          usersResult.data.map((user: UserProfile) => [
            user.id,
            { full_name: user.full_name || '' },
          ])
        )
      );
    }
    if (statsResult.data) setStats(statsResult.data);
    setLoading(false);
  };

  const setDraftField = (id: string, field: 'full_name', value: string) => {
    setDrafts((current) => ({
      ...current,
      [id]: {
        full_name: current[id]?.full_name ?? '',
        [field]: value,
      },
    }));
  };

  const handleSaveRow = async (user: UserProfile) => {
    const draft = drafts[user.id];
    if (!draft) return;
    setSavingUserId(user.id);
    const { error } = await adminHelpers.updateUser(user.id, {
      full_name: draft.full_name,
    });
    setSavingUserId(null);

    if (error) {
      showStatus(`Unable to update ${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      return;
    }

    showStatus(`Updated ${user.email}`, 'success');
    await loadData();
  };

  const handleDeleteUser = async (user: UserProfile) => {
    if (!window.confirm(`Delete ${user.email}? This will remove the user, projects, subscriptions, and trial data from Vadeo.`)) {
      return;
    }

    setDeletingUserId(user.id);
    const { error } = await adminHelpers.deleteUser(user.id);
    setDeletingUserId(null);

    if (error) {
      showStatus(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      return;
    }

    showStatus(`Deleted ${user.email}`, 'success');
    await loadData();
  };

  const handleToggleAdmin = async (user: UserProfile) => {
    const { error } = await adminHelpers.toggleAdminStatus(user.id, !user.is_admin);
    if (error) {
      showStatus(`Failed to update admin access: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      return;
    }

    showStatus(user.is_admin ? 'Admin access removed' : 'Admin access granted', 'success');
    await loadData();
  };

  const filteredUsers = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return users;

    return users.filter((user) =>
                      [
                        user.email,
                        user.full_name,
                        user.plan,
                        user.status,
                        user.trial_left,
                        user.is_admin ? 'admin' : '',
                      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [searchQuery, users]);

  const formatDate = (value: string) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
  };

  return (
    <div style={pageStyle}>
      <main style={shellStyle}>
        <header style={landingNavStyle}>
          <a href="/" aria-label="Vadeo Home" style={brandLinkStyle}>
            <img src="/vadeo-logo-white.png" alt="Vadeo" style={{ width: 138, display: 'block' }} />
            <span style={brandAdminStyle}>Admin</span>
          </a>
        </header>

        <section style={contentShellStyle}>
          <header style={topbarStyle}>
            <div style={brandMetaStyle}>
              <strong style={{ fontSize: '18px', fontWeight: 700 }}>{stats?.totalUsers ?? users.length} users</strong>
              {stats && (
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px' }}>
                  {stats.joinsToday} joined today
                </span>
              )}
            </div>

            <div style={toolbarStyle}>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search users by email or name"
                style={searchStyle}
              />
              <button type="button" style={buttonStyle} onClick={() => void loadData()}>
                Refresh
              </button>
              <button type="button" style={buttonStyle} onClick={onLogout}>
                Log Out
              </button>
            </div>
          </header>

          {statusMessage && (
            <div
              style={{
                ...statusStyle,
                borderColor:
                  statusMessage.type === 'error'
                    ? 'rgba(248,113,113,0.28)'
                    : statusMessage.type === 'success'
                      ? 'rgba(74,222,128,0.28)'
                      : 'rgba(96,165,250,0.28)',
                background:
                  statusMessage.type === 'error'
                    ? 'rgba(127,29,29,0.2)'
                    : statusMessage.type === 'success'
                      ? 'rgba(20,83,45,0.2)'
                      : 'rgba(30,58,138,0.2)',
              }}
            >
              {statusMessage.text}
            </div>
          )}

          <section style={panelStyle}>
            <div style={tableWrapStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={headerCellStyle}>Email</th>
                    <th style={headerCellStyle}>Name</th>
                    <th style={headerCellStyle}>Trial Left</th>
                    <th style={headerCellStyle}>Trial Claimed</th>
                    <th style={headerCellStyle}>Motion Trial Downloads</th>
                    <th style={headerCellStyle}>Plan</th>
                    <th style={headerCellStyle}>Status</th>
                    <th style={headerCellStyle}>Created</th>
                    <th style={headerCellStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} style={emptyCellStyle}>Loading users…</td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={emptyCellStyle}>No matching users found.</td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const draft = drafts[user.id] || { full_name: user.full_name || '' };
                      return (
                        <tr key={user.id} style={rowStyle}>
                          <td style={cellStyle}>{user.email}</td>
                          <td style={cellStyle}>
                            <input
                              type="text"
                              value={draft.full_name}
                              onChange={(event) => setDraftField(user.id, 'full_name', event.target.value)}
                              style={tableInputStyle}
                              placeholder="Full name"
                            />
                            {user.is_admin && <span style={statusPillStyle}>Admin</span>}
                          </td>
                          <td style={cellStyle}>{user.trial_left}</td>
                          <td style={cellStyle}>{user.trial_claimed ? 'Yes' : 'No'}</td>
                          <td style={cellStyle}>{user.motion_downloads_used ?? 0}</td>
                          <td style={cellStyle}>
                            <span style={statusPillStyle}>{formatPlan(user.plan)}</span>
                          </td>
                          <td style={cellStyle}>
                            <span style={statusPillStyle}>{formatStatus(user.status)}</span>
                          </td>
                          <td style={cellStyle}>{formatDate(user.created_at)}</td>
                          <td style={cellStyle}>
                            <div style={actionsStyle}>
                              <button
                                type="button"
                                style={linkButtonStyle}
                                onClick={() => void handleSaveRow(user)}
                                disabled={savingUserId === user.id}
                              >
                                {savingUserId === user.id ? 'Saving…' : 'Save'}
                              </button>
                              <button type="button" style={linkButtonStyle} onClick={() => void handleToggleAdmin(user)}>
                                {user.is_admin ? 'Remove admin' : 'Make admin'}
                              </button>
                              <button
                                type="button"
                                style={{ ...linkButtonStyle, color: '#fca5a5' }}
                                onClick={() => void handleDeleteUser(user)}
                                disabled={user.is_admin || deletingUserId === user.id}
                              >
                                {deletingUserId === user.id ? 'Deleting…' : 'Delete'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
};

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  color: '#fff',
  background:
    'radial-gradient(circle at top left, rgba(255, 255, 255, 0.08), transparent 28%), linear-gradient(180deg, #090909 0%, #020202 100%)',
  fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const shellStyle: React.CSSProperties = {
  width: 'min(1320px, calc(100vw - 40px))',
  margin: '0 auto',
  padding: '32px 0 56px',
};

const landingNavStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: 72,
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  marginBottom: 28,
};

const contentShellStyle: React.CSSProperties = {
  paddingTop: 8,
};

const brandLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 14,
  color: '#fff',
  textDecoration: 'none',
};

const brandAdminStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.68)',
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
};

const topbarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  paddingBottom: 28,
  flexWrap: 'wrap',
};

const brandMetaStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const toolbarStyle: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  alignItems: 'center',
  flexWrap: 'wrap',
};

const searchStyle: React.CSSProperties = {
  width: 'min(320px, 100%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 14,
  padding: '12px 14px',
  background: 'rgba(255, 255, 255, 0.04)',
  color: '#fff',
  outline: 'none',
};

const buttonStyle: React.CSSProperties = {
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 14,
  padding: '12px 16px',
  background: 'transparent',
  color: '#fff',
  cursor: 'pointer',
};

const statusStyle: React.CSSProperties = {
  marginBottom: 18,
  borderRadius: 14,
  padding: '12px 14px',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff',
};

const panelStyle: React.CSSProperties = {
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 24,
  overflow: 'hidden',
  background: 'rgba(0, 0, 0, 0.5)',
};

const tableWrapStyle: React.CSSProperties = {
  overflowX: 'auto',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  minWidth: 1160,
};

const rowStyle: React.CSSProperties = {
  borderBottom: '1px solid rgba(255,255,255,0.05)',
};

const headerCellStyle: React.CSSProperties = {
  padding: '14px 16px',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
  textAlign: 'left',
  verticalAlign: 'middle',
  fontSize: 12,
  color: 'rgba(255,255,255,0.55)',
  fontWeight: 600,
};

const cellStyle: React.CSSProperties = {
  padding: '14px 16px',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
  textAlign: 'left',
  verticalAlign: 'middle',
  fontSize: 13,
  color: 'rgba(255,255,255,0.84)',
};

const emptyCellStyle: React.CSSProperties = {
  padding: '48px 20px',
  textAlign: 'center',
  color: 'rgba(255,255,255,0.28)',
};

const tableInputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  padding: '8px 10px',
  background: 'rgba(255,255,255,0.04)',
  color: '#fff',
  outline: 'none',
};

const statusPillStyle: React.CSSProperties = {
  display: 'inline-flex',
  marginTop: 8,
  padding: '6px 10px',
  borderRadius: 999,
  background: 'rgba(255,255,255,0.08)',
  fontSize: 12,
  color: 'rgba(255,255,255,0.84)',
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap',
};

const linkButtonStyle: React.CSSProperties = {
  padding: 0,
  border: 0,
  background: 'transparent',
  color: 'rgba(255,255,255,0.75)',
  cursor: 'pointer',
};

const formatPlan = (plan: string) => {
  if (!plan || plan === 'none') return 'None';
  return plan.charAt(0).toUpperCase() + plan.slice(1);
};

const formatStatus = (status: string) => {
  if (!status) return 'Inactive';
  return status.charAt(0).toUpperCase() + status.slice(1);
};
