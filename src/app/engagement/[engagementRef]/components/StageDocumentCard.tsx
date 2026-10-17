'use client';

import React, { useState } from 'react';
import PdfPreviewModal from '@/components/pdf/PdfPreviewModal';

interface StageDocumentCardProps {
  title: string;
  filename?: string;
  documentRef?: string;
  versionLabel?: string;
  version?: string;
  fileUrl?: string;
  documentMasterPath?: string;
  description?: string;
  sha256?: string;
  fileSizeBytes?: number;
  requiresSignature?: boolean;
  status?: string;
}

export default function StageDocumentCard({
  title,
  filename,
  documentRef,
  versionLabel = 'v1.0',
  version,
  fileUrl,
  documentMasterPath,
  description,
  sha256,
  fileSizeBytes,
  requiresSignature = false,
  status,
}: StageDocumentCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const resolvedFilename = filename || documentRef || 'document.pdf';
  const resolvedUrl = fileUrl || documentMasterPath || '';
  const isAvailable = Boolean(resolvedUrl && resolvedUrl !== '#');
  const formattedSize = fileSizeBytes
    ? `${(fileSizeBytes / 1024).toFixed(0)} KB`
    : isAvailable ? 'Enterprise PDF Master' : 'Pending Milestone Issue';

  return (
    <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#E7F3FF] border border-[#B9DCFF] text-[#1565C0] flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#0B2545]">{title}</h3>
              {requiresSignature && (
                <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-semibold">
                  Signature Required
                </span>
              )}
              {status && (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded font-semibold uppercase">
                  {status}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-slate-600 mt-1 max-w-xl">{description}</p>
            )}
            <p className="text-xs font-mono text-slate-500 mt-1">{resolvedFilename}</p>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
              <span>Size: {formattedSize}</span>
              {sha256 && (
                <>
                  <span>•</span>
                  <span className="font-mono truncate max-w-[200px]" title={sha256}>
                    SHA-256: {sha256}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Document Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {isAvailable ? (
            <>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#DFE7EF] bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Preview PDF</span>
              </button>
              <a
                href={resolvedUrl}
                download={resolvedFilename}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0B2545] hover:bg-[#1565C0] text-xs font-semibold text-white shadow-xs transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download Master</span>
              </a>

              {/* In-page 2:3 PDF Preview Modal */}
              <PdfPreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                documentTitle={title}
                pdfUrl={resolvedUrl}
                downloadFilename={resolvedFilename}
                versionLabel={version}
              />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 text-xs font-medium">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Document not yet issued</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
