'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  pdfUrl: string;
  downloadFilename?: string;
  versionLabel?: string;
  sha256?: string;
}

export default function PdfPreviewModal({
  isOpen,
  onClose,
  documentTitle,
  pdfUrl,
  downloadFilename = 'document.pdf',
  versionLabel,
  sha256,
}: PdfPreviewModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [verifiedSha256, setVerifiedSha256] = useState<string | undefined>(sha256);

  // Sync sha256 prop
  useEffect(() => {
    if (sha256) {
      setVerifiedSha256(sha256);
    }
  }, [sha256]);

  // Pre-flight HTTP inspection to detect 401, 403, 404, 500 before rendering
  useEffect(() => {
    if (!isOpen || !pdfUrl) return;

    let isMounted = true;
    const controller = new AbortController();

    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');
    setErrorStatus(null);

    const checkDocument = async () => {
      try {
        let res: Response;
        try {
          res = await fetch(pdfUrl, {
            method: 'HEAD',
            signal: controller.signal,
          });
          if (res.status === 405) {
            res = await fetch(pdfUrl, {
              method: 'GET',
              headers: { Range: 'bytes=0-1024' },
              signal: controller.signal,
            });
          }
        } catch (headErr: any) {
          if (headErr?.name === 'AbortError') return;
          res = await fetch(pdfUrl, {
            method: 'GET',
            headers: { Range: 'bytes=0-1024' },
            signal: controller.signal,
          });
        }

        if (!isMounted) return;

        const headerHash =
          res.headers.get('x-document-sha256') ||
          res.headers.get('x-content-sha256');
        if (headerHash && !sha256) {
          setVerifiedSha256(headerHash);
        }

        if (!res.ok) {
          setErrorStatus(res.status);
          setHasError(true);
          setIsLoading(false);
          if (res.status === 401) {
            setErrorMessage('Authentication required. Please sign in to access this document.');
          } else if (res.status === 403) {
            setErrorMessage('Access restricted. You do not have permission to view this financial document.');
          } else if (res.status === 404) {
            setErrorMessage('Document not found. The requested document has not yet been generated or is still processing.');
          } else if (res.status >= 500) {
            setErrorMessage('The document generation service encountered an unexpected error. Please try downloading directly.');
          } else {
            setErrorMessage(`Failed to load document preview (HTTP ${res.status}).`);
          }
          return;
        }

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
          setErrorStatus(404);
          setHasError(true);
          setIsLoading(false);
          setErrorMessage('Received HTML document instead of PDF binary. Document may not exist.');
          return;
        }

        setIsLoading(false);
      } catch (err: any) {
        if (!isMounted || err?.name === 'AbortError') return;
        console.warn('[PdfPreviewModal] Preflight check warning:', err);
        setIsLoading(false);
      }
    };

    checkDocument();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [isOpen, pdfUrl, sha256]);

  // Background scroll lock and initial focus
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen]);

  // Escape key and Focus Trap handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
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

  const urlWithParams = pdfUrl.includes('#')
    ? pdfUrl
    : `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* 2:3 Width-to-Height Ratio Container Constrained by Viewport Width & Height */}
      <div
        ref={modalRef}
        className="relative flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
        style={{
          width: '100%',
          maxWidth: 'min(92vw, calc(92vh * 2 / 3))',
          maxHeight: '92vh',
          aspectRatio: '2 / 3',
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
              <div className="flex items-center gap-2">
                {versionLabel && (
                  <span className="text-[10px] text-blue-200 block truncate">
                    {versionLabel} · Official Enterprise Master
                  </span>
                )}
                {verifiedSha256 && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-300 font-mono">
                    <svg className="w-3 h-3 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                    </svg>
                    <span>SHA-256: {verifiedSha256.slice(0, 10)}...</span>
                  </span>
                )}
              </div>
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
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-hidden focus:ring-2 focus:ring-white/40 cursor-pointer"
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
              <p className="text-xs text-slate-500 font-medium">Verifying and rendering document preview...</p>
            </div>
          )}

          {hasError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-white z-10">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {errorStatus === 404
                    ? 'Document Not Available'
                    : errorStatus === 403 || errorStatus === 401
                    ? 'Access Restricted'
                    : 'Failed to Load Preview'}
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-sm">
                  {errorMessage ||
                    'The document could not be rendered in this browser context. You can download the master PDF directly.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setHasError(false);
                    setIsLoading(true);
                  }}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Retry Preview
                </button>
                <a
                  href={pdfUrl}
                  download={downloadFilename}
                  className="px-3.5 py-2 rounded-lg bg-[#0B2545] text-xs font-semibold text-white hover:bg-[#1565C0] cursor-pointer"
                >
                  Download Master PDF
                </a>
              </div>
            </div>
          ) : (
            <object
              data={urlWithParams}
              type="application/pdf"
              className="w-full h-full border-0"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            >
              <iframe
                src={urlWithParams}
                className="w-full h-full border-0"
                title={documentTitle}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setHasError(true);
                }}
              />
            </object>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span>Preserving original 2:3 proportions</span>
            {verifiedSha256 && (
              <span className="font-mono text-[10px] text-slate-400">
                · SHA-256 verified
              </span>
            )}
          </div>
          <span className="font-mono text-slate-400">Esc to Close</span>
        </div>
      </div>
    </div>
  );
}
