'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase/client';
import {
  collection, getDocs, updateDoc, deleteDoc, doc,
  query, orderBy,
} from 'firebase/firestore';
import { Mail, MailOpen, Trash2, RefreshCw, Eye, X, Shield } from 'lucide-react';
import useAuthStore from '@/store/authStore';

export default function MessagesPage() {
  const { hasPermission } = useAuthStore();
  const canManage = hasPermission('manageMessages');

  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null); // message being viewed
  const [deleting, setDeleting] = useState(null); // id to confirm delete

  const load = useCallback(async () => {
    if (!canManage) return;
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'messages'), orderBy('createdAt', 'desc')));
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function markRead(id, status) {
    await updateDoc(doc(db, 'messages', id), { status });
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, status } : m));
  }

  async function deleteMessage(id) {
    await deleteDoc(doc(db, 'messages', id));
    setMessages((prev) => prev.filter((m) => m.id !== id));
    setDeleting(null);
    if (selected?.id === id) setSelected(null);
  }

  function formatDate(ts) {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' });
  }

  const unread = messages.filter((m) => m.status === 'unread');
  const read   = messages.filter((m) => m.status !== 'unread');

  if (!canManage) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <Shield size={48} style={{ color: '#e91e8c', marginBottom: 16 }} />
        <h2>Access Restricted</h2>
        <p style={{ color: '#6b7280' }}>You do not have permission to manage inbox messages.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Messages</h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>
            {unread.length} unread · {messages.length} total
          </p>
        </div>
        <button onClick={load} className="btn-outline" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 12 }} />)}
        </div>
      ) : messages.length === 0 ? (
        <div className="card" style={{ padding: '64px 24px', textAlign: 'center', color: '#9ca3af' }}>
          <Mail size={40} style={{ opacity: .3, marginBottom: 12 }} />
          <p>No messages yet. They'll appear here when customers contact you.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 24, alignItems: 'start' }}>

          {/* Messages list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }} className="card" >
            {/* Unread */}
            {unread.length > 0 && (
              <>
                <div style={{ padding: '10px 20px', background: '#fef3f2', borderBottom: '1px solid #fee2e2', fontSize: 11, fontWeight: 700, color: '#dc2626', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Unread ({unread.length})
                </div>
                {unread.map((m) => <MessageRow key={m.id} msg={m} onView={() => { setSelected(m); markRead(m.id, 'read'); }} onDelete={() => setDeleting(m.id)} isSelected={selected?.id === m.id} formatDate={formatDate} />)}
              </>
            )}
            {/* Read */}
            {read.length > 0 && (
              <>
                <div style={{ padding: '10px 20px', background: '#f9fafb', borderBottom: '1px solid #f0f0f0', borderTop: unread.length > 0 ? '1px solid #e5e7eb' : 'none', fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Read ({read.length})
                </div>
                {read.map((m) => <MessageRow key={m.id} msg={m} onView={() => setSelected(m)} onDelete={() => setDeleting(m.id)} isSelected={selected?.id === m.id} formatDate={formatDate} />)}
              </>
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="card" style={{ padding: 28, position: 'sticky', top: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 17 }}>{selected.name}</h3>
                  <a href={`mailto:${selected.email}`} style={{ fontSize: 13, color: '#e91e8c', textDecoration: 'none' }}>{selected.email}</a>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => markRead(selected.id, selected.status === 'unread' ? 'read' : 'unread')}
                    style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: 5 }}
                  >
                    {selected.status === 'unread' ? <><MailOpen size={13} /> Mark Read</> : <><Mail size={13} /> Mark Unread</>}
                  </button>
                  <button
                    onClick={() => setDeleting(selected.id)}
                    style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid #fecaca', background: '#fff5f5', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center' }}
                  >
                    <Trash2 size={13} />
                  </button>
                  <button onClick={() => setSelected(null)} style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}>
                    <X size={13} />
                  </button>
                </div>
              </div>
              <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>{formatDate(selected.createdAt)}</p>
              <div style={{ background: '#f9fafb', borderRadius: 12, padding: 20, fontSize: 14, lineHeight: 1.8, color: '#374151', whiteSpace: 'pre-wrap' }}>
                {selected.message}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleting && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ padding: 28, maxWidth: 360, width: '90%', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fff5f5', border: '1.5px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#dc2626' }}>
              <Trash2 size={24} />
            </div>
            <h3 style={{ margin: '0 0 8px' }}>Delete this message?</h3>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setDeleting(null)} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
              <button onClick={() => deleteMessage(deleting)} style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 9999, padding: 12, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageRow({ msg, onView, onDelete, isSelected, formatDate }) {
  return (
    <div
      onClick={onView}
      style={{
        display: 'flex', alignItems: 'center', padding: '14px 20px',
        borderBottom: '1px solid #f5f5f5',
        cursor: 'pointer',
        background: isSelected ? 'rgba(233,30,140,.04)' : msg.status === 'unread' ? '#fffbfb' : '#fff',
        transition: 'background .15s',
      }}
    >
      <div style={{ marginRight: 12, color: msg.status === 'unread' ? '#e91e8c' : '#9ca3af', flexShrink: 0 }}>
        {msg.status === 'unread' ? <Mail size={16} /> : <MailOpen size={16} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 14, fontWeight: msg.status === 'unread' ? 700 : 500, color: '#1a1a2e' }}>{msg.name}</span>
          {msg.status === 'unread' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e91e8c', flexShrink: 0 }} />}
        </div>
        <p style={{ margin: 0, fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {msg.message}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 12, flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>{formatDate(msg.createdAt)}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{ width: 28, height: 28, borderRadius: 7, border: '1.5px solid #fecaca', background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#dc2626' }}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
