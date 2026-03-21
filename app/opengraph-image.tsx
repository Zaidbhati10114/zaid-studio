import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Zaid Studio — Full Stack Development";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#09090b",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700, color: "#ffffff" }}>
          Zaid Studio
        </div>
        <div style={{ fontSize: 28, color: "#3b82f6" }}>
          Full Stack Development
        </div>
        <div style={{ fontSize: 20, color: "#71717a", marginTop: 8 }}>
          Web Apps · SaaS Products · AI Tools
        </div>
      </div>
    ),
    { ...size }
  );
}
