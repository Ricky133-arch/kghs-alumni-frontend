import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ─── Cloudinary avatar ────────────────────────────────────────────────────────
const avatarUrl = (url) => {
  if (!url || !url.includes('/upload/')) return url;
  return url.replace('/upload/', '/upload/w_120,h_120,c_fill,g_face,q_auto,f_auto/');
};

// ─── Initials avatar fallback ─────────────────────────────────────────────────
const Avatar = ({ src, name, size = 56 }) => {
  const [status, setStatus] = useState(src ? 'loading' : 'fallback');
  const initials = name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      border: '2.5px solid rgba(255,192,203,0.5)',
      background: 'linear-gradient(135deg,rgba(255,192,203,0.3),rgba(255,150,180,0.2))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', transform: 'translateZ(0)',
    }}>
      {(!src || status === 'fallback') ? (
        <span style={{ fontSize: size * 0.36, fontWeight: 700, color: 'rgba(180,60,100,0.75)' }}>{initials}</span>
      ) : (
        <>
          {status === 'loading' && (
            <span style={{ position: 'absolute', fontSize: size * 0.36, fontWeight: 700, color: 'rgba(180,60,100,0.35)' }}>{initials}</span>
          )}
          <img src={avatarUrl(src)} alt={name} loading="lazy" decoding="async"
            onLoad={() => setStatus('loaded')} onError={() => setStatus('fallback')}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: status === 'loaded' ? 1 : 0, transition: 'opacity 0.3s' }} />
        </>
      )}
    </div>
  );
};

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ emoji, label, value, highlight }) => (
  <div style={{
    background: highlight ? 'linear-gradient(135deg,rgba(255,192,203,0.3),rgba(255,150,180,0.15))' : '#fff',
    border: '1px solid rgba(255,192,203,0.35)', borderRadius: 20,
    padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16,
    boxShadow: '0 2px 16px rgba(255,150,180,0.07)',
  }}>
    <span style={{ fontSize: '1.8rem' }}>{emoji}</span>
    <div>
      <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'rgba(180,60,100,0.9)', lineHeight: 1 }}>{value}</p>
      <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: 'rgba(100,40,60,0.55)', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</p>
    </div>
  </div>
);

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ title, count, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}
    style={{ background: '#fff', borderRadius: 24, border: '1px solid rgba(255,192,203,0.3)', boxShadow: '0 4px 24px rgba(255,150,180,0.08)', overflow: 'hidden', marginBottom: 24 }}
  >
    <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,192,203,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
      <h2 className="text-primary" style={{ margin: 0, fontSize: 'clamp(1.1rem,3vw,1.4rem)', fontWeight: 700 }}>{title}</h2>
      {count !== undefined && (
        <span style={{ background: 'rgba(255,192,203,0.25)', color: 'rgba(180,60,100,0.8)', borderRadius: 999, padding: '3px 14px', fontSize: '0.8rem', fontWeight: 700 }}>
          {count}
        </span>
      )}
    </div>
    <div style={{ padding: '20px 24px 24px' }}>{children}</div>
  </motion.div>
);

