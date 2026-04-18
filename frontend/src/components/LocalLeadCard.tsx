'use client';

import { useState } from 'react';
import {
  MapPin, Phone, Globe, Star, ExternalLink, Copy, Check,
  AlertTriangle, TrendingUp, Minus,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Send, Loader2, X } from 'lucide-react';

export interface LocalLead {
  placeId: string;
  businessName: string;
  category: string;
  address: string;
  phone: string;
  website: string | null;
  rating: number | null;
  reviewCount: number | null;
  googleMapsUrl: string;
  instagramSearchUrl: string;
  facebookSearchUrl: string;
  googleSearchUrl: string;
  hasWebsite: boolean;
  websiteType: 'none' | 'social' | 'proper';
  opportunity: 'high' | 'medium' | 'low';
  opportunityReason: string;
}

// ─── WhatsApp outreach modal (reused from LocalLeadCard) ─────────────────────
function WhatsAppModal({
  phone,
  businessName,
  onClose,
}: {
  phone: string;
  businessName: string;
  onClose: () => void;
}) {
  const [message, setMessage] = useState(
    `Hi! I came across ${businessName} and noticed you might benefit from a stronger online presence. I'd love to share some ideas — would you be open to a quick chat?`
  );
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    setError('');
    try {
      await api.leads.sendWhatsApp({ to: phone, message: message.trim() });
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 space-y-4"
        style={{ background: '#111', border: '1px solid rgba(37,211,102,0.3)' }}
      >
        <div className="flex items-center justify-between">
          <span className="font-semibold text-white">WhatsApp Outreach</span>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/10" style={{ color: '#8b9cc0' }}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs" style={{ color: '#8b9cc0' }}>
          To: <span className="text-white font-mono">{phone}</span>
        </p>
        {sent ? (
          <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <Check className="h-5 w-5 text-emerald-400" />
            <p className="text-sm text-emerald-300">Sent!</p>
          </div>
        ) : (
          <>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full rounded-xl px-3 py-2 text-sm text-white resize-none outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            {error && <p className="text-xs" style={{ color: '#f87171' }}>{error}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="flex-1 rounded-xl py-2.5 text-sm font-semibold hover:bg-white/5" style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#8b9cc0' }}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !message.trim()}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: '#25d366', color: '#000' }}
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Opportunity badge ────────────────────────────────────────────────────────
function OpportunityBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const config = {
    high: { label: 'High Opportunity', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', Icon: TrendingUp },
    medium: { label: 'Medium Opportunity', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', Icon: AlertTriangle },
    low: { label: 'Low Opportunity', color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.2)', Icon: Minus },
  }[level];

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
      style={{ background: config.bg, border: `1px solid ${config.border}`, color: config.color }}
    >
      <config.Icon className="h-2.5 w-2.5" />
      {config.label}
    </span>
  );
}

// ─── Instagram SVG icon ────────────────────────────────────────────────────────
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

// ─── Facebook SVG icon ───────────────────────────────────────────────────────
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

// ─── WhatsApp SVG icon ────────────────────────────────────────────────────────
function WhatsAppIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── Main card ────────────────────────────────────────────────────────────────
export function LocalLeadCard({ lead }: { lead: LocalLead }) {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [showWAModal, setShowWAModal] = useState(false);

  const borderColor =
    lead.opportunity === 'high'
      ? 'rgba(16,185,129,0.35)'
      : lead.opportunity === 'medium'
      ? 'rgba(245,158,11,0.3)'
      : 'rgba(255,255,255,0.07)';
  const leftBorderColor =
    lead.opportunity === 'high' ? '#10b981' : lead.opportunity === 'medium' ? '#f59e0b' : '#334155';

  async function copyPhone() {
    try {
      await navigator.clipboard.writeText(lead.phone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } catch {}
  }

  return (
    <>
      {showWAModal && lead.phone && (
        <WhatsAppModal
          phone={lead.phone}
          businessName={lead.businessName}
          onClose={() => setShowWAModal(false)}
        />
      )}
      <div
        className="rounded-xl"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${borderColor}`,
          borderLeftWidth: '3px',
          borderLeftColor: leftBorderColor,
        }}
      >
        <div className="p-5 space-y-4">

          {/* Top: name + badges + links */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-base text-white">{lead.businessName}</h3>
                <OpportunityBadge level={lead.opportunity} />
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span
                  className="rounded-full px-2.5 py-0.5 font-medium"
                  style={{ background: 'rgba(255,184,0,0.12)', border: '1px solid rgba(255,184,0,0.25)', color: '#FFB800' }}
                >
                  {lead.category}
                </span>
                {lead.rating !== null && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}
                  >
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {lead.rating.toFixed(1)}
                    {lead.reviewCount !== null && (
                      <span className="text-slate-500">({lead.reviewCount.toLocaleString()})</span>
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* Action links */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
              <a
                href={lead.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold hover:opacity-80 transition-opacity"
                style={{ color: '#34d399', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', minHeight: '36px' }}
                title="Open in Google Maps"
              >
                <MapPin className="h-3.5 w-3.5" />
                Maps
              </a>
              <a
                href={lead.instagramSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold hover:opacity-80 transition-opacity"
                style={{ color: '#e1306c', background: 'rgba(225,48,108,0.08)', border: '1px solid rgba(225,48,108,0.2)', minHeight: '36px' }}
                title="Search on Instagram"
              >
                <InstagramIcon className="h-3.5 w-3.5" />
                Instagram
              </a>
              <a
                href={lead.facebookSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold hover:opacity-80 transition-opacity"
                style={{ color: '#1877f2', background: 'rgba(24,119,242,0.08)', border: '1px solid rgba(24,119,242,0.2)', minHeight: '36px' }}
                title="Search on Facebook"
              >
                <FacebookIcon className="h-3.5 w-3.5" />
                Facebook
              </a>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {lead.address && (
              <div className="flex items-start gap-2" style={{ color: '#94a3b8' }}>
                <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: '#64748b' }} />
                <span className="leading-tight">{lead.address}</span>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-2 group">
                <Phone className="h-3.5 w-3.5 shrink-0" style={{ color: '#06b6d4' }} />
                <a href={`tel:${lead.phone.replace(/\s/g, '')}`} className="hover:underline" style={{ color: '#06b6d4' }}>
                  {lead.phone}
                </a>
                <button
                  onClick={copyPhone}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
                  style={{ color: '#64748b' }}
                  type="button"
                  title="Copy phone"
                >
                  {copiedPhone ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Website row */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Globe className="h-3.5 w-3.5 shrink-0" style={{ color: lead.hasWebsite ? '#8b5cf6' : '#ef4444' }} />
            {lead.website ? (
              <a
                href={lead.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline truncate max-w-xs"
                style={{ color: lead.websiteType === 'social' ? '#f59e0b' : '#8b5cf6' }}
              >
                {lead.website}
              </a>
            ) : (
              <span className="font-semibold" style={{ color: '#ef4444' }}>No website</span>
            )}
            {lead.websiteType === 'social' && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}
              >
                Social only
              </span>
            )}
          </div>

          {/* Opportunity reason + WhatsApp CTA */}
          <div
            className="rounded-lg px-3 py-2 flex items-center justify-between gap-3"
            style={{
              background:
                lead.opportunity === 'high'
                  ? 'rgba(16,185,129,0.06)'
                  : lead.opportunity === 'medium'
                  ? 'rgba(245,158,11,0.06)'
                  : 'rgba(255,255,255,0.02)',
              border: `1px solid ${
                lead.opportunity === 'high'
                  ? 'rgba(16,185,129,0.15)'
                  : lead.opportunity === 'medium'
                  ? 'rgba(245,158,11,0.15)'
                  : 'rgba(255,255,255,0.05)'
              }`,
            }}
          >
            <p
              className="text-xs leading-tight"
              style={{
                color:
                  lead.opportunity === 'high'
                    ? '#34d399'
                    : lead.opportunity === 'medium'
                    ? '#fbbf24'
                    : '#64748b',
              }}
            >
              {lead.opportunityReason}
            </p>
            {lead.phone && (
              <button
                type="button"
                onClick={() => setShowWAModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shrink-0 hover:opacity-80 transition-opacity"
                style={{ background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.3)', color: '#25d366' }}
                title="Send WhatsApp outreach"
              >
                <WhatsAppIcon className="h-3 w-3" />
                Reach Out
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
