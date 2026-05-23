'use client';

import { useState, useEffect } from 'react';
import { X, Mail, Send, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

interface EmailComposerProps {
  lead: {
    email: string;
    contactName: string;
    companyName: string;
  };
  onClose: () => void;
}

const TEMPLATES = [
  {
    label: 'Cold Intro',
    subject: 'Quick question for {first_name} at {company}',
    body: `Hi {first_name},

I came across {company} and was genuinely impressed by what you're building.

I'm reaching out because we help companies like yours find verified decision-maker contacts — saving 10+ hours per week on prospecting.

Teams using our platform typically book 2x more meetings in their first month.

Would you be open to a 15-minute call this week?

Best regards,`,
  },
  {
    label: 'Meeting Request',
    subject: 'Meeting request — {first_name} / {company}',
    body: `Hi {first_name},

I'd love to schedule a brief call to explore how we might help {company} accelerate pipeline.

We work with companies similar to yours and have helped them book more qualified meetings while spending less time on prospecting.

Are you available for 20 minutes this week or next?

Here's my calendar: [add your calendar link]

Looking forward to connecting.

Best regards,`,
  },
  {
    label: 'Follow-up',
    subject: 'Following up — {first_name}',
    body: `Hi {first_name},

Just circling back on my previous note. I know growing {company} keeps you busy — I'll keep this short.

Our platform delivers verified contacts with 98% accuracy. Teams typically see 60% less time spent building pipeline.

Worth a quick 10-minute look?

Best regards,`,
  },
];

function renderMergeFields(text: string, preview: boolean, firstName: string, company: string): React.ReactNode {
  if (preview) {
    return text.replace(/\{first_name\}/gi, firstName).replace(/\{company\}/gi, company);
  }
  const parts = text.split(/(\{first_name\}|\{company\})/gi);
  return parts.map((part, i) => {
    const lower = part.toLowerCase();
    if (lower === '{first_name}' || lower === '{company}') {
      return (
        <mark key={i} style={{
          background: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)',
          color: 'var(--brand-primary)',
          borderRadius: '3px',
          padding: '0 4px',
          fontWeight: 600,
          fontStyle: 'normal',
        }}>
          {part}
        </mark>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function EmailComposer({ lead, onClose }: EmailComposerProps) {
  const [activeTemplate, setActiveTemplate] = useState(0);
  const [subject, setSubject] = useState(TEMPLATES[0].subject);
  const [body, setBody] = useState(TEMPLATES[0].body);
  const [preview, setPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const firstName = lead.contactName.split(' ')[0] || lead.contactName;

  useEffect(() => {
    setSubject(TEMPLATES[activeTemplate].subject);
    setBody(TEMPLATES[activeTemplate].body);
    setSent(false);
    setError('');
    setPreview(false);
  }, [activeTemplate]);

  async function handleSend() {
    if (sending || sent) return;
    setSending(true);
    setError('');
    try {
      await api.email.send({
        toEmail: lead.email,
        toName: lead.contactName,
        company: lead.companyName,
        subject,
        body,
      });
      setSent(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to send email. Check server configuration.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: '100%', maxWidth: '600px', maxHeight: '90vh',
        background: '#111', borderRadius: '20px',
        border: '1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'color-mix(in srgb, var(--brand-primary) 15%, transparent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Mail size={16} style={{ color: 'var(--brand-primary)' }} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Cold Email</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                To: {lead.contactName} · {lead.email}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.05)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#888',
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Template tabs */}
        <div style={{
          display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.02)',
        }}>
          {TEMPLATES.map((t, i) => (
            <button key={i} onClick={() => setActiveTemplate(i)} style={{
              flex: 1, padding: '11px 8px', border: 'none',
              background: 'transparent', cursor: 'pointer',
              fontSize: '12px', fontWeight: i === activeTemplate ? 700 : 500,
              color: i === activeTemplate ? 'var(--brand-primary)' : '#555',
              borderBottom: i === activeTemplate ? '2px solid var(--brand-primary)' : '2px solid transparent',
              transition: 'all 0.2s',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Body (scrollable) */}
        <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
          {/* Company badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px', borderRadius: '20px', marginBottom: '14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            fontSize: '12px', color: '#888',
          }}>
            {lead.companyName}
          </div>

          {/* Subject */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Subject
            </label>
            {preview ? (
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#e0e0e0', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {subject.replace(/\{first_name\}/gi, firstName).replace(/\{company\}/gi, lead.companyName)}
              </div>
            ) : (
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                  padding: '10px 12px', color: '#e0e0e0', fontSize: '14px',
                  outline: 'none',
                }}
                placeholder="Email subject..."
              />
            )}
          </div>

          {/* Body */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Body
              </label>
              <button onClick={() => setPreview(!preview)} style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '4px 10px', borderRadius: '6px', border: 'none',
                background: preview ? 'color-mix(in srgb, var(--brand-primary) 12%, transparent)' : 'rgba(255,255,255,0.05)',
                color: preview ? 'var(--brand-primary)' : '#666',
                fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              }}>
                {preview ? <><Eye size={11} /> Preview on</> : <><EyeOff size={11} /> Show merge fields</>}
              </button>
            </div>
            {preview ? (
              <div style={{
                fontSize: '14px', lineHeight: 1.75, color: '#ccc',
                background: 'rgba(255,255,255,0.02)', borderRadius: '10px',
                padding: '14px', border: '1px solid rgba(255,255,255,0.06)',
                whiteSpace: 'pre-wrap', minHeight: '180px',
              }}>
                {body.replace(/\{first_name\}/gi, firstName).replace(/\{company\}/gi, lead.companyName)}
              </div>
            ) : (
              <>
                <div style={{
                  fontSize: '14px', lineHeight: 1.75, color: '#ccc',
                  background: 'rgba(255,255,255,0.02)', borderRadius: '10px',
                  padding: '14px', border: '1px solid rgba(255,255,255,0.06)',
                  whiteSpace: 'pre-wrap', minHeight: '180px',
                }}>
                  {renderMergeFields(body, false, firstName, lead.companyName)}
                </div>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  style={{
                    width: '100%', marginTop: '8px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px',
                    padding: '10px 12px', color: '#999', fontSize: '13px',
                    outline: 'none', resize: 'vertical', minHeight: '80px',
                    fontFamily: 'inherit',
                  }}
                  placeholder="Edit the email body here..."
                />
              </>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '10px 20px',
            background: 'rgba(239,68,68,0.1)', borderTop: '1px solid rgba(239,68,68,0.2)',
            color: '#f87171', fontSize: '13px',
          }}>
            {error}
          </div>
        )}

        {/* Sent success */}
        {sent && (
          <div style={{
            padding: '10px 20px',
            background: 'rgba(16,185,129,0.1)', borderTop: '1px solid rgba(16,185,129,0.2)',
            color: '#34d399', fontSize: '13px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <CheckCircle2 size={15} />
            Email sent to {lead.contactName} · {lead.email}
          </div>
        )}

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
          padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.015)',
        }}>
          <div style={{ fontSize: '12px', color: '#444' }}>
            {preview ? 'Previewing with real data' : 'Use {first_name} and {company} as merge fields'}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onClose} style={{
              padding: '8px 16px', borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent', color: '#666',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}>
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending || sent}
              style={{
                padding: '8px 20px', borderRadius: '8px', border: 'none',
                background: sent ? '#10b981' : 'var(--brand-primary)',
                color: '#fff', fontSize: '13px', fontWeight: 700,
                cursor: sending || sent ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '7px',
                opacity: sending ? 0.8 : 1, transition: 'all 0.3s',
                minWidth: '90px', justifyContent: 'center',
              }}
            >
              {sent ? (
                <><CheckCircle2 size={14} /> Sent!</>
              ) : sending ? (
                <><Loader2 size={14} className="animate-spin" /> Sending...</>
              ) : (
                <><Send size={14} /> Send Email</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
