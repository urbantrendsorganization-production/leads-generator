'use client';

import { useState } from 'react';
import { Building2, User, Mail, Phone, Globe, MapPin, Users, ExternalLink, Copy, Check, Lock, Map } from 'lucide-react';

interface Lead {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  website: string;
  industry: string;
  location: string;
  companySize: string;
  title: string;
  linkedinUrl?: string;
  mapsUrl?: string;
  confidence?: 'high' | 'medium';
}

const LOCATION_FLAGS: Record<string, string> = {
  'nigeria': '\u{1F1F3}\u{1F1EC}',
  'ghana': '\u{1F1EC}\u{1F1ED}',
  'kenya': '\u{1F1F0}\u{1F1EA}',
  'uganda': '\u{1F1FA}\u{1F1EC}',
  'tanzania': '\u{1F1F9}\u{1F1FF}',
  'rwanda': '\u{1F1F7}\u{1F1FC}',
  'south africa': '\u{1F1FF}\u{1F1E6}',
  'senegal': '\u{1F1F8}\u{1F1F3}',
  'egypt': '\u{1F1EA}\u{1F1EC}',
  'morocco': '\u{1F1F2}\u{1F1E6}',
  'tunisia': '\u{1F1F9}\u{1F1F3}',
  'uk': '\u{1F1EC}\u{1F1E7}',
  'ireland': '\u{1F1EE}\u{1F1EA}',
  'germany': '\u{1F1E9}\u{1F1EA}',
  'france': '\u{1F1EB}\u{1F1F7}',
  'netherlands': '\u{1F1F3}\u{1F1F1}',
  'switzerland': '\u{1F1E8}\u{1F1ED}',
  'sweden': '\u{1F1F8}\u{1F1EA}',
  'usa': '\u{1F1FA}\u{1F1F8}',
  'canada': '\u{1F1E8}\u{1F1E6}',
  'brazil': '\u{1F1E7}\u{1F1F7}',
  'mexico': '\u{1F1F2}\u{1F1FD}',
  'colombia': '\u{1F1E8}\u{1F1F4}',
  'argentina': '\u{1F1E6}\u{1F1F7}',
  'uae': '\u{1F1E6}\u{1F1EA}',
  'saudi arabia': '\u{1F1F8}\u{1F1E6}',
  'qatar': '\u{1F1F6}\u{1F1E6}',
  'kuwait': '\u{1F1F0}\u{1F1FC}',
  'singapore': '\u{1F1F8}\u{1F1EC}',
  'india': '\u{1F1EE}\u{1F1F3}',
  'japan': '\u{1F1EF}\u{1F1F5}',
  'south korea': '\u{1F1F0}\u{1F1F7}',
  'hong kong': '\u{1F1ED}\u{1F1F0}',
  'malaysia': '\u{1F1F2}\u{1F1FE}',
  'thailand': '\u{1F1F9}\u{1F1ED}',
  'australia': '\u{1F1E6}\u{1F1FA}',
};

function getFlag(location: string): string {
  const loc = location.toLowerCase();
  for (const [country, flag] of Object.entries(LOCATION_FLAGS)) {
    if (loc.includes(country)) return flag;
  }
  if (loc.includes(', ny') || loc.includes(', ca') || loc.includes(', tx') || loc.includes(', fl') || loc.includes(', il')) {
    return LOCATION_FLAGS['usa'];
  }
  return '\u{1F30D}';
}

