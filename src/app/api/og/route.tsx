import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get("title") || "Logic Intelligence Technologies";
    const category = searchParams.get("category") || "Enterprise Engineering Studio";
    const tagline = searchParams.get("tagline") || "Custom Web, AI & Business Automation Systems";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#060B18",
            padding: "60px 80px",
            fontFamily: "sans-serif",
            backgroundImage: "radial-gradient(circle at 80% 20%, rgba(0, 191, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(123, 47, 190, 0.15) 0%, transparent 50%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: "#00BFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#000",
                  fontSize: "24px",
                  fontWeight: "900",
                }}
              >
                L
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ color: "#FFFFFF", fontSize: "16px", fontWeight: "900", letterSpacing: "1px" }}>
                  LOGIC INTELLIGENCE
                </span>
                <span style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "10px", fontWeight: "700", letterSpacing: "2px" }}>
                  TECHNOLOGIES
                </span>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "rgba(0, 191, 255, 0.1)",
                border: "1px solid rgba(0, 191, 255, 0.3)",
                padding: "8px 20px",
                borderRadius: "30px",
                color: "#00BFFF",
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              {category}
            </div>
          </div>

          {/* Main Title Body */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "950px" }}>
            <h1
              style={{
                fontSize: title.length > 50 ? "46px" : "60px",
                fontWeight: "900",
                color: "#FFFFFF",
                lineHeight: "1.15",
                margin: "0",
                letterSpacing: "-1px",
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: "22px",
                color: "rgba(255, 255, 255, 0.65)",
                lineHeight: "1.4",
                margin: "0",
              }}
            >
              {tagline}
            </p>
          </div>

          {/* Footer telemetry */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              paddingTop: "24px",
              color: "rgba(255, 255, 255, 0.4)",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <span>www.logicintelligencetechnologies.in</span>
              <span>•</span>
              <span>Coimbatore, Tamil Nadu</span>
            </div>
            <div style={{ color: "#00FF88", fontWeight: "700" }}>
              // VERIFIED PRODUCTION SPEC
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
    });
  }
}
