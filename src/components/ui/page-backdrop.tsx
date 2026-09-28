"use client";

type PageBackdropProps = {
  /** Local path or remote URL — intentionally unused: site has no page background images */
  src?: string;
  alt?: string;
  overlayOpacity?: number;
  className?: string;
};

/**
 * Background photos disabled site-wide per product direction.
 * Component kept so existing imports compile; renders nothing.
 */
export default function PageBackdrop(_props: PageBackdropProps) {
  return null;
}
