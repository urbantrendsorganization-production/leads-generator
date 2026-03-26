'use client';

import { useState } from 'react';
import { Building2, User, Mail, Phone, Globe, MapPin, Users, ExternalLink, Copy, Check } from 'lucide-react';

interface Lead {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  location: string;
  companySize: string;
  title: string;
  linkedinUrl?: string;
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

export function LeadCard({ lead }: { lead: Lead }) {
  const [copied, setCopied] = useState(false);
  const confidence = lead.confidence || 'medium';
  const isVerified = confidence === 'high';

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
      className="rounded-xl transition-all duration-200 hover:shadow-[0_0_24px_rgba(139,92,246,0.12)] hover:-translate-y-0.5"
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
                <Building2 className="h-4 w-4 shrink-0" style={{ color: '#8b5cf6' }} />
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
                    background: 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(6,182,212,0.15))',
                    border: '1px solid rgba(139,92,246,0.3)',
                    color: '#c4b5fd',
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
            <div className="flex items-center gap-3 shrink-0">
              {lead.linkedinUrl && (
                <a
                  href={lead.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-medium transition-colors"
                  style={{ color: '#60a5fa' }}
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
                className="flex items-center gap-1 text-sm font-medium transition-colors hover:underline"
                style={{ color: '#8b5cf6' }}
              >
                <Globe className="h-3.5 w-3.5" />
                Website
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

        </div>
      </div>
    </div>
  );
}
