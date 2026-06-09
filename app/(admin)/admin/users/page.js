'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, orderBy, query, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import useAuthStore from '@/store/authStore';
import { Shield, Plus, Pencil, Trash2, X, Check, AlertTriangle } from 'lucide-react';

const ROLES = ['admin', 'staff'];
const ALL_PERMISSIONS = [
  { key: 'manageProducts',   label: 'Manage Products'   },
  { key: 'manageOrders',     label: 'Manage Orders'     },
  { key: 'manageCustomers',  label: 'Manage Customers'  },
  { key: 'manageCategories', label: 'Manage Categories' },
  { key: 'viewReports',      label: 'View Reports'      },
  { key: 'manageMarketing',  label: 'Manage Marketing'  },
  { key: 'manageSettings',   label: 'Manage Settings'   },
  { key: 'manageUsers',      label: 'Manage Users'      },
];

export default function UsersPage() {
  const { role: myRole, adminUser } = useAuthStore();
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null); // 'create' | { user }
  const [editPerms,setEditPerms]= useState(null); // { user }
  const [confirm,  setConfirm]  = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  // New user form
  const [newUser, setNewUser] = useState({ email:'', password:'', displayName:'', role:'staff' });

  async function load() {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  if (myRole !== 'superadmin') {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <Shield size={48} style={{ color: '#e91e8c', marginBottom: 16 }} />
        <h2>Access Restricted</h2>
        <p style={{ color: '#6b7280' }}>Only the Super Admin can manage user accounts.</p>
      </div>
    );
  }

  async function createUser() {
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setModal(null);
      setNewUser({ email:'', password:'', displayName:'', role:'staff' });
      load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function savePermissions(user, perms) {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.id), { permissions: perms, updatedAt: new Date() });
      // Also update role via API (custom claim)
      await fetch('/api/admin/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUid: user.id, role: user.role }),
      });
      setEditPerms(null);
      load();
    } finally { setSaving(false); }
  }

  async function deleteUser(user) {
    if (user.isPermanent) return;
    await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUid: user.id }),
    });
    setConfirm(null);
    load();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>User Management</h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>Manage admin accounts and permissions</p>
        </div>
        <button onClick={() => setModal('create')} className="btn-primary" style={{ padding: '10px 20px' }}>
          <Plus size={16} /> Add Admin User
        </button>
      </div>

      {/* Users table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                {['Name', 'Email', 'Role', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isMe        = user.id === adminUser?.id;
                const isPermanent = user.isPermanent;
                return (
                  <tr key={user.id} style={{ borderTop: '1px solid #f5f5f5' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#e91e8c,#9c27b0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {user.displayName?.[0]?.toUpperCase() ?? 'A'}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{user.displayName} {isMe && <span style={{ fontSize: 11, color: '#9ca3af' }}>(you)</span>}</p>
                          {isPermanent && <span style={{ fontSize: 11, color: '#e91e8c', fontWeight: 600 }}>🔒 Permanent</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#6b7280' }}>{user.email}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 9999,
                        background: user.role === 'superadmin' ? 'rgba(233,30,140,.12)' : user.role === 'admin' ? 'rgba(156,39,176,.12)' : '#f5f5f5',
                        color:      user.role === 'superadmin' ? '#e91e8c' : user.role === 'admin' ? '#9c27b0' : '#374151',
                      }}>
                        {user.role === 'superadmin' ? '👑 SuperAdmin' : user.role === 'admin' ? 'Admin' : 'Staff'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge badge-${isPermanent ? 'purple' : 'green'}`} style={{ fontSize: 11 }}>
                        {isPermanent ? '🔒 Permanent' : 'Standard'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {!isMe && user.role !== 'superadmin' && (
                          <button onClick={() => setEditPerms({ ...user })}
                            style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', background: '#fff', cursor: 'pointer' }}
                            title="Edit Permissions">
                            <Pencil size={14} />
                          </button>
                        )}
                        {!isPermanent && !isMe && (
                          <button onClick={() => setConfirm(user)}
                            style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', background: '#fff5f5', cursor: 'pointer' }}
                            title="Delete User">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {modal === 'create' && (
        <Modal title="Add Admin User" onClose={() => setModal(null)}>
          {error && <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <InputField label="Display Name" value={newUser.displayName} onChange={(v) => setNewUser((u) => ({ ...u, displayName: v }))} placeholder="John Admin" />
            <InputField label="Email" type="email" value={newUser.email} onChange={(v) => setNewUser((u) => ({ ...u, email: v }))} placeholder="admin@cutethings.lk" />
            <InputField label="Password" type="password" value={newUser.password} onChange={(v) => setNewUser((u) => ({ ...u, password: v }))} placeholder="min 6 characters" />
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Role</label>
              <select value={newUser.role} onChange={(e) => setNewUser((u) => ({ ...u, role: e.target.value }))} className="input" style={{ width: '100%' }}>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button onClick={() => setModal(null)} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
            <button onClick={createUser} disabled={saving} className="btn-primary" style={{ flex: 1, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Permissions Modal */}
      {editPerms && (
        <Modal title={`Permissions — ${editPerms.displayName}`} onClose={() => setEditPerms(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {ALL_PERMISSIONS.map(({ key, label }) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox"
                  checked={!!editPerms.permissions?.[key]}
                  onChange={(e) => setEditPerms((u) => ({ ...u, permissions: { ...u.permissions, [key]: e.target.checked } }))}
                  style={{ width: 16, height: 16, accentColor: '#e91e8c' }}
                />
                {label}
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setEditPerms(null)} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
            <button onClick={() => savePermissions(editPerms, editPerms.permissions)} disabled={saving} className="btn-primary" style={{ flex: 1, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : 'Save Permissions'}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {confirm && (
        <Modal title="Delete User?" onClose={() => setConfirm(null)}>
          <p style={{ color: '#6b7280', marginBottom: 20 }}>Delete <strong>{confirm.displayName}</strong>? This cannot be undone.</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setConfirm(null)} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
            <button onClick={() => deleteUser(confirm)}
              style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 9999, padding: 12, fontWeight: 600, cursor: 'pointer' }}>
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
      <div className="card" style={{ width: '100%', maxWidth: 440, padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input" />
    </div>
  );
}
