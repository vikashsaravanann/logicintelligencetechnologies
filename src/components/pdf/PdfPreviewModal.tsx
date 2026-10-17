'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  pdfUrl: string;
  downloadFilename?: string;
  versionLabel?: string;
}

export default function PdfPreviewModal({
  isOpen,
  onClose,
  documentTitle,
  pdfUrl,
  downloadFilename = 'document.pdf',
  versionLabel,
}: PdfPreviewModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Background scroll lock
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen]);

  // Escape key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* 2:3 Width-to-Height Ratio Container */}
      <div
        ref={modalRef}
        className="relative flex flex-col w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
        style={{
          aspectRatio: '2 / 3',
          maxHeight: '92vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0B2545] text-white shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-blue-300 shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 id="pdf-modal-title" className="text-sm font-bold text-white truncate">
                {documentTitle}
              </h2>
              {versionLabel && (
                <span className="text-[10px] text-blue-200 block truncate">
                  {versionLabel} · Official Enterprise Master
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={pdfUrl}
              download={downloadFilename}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
              title="Download master document"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">Download</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-hidden focus:ring-2 focus:ring-white/40"
              aria-label="Close PDF preview"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* PDF Document Viewport with 2:3 vertical scrolling */}
        <div className="relative flex-1 bg-slate-100 overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10 space-y-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Rendering document preview...</p>
            </div>
          )}

          {hasError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Failed to load preview</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-sm">
                  The document could not be rendered in this browser context. You can download the master PDF directly.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setHasError(false);
                    setIsLoading(true);
                  }}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Retry Preview
                </button>
                <a
                  href={pdfUrl}
                  download={downloadFilename}
                  className="px-3.5 py-2 rounded-lg bg-[#0B2545] text-xs font-semibold text-white hover:bg-[#1565C0]"
                >
                  Download Master PDF
                </a>
              </div>
            </div>
          ) : (
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
              className="w-full h-full border-0"
              title={documentTitle}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between shrink-0">
          <span>Preserving original 2:3 proportions</span>
          <span className="font-mono text-slate-400">Esc to Close</span>
        </div>
      </div>
    </div>
  );
}
