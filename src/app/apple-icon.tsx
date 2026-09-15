import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon — circular brand mark. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0F1E",
          borderRadius: 36,
        }}
      >
        <div
          style={{
            width: 156,
            height: 156,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "radial-gradient(circle at 35% 30%, #132037 0%, #0A0F1E 70%)",
            border: "4px solid rgba(0, 191, 255, 0.4)",
          }}
        >
          <svg width="96" height="96" viewBox="0 0 120 120" fill="none">
            <path
              d="M60 18c-14 0-26 9-30 22-6-2-13 2-15 9-2 7 2 14 8 17-1 4-1 8 1 12 3 7 10 12 18 13 4 8 12 13 21 13s17-5 21-13c8-1 15-6 18-13 2-4 2-8 1-12 6-3 10-10 8-17-2-7-9-11-15-9-4-13-16-22-30-22z"
              fill="#00BFFF"
              fillOpacity="0.15"
              stroke="#00BFFF"
              strokeWidth="3"
            />
            <path
              d="M42 48h12m-6-6v12M66 52h14M73 45v14M50 72h20M60 66v12"
              stroke="#38BDF8"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="42" cy="48" r="3" fill="#7DD3FC" />
            <circle cx="54" cy="48" r="3" fill="#7DD3FC" />
            <circle cx="66" cy="52" r="3" fill="#7DD3FC" />
            <circle cx="80" cy="52" r="3" fill="#7DD3FC" />
            <circle cx="60" cy="72" r="3" fill="#7DD3FC" />
          </svg>
        </div>
      </div>
    ),
    { ...size }
  );
}