// ─── Main AdminDashboard ──────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [toast, setToast] = useState(null);
  const [memberSearch, setMemberSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (role !== 'admin') return navigate('/');
    setLoading(true);
    Promise.all([
      axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${import.meta.env.VITE_API_URL}/api/donations`, { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(([uRes, dRes]) => { setUsers(uRes.data); setDonations(dRes.data); setLoading(false); })
      .catch(() => { showToast('Failed to load data', 'error'); setLoading(false); });
  }, [navigate]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const handleApprove = async (id) => {
    setActionLoading(s => ({ ...s, [id + '_approve']: true }));
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}`, { isApproved: true }, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(u => u.map(x => x._id === id ? { ...x, isApproved: true } : x));
      showToast('Sister welcomed into the family! ');
    } catch { showToast('Approval failed. Try again.', 'error'); }
    setActionLoading(s => ({ ...s, [id + '_approve']: false }));
  };

  const handleToggleRole = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'alumni' : 'admin';
    setActionLoading(s => ({ ...s, [id + '_role']: true }));
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}`, { role: newRole }, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(u => u.map(x => x._id === id ? { ...x, role: newRole } : x));
      showToast(`Role updated to ${newRole}`);
    } catch { showToast('Role update failed. Try again.', 'error'); }
    setActionLoading(s => ({ ...s, [id + '_role']: false }));
  };

  const pendingUsers = users.filter(u => !u.isApproved);
  const approvedUsers = users.filter(u => u.isApproved);
  const totalDonations = donations.reduce((sum, d) => sum + (d.amount || 0), 0);

  const filteredApproved = approvedUsers.filter(u =>
    !memberSearch ||
    u.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(memberSearch.toLowerCase()) ||
    String(u.graduationYear).includes(memberSearch)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/10 flex items-center justify-center">
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '4px solid rgba(255,192,203,0.3)', borderTopColor: 'var(--color-primary,#ff69b4)', borderRadius: '50%', animation: 'adm-spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p className="text-primary" style={{ fontSize: '1.1rem', fontWeight: 500 }}>Loading dashboard…</p>
        </div>
        <style>{`@keyframes adm-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes adm-spin { to { transform: rotate(360deg); } }
        @keyframes adm-fadein { from { opacity:0; transform: translateY(-8px); } to { opacity:1; transform: translateY(0); } }
        .adm-tr:hover { background: rgba(255,192,203,0.06); }
        .adm-input {
          width: 100%; padding: 11px 14px 11px 40px;
          border-radius: 12px; border: 2px solid rgba(255,192,203,0.35);
          background: rgba(255,255,255,0.9); font-size: 0.9rem;
          color: rgba(40,20,30,0.85); outline: none;
          transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box;
        }
        .adm-input:focus { border-color: var(--color-primary,#ff69b4); box-shadow: 0 0 0 3px rgba(255,192,203,0.2); }
        .adm-input::placeholder { color: rgba(180,100,130,0.4); }
      `}</style>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            style={{
              position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
              zIndex: 9999, padding: '12px 24px', borderRadius: 999,
              background: toast.type === 'error' ? 'rgba(220,50,80,0.9)' : 'rgba(180,60,100,0.9)',
              color: '#fff', fontWeight: 600, fontSize: '0.9rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)', whiteSpace: 'nowrap',
            }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/10"
        style={{ padding: 'clamp(24px,4vw,48px) clamp(14px,3vw,24px) 60px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ marginBottom: 28 }}>
            <h1 className="text-primary" style={{ fontSize: 'clamp(1.9rem,5vw,3rem)', fontWeight: 800, margin: '0 0 6px', lineHeight: 1.1 }}>
              Admin Dashboard
            </h1>
            <p className="text-textDark/60" style={{ fontSize: 'clamp(0.9rem,2vw,1.05rem)', margin: 0, fontWeight: 300 }}>
              Guardian of our sisterhood — approve, manage, and nurture our growing family.
            </p>
          </motion.div>

          {/* Stat cards */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 28 }}>
            <StatCard emoji="" label="Pending" value={pendingUsers.length} highlight={pendingUsers.length > 0} />
            <StatCard emoji="" label="Approved" value={approvedUsers.length} />
            <StatCard emoji="" label="Donations" value={donations.length} />
            <StatCard emoji="" label="Total raised" value={`₦${totalDonations.toLocaleString()}`} />
          </motion.div>

          {/* ── Pending approvals ── */}
          <Section title="Pending Membership Requests" count={pendingUsers.length} delay={0.15}>
            {pendingUsers.length === 0 ? (
              <p className="text-textDark/50" style={{ margin: 0, textAlign: 'center', padding: '20px 0', fontSize: '1rem' }}>
                All caught up — no new requests waiting. 
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
                {pendingUsers.map((user) => (
                  <motion.div key={user._id} whileHover={{ y: -4 }}
                    style={{ background: 'rgba(255,192,203,0.07)', border: '1px solid rgba(255,192,203,0.3)', borderRadius: 18, padding: '18px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
                    <Avatar src={user.profilePic} name={user.name} size={64} />
                    <div>
                      <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '1rem', color: 'rgba(40,20,30,0.9)' }}>{user.name || 'New Sister'}</p>
                      <p className="text-primary" style={{ margin: '0 0 2px', fontSize: '0.85rem', fontWeight: 600 }}>Class of {user.graduationYear}</p>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(100,50,70,0.55)' }}>{user.email}</p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleApprove(user._id)}
                      disabled={actionLoading[user._id + '_approve']}
                      className="bg-primary text-white"
                      style={{ marginTop: 4, padding: '9px 24px', borderRadius: 999, border: 'none', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', opacity: actionLoading[user._id + '_approve'] ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      {actionLoading[user._id + '_approve']
                        ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'adm-spin 0.8s linear infinite', display: 'inline-block' }} />
                        : null}
                      Welcome Her In 
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}
          </Section>

          {/* ── Donations ── */}
          <Section title="Generous Hearts" count={`${donations.length} donations`} delay={0.25}>
            {donations.length === 0 ? (
              <p className="text-textDark/50" style={{ margin: 0, textAlign: 'center', padding: '20px 0', fontSize: '1rem' }}>
                No donations yet. When sisters give, their kindness will shine here.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {donations.map((d) => (
                  <div key={d._id}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, padding: '12px 16px', borderRadius: 14, background: 'rgba(255,192,203,0.07)', border: '1px solid rgba(255,192,203,0.2)' }}>
                    <div>
                      <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '1.05rem', color: 'rgba(40,20,30,0.9)' }}>
                        ₦{d.amount?.toLocaleString() || '—'}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(100,50,70,0.6)' }}>
                        From <strong>{d.donor?.name || 'Anonymous Sister'}</strong>
                      </p>
                    </div>
                    <p className="text-primary" style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600 }}>
                      {new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                ))}
                {/* Total */}
                <div style={{ marginTop: 4, padding: '12px 16px', borderRadius: 14, background: 'linear-gradient(135deg,rgba(255,192,203,0.2),rgba(255,150,180,0.1))', border: '1px solid rgba(255,192,203,0.35)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: 'rgba(100,40,60,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total raised</p>
                  <p className="text-primary" style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem' }}>₦{totalDonations.toLocaleString()}</p>
                </div>
              </div>
            )}
          </Section>

          {/* ── All members ── */}
          <Section title="Approved Sisters" count={approvedUsers.length} delay={0.35}>
            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 18, maxWidth: 340 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', pointerEvents: 'none' }}>🔍</span>
              <input type="text" placeholder="Search name, email or year…" value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)} className="adm-input" />
            </div>

            {/* Table — scrollable on mobile */}
            <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid rgba(255,192,203,0.2)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(255,192,203,0.25)', background: 'rgba(255,192,203,0.06)' }}>
                    {['Member', 'Email', 'Year', 'Role', 'Action'].map(h => (
                      <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: 'rgba(100,40,60,0.65)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredApproved.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'rgba(100,50,70,0.45)', fontSize: '0.9rem' }}>No members match your search.</td></tr>
                  ) : filteredApproved.map((user) => (
                    <tr key={user._id} className="adm-tr" style={{ borderBottom: '1px solid rgba(255,192,203,0.15)' }}>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar src={user.profilePic} name={user.name} size={36} />
                          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'rgba(40,20,30,0.85)', whiteSpace: 'nowrap' }}>
                            {user.name || '—'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '0.85rem', color: 'rgba(100,50,70,0.6)', maxWidth: 180 }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '0.88rem', fontWeight: 600, color: 'rgba(40,20,30,0.7)', whiteSpace: 'nowrap' }}>
                        {user.graduationYear || '—'}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          padding: '3px 12px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700,
                          background: user.role === 'admin' ? 'rgba(255,192,203,0.3)' : 'rgba(200,200,200,0.2)',
                          color: user.role === 'admin' ? 'rgba(180,60,100,0.9)' : 'rgba(80,60,70,0.6)',
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleToggleRole(user._id, user.role)}
                          disabled={actionLoading[user._id + '_role']}
                          style={{
                            padding: '6px 14px', borderRadius: 999, border: '1.5px solid rgba(255,192,203,0.5)',
                            background: 'transparent', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                            color: 'rgba(180,60,100,0.85)', whiteSpace: 'nowrap',
                            opacity: actionLoading[user._id + '_role'] ? 0.6 : 1,
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                          }}
                        >
                          {actionLoading[user._id + '_role'] && (
                            <span style={{ width: 12, height: 12, border: '2px solid rgba(180,60,100,0.3)', borderTopColor: 'rgba(180,60,100,0.9)', borderRadius: '50%', animation: 'adm-spin 0.8s linear infinite', display: 'inline-block' }} />
                          )}
                          {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                        </motion.button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
