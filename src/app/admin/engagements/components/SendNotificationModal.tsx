'use client';

import React, { useState } from 'react';
import {
  X,
  Bell,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Receipt,
  Sparkles,
  GitBranch,
  MessageSquare,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react';
import { ClientEngagement } from '@/lib/engagements/types';

interface SendNotificationModalProps {
  engagement: ClientEngagement | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

type CategoryType = 'action_required' | 'milestone' | 'document' | 'payment' | 'system' | 'message';

const TEMPLATES: Array<{
  label: string;
  category: CategoryType;
  title: string;
  message: string;
  actionLabel: string;
}> = [
  {
    label: 'Action Required',
    category: 'action_required',
    title: 'Action Required: Client Review & Approval',
    message: 'We have updated your milestone deliverable. Please review the documentation in your client portal and provide approval to proceed.',
    actionLabel: 'Review Now',
  },
  {
    label: 'Milestone Progress',
    category: 'milestone',
    title: 'Milestone Stage Completed',
    message: 'Great news! Our engineering team has successfully completed and validated the latest project stage. Detailed deliverables are ready in your portal.',
    actionLabel: 'View Milestone',
  },
  {
    label: 'Invoice Ready',
    category: 'payment',
    title: 'Milestone Invoice Issued',
    message: 'Your milestone tax invoice has been generated and is ready for settlement. Digital receipts and bank transfer details are available in your portal.',
    actionLabel: 'View Invoice',
  },
  {
    label: 'Engineering Note',
    category: 'message',
    title: 'Engineering Team Update',
    message: 'A brief update regarding active sprint velocity and scheduled system integration checkpoints.',
    actionLabel: 'Open Workspace',
  },
];

export function SendNotificationModal({
  engagement,
  isOpen,
  onClose,
  onSuccess,
}: SendNotificationModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryType>('action_required');
  const [message, setMessage] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [actionLabel, setActionLabel] = useState('');
  const [sendEmailAlert, setSendEmailAlert] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !engagement) return null;

  const defaultActionUrl = `/client/notifications?ref=${encodeURIComponent(engagement.engagement_ref)}`;

  const handleApplyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setTitle(tpl.title);
    setCategory(tpl.category);
    setMessage(tpl.message);
    setActionLabel(tpl.actionLabel);
    if (!actionUrl) {
      setActionUrl(defaultActionUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError('Please provide both a notification title and message.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/engagements/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engagementRef: engagement.engagement_ref,
          clientEmail: engagement.contact_email,
          title: title.trim(),
          category,
          message: message.trim(),
          actionUrl: actionUrl.trim() || defaultActionUrl,
          actionLabel: actionLabel.trim() || 'View Details',
          sendEmailAlert,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch notification.');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setTitle('');
        setMessage('');
        setActionUrl('');
        setActionLabel('');
        onClose();
        if (onSuccess) {
          onSuccess(`Notification successfully dispatched to ${engagement.company_name} workspace.`);
        }
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send notification';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#DFE7EF] shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#0B2545] to-[#134074] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Bell className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold font-poppins">
                Send Notification to Client Workspace
              </h3>
              <p className="text-xs text-slate-200">
                Direct in-app dispatch to client portal notification feed.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Workspace Info Strip */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-[#DFE7EF] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
              Target Client Workspace
            </span>
            <span className="font-bold text-[#0B2545] text-sm">
              {engagement.company_name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#1565C0] bg-[#E7F3FF] px-2.5 py-1 rounded">
              {engagement.engagement_ref}
            </span>
            <span className="text-slate-600 bg-white border border-[#DFE7EF] px-2.5 py-1 rounded text-xs">
              {engagement.contact_email}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-semibold">
                Notification successfully dispatched to client workspace!
              </span>
            </div>
          )}

          {/* Quick Starter Templates */}
          <div>
            <label className="block text-xs font-bold text-[#0B2545] uppercase tracking-wider mb-2">
              Quick Templates
            </label>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="px-2.5 py-1 rounded-lg border border-[#DFE7EF] bg-white hover:border-[#1565C0] hover:text-[#1565C0] text-slate-700 text-xs font-medium transition-all shadow-2xs"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#0B2545] uppercase tracking-wider mb-1.5">
                Notification Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Action Required: Approve Milestone 06"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFE7EF] bg-white text-xs text-[#0B2545] font-medium focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30 focus:border-[#1565C0]"
                style={{ color: '#0B2545', WebkitTextFillColor: '#0B2545' }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B2545] uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#DFE7EF] bg-white text-xs text-[#0B2545] font-medium focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30 focus:border-[#1565C0]"
                style={{ color: '#0B2545', WebkitTextFillColor: '#0B2545' }}
              >
                <option value="action_required">⚡ Action Required</option>
                <option value="milestone">🎯 Milestone Delivery</option>
                <option value="payment">💳 Payment & Billing</option>
                <option value="document">📄 Document & SOW</option>
                <option value="message">💬 Engineering Message</option>
                <option value="system">🔔 System Notification</option>
              </select>
            </div>
          </div>

          {/* Message Body */}
          <div>
            <label className="block text-xs font-bold text-[#0B2545] uppercase tracking-wider mb-1.5">
              Message Content *
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide clear, actionable details for the client. This will be prominently visible in their workspace notification center."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFE7EF] bg-white text-xs text-[#0B2545] font-medium focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30 focus:border-[#1565C0] leading-relaxed resize-y"
              style={{ color: '#0B2545', WebkitTextFillColor: '#0B2545' }}
            />
          </div>

          {/* Action Button Link & Label */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0B2545] uppercase tracking-wider mb-1.5">
                Action URL (Optional)
              </label>
              <input
                type="text"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                placeholder={defaultActionUrl}
                className="w-full px-3 py-2 rounded-xl border border-[#DFE7EF] bg-white text-xs text-[#0B2545] font-medium focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30 focus:border-[#1565C0] font-mono text-[11px]"
                style={{ color: '#0B2545', WebkitTextFillColor: '#0B2545' }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B2545] uppercase tracking-wider mb-1.5">
                Action Button Label (Optional)
              </label>
              <input
                type="text"
                value={actionLabel}
                onChange={(e) => setActionLabel(e.target.value)}
                placeholder="e.g. View Milestone / Review Deliverable"
                className="w-full px-3 py-2 rounded-xl border border-[#DFE7EF] bg-white text-xs text-[#0B2545] font-medium focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30 focus:border-[#1565C0]"
                style={{ color: '#0B2545', WebkitTextFillColor: '#0B2545' }}
              />
            </div>
          </div>

          {/* Email Alert Toggle */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#0B2545] block">
                Dispatch Email Notification Alert
              </span>
              <span className="text-[11px] text-slate-500 block">
                Sends an email notification to {engagement.contact_email} with direct access link.
              </span>
            </div>
            <input
              type="checkbox"
              id="sendEmailAlert"
              checked={sendEmailAlert}
              onChange={(e) => setSendEmailAlert(e.target.checked)}
              className="w-4 h-4 text-[#1565C0] rounded border-gray-300 focus:ring-[#1565C0]"
            />
          </div>

          {/* Live Preview Card */}
          {title.trim() && (
            <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/40 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-teal-900 uppercase tracking-wider">
                <span>Client Portal Preview</span>
                <span className="font-mono lowercase text-teal-700">category: {category}</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-teal-100 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-[#0B2545]">{title}</h4>
                  <span className="text-[10px] text-slate-400">Just now</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {message || 'Your message will appear here...'}
                </p>
                {(actionLabel || actionUrl) && (
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1FA9A2]">
                      <span>{actionLabel || 'View Details'}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DFE7EF]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-[#DFE7EF] bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !message.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[#134074] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Dispatching…</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Notification</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