// WhatsApp SVG icon
function WhatsAppIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function LeadCard({ lead, isPremium = false }: { lead: Lead; isPremium?: boolean }) {
  const [copied, setCopied] = useState(false);
  const confidence = lead.confidence || 'medium';
  const isVerified = confidence === 'high';

  // Build maps URL: use lead.mapsUrl if present, otherwise generate from company+location
  const mapsUrl = lead.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.companyName + ' ' + lead.location)}`;

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(lead.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may fail in some browsers
    }
  }

  return (
    <div
      className="rounded-xl card-hover-lift"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${isVerified ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.2)'}`,
        borderLeftWidth: '3px',
        borderLeftColor: isVerified ? '#10b981' : '#f59e0b',
      }}
    >
      <div className="p-5">
        <div className="flex flex-col gap-4">

          {/* Top row: Company info + badges + actions */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Building2 className="h-4 w-4 shrink-0" style={{ color: '#FFB800' }} />
                <h3 className="font-semibold text-base text-white">{lead.companyName}</h3>
                {/* Confidence badge */}
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={
                    isVerified
                      ? { background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }
                      : { background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' }
                  }
                >
                  {isVerified ? 'Verified' : 'Generated'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    background: 'rgba(255,184,0,0.12)',
                    border: '1px solid rgba(255,184,0,0.25)',
                    color: '#FFB800',
                  }}
                >
                  {lead.industry}
                </span>
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#8b9cc0',
                  }}
                >
                  <Users className="h-3 w-3" />
                  {lead.companySize}
                </span>
              </div>
            </div>

            {/* Action links */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
              {lead.linkedinUrl && (
                <a
                  href={lead.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors"
                  style={{
                    color: '#60a5fa',
                    background: 'rgba(96,165,250,0.08)',
                    border: '1px solid rgba(96,165,250,0.2)',
                    minHeight: '36px',
                  }}
                  title="View on LinkedIn"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  LinkedIn
                </a>
              )}
              <a
                href={lead.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors hover:opacity-90"
                style={{
                  color: '#FFB800',
                  background: 'rgba(255,184,0,0.08)',
                  border: '1px solid rgba(255,184,0,0.2)',
                  minHeight: '36px',
                }}
              >
                <Globe className="h-3.5 w-3.5" />
                Website
              </a>
              {/* Google Maps link */}
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors hover:opacity-90"
                style={{
                  color: '#34d399',
                  background: 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(16,185,129,0.2)',
                  minHeight: '36px',
                }}
                title="View on Google Maps"
              >
                <Map className="h-3.5 w-3.5" />
                Maps
              </a>
            </div>
          </div>

          {/* Detail grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <User className="h-3.5 w-3.5 shrink-0 text-slate-500" />
              <span>{lead.contactName} &middot; {lead.title}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-500" />
              <span>{getFlag(lead.location)} {lead.location}</span>
            </div>
            <div className="flex items-center gap-2 group">
              <Mail className="h-3.5 w-3.5 shrink-0" style={{ color: '#8b5cf6' }} />
              <a
                href={`mailto:${lead.email}`}
                className="hover:underline truncate"
                style={{ color: '#8b5cf6' }}
              >
                {lead.email}
              </a>
              <button
                onClick={copyEmail}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
                style={{ color: '#8b9cc0' }}
                title="Copy email"
                type="button"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <a
              href={`tel:${lead.phone.replace(/[\s()-]/g, '')}`}
              className="flex items-center gap-2 hover:underline"
              style={{ color: '#06b6d4' }}
            >
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span>{lead.phone}</span>
            </a>
          </div>

          {/* WhatsApp row */}
          <div className="flex items-center gap-2 text-sm">
            <WhatsAppIcon className="h-3.5 w-3.5 shrink-0" style={{ color: '#25d366' }} />
            {isPremium && lead.whatsapp ? (
              <a
                href={`https://wa.me/${lead.whatsapp.replace(/[^0-9+]/g, '').replace('+', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: '#25d366' }}
              >
                {lead.whatsapp}
              </a>
            ) : (
              <div className="flex items-center gap-2">
                <span
                  className="select-none"
                  style={{
                    color: '#555',
                    filter: 'blur(5px)',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                  }}
                  aria-hidden="true"
                >
                  +XXX XXXX XXXX
                </span>
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    background: 'rgba(255,184,0,0.12)',
                    border: '1px solid rgba(255,184,0,0.3)',
                    color: '#FFB800',
                  }}
                  title="Upgrade to unlock WhatsApp contacts"
                >
                  <Lock className="h-2.5 w-2.5" />
                  Premium
                </span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
