import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AutoRadar — Inteligencia de Mercado Automotriz";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0b0c10",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Radar circles */}
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            border: "2px solid rgba(34, 197, 94, 0.1)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 280,
            height: 280,
            borderRadius: "50%",
            border: "2px solid rgba(34, 197, 94, 0.15)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 160,
            height: 160,
            borderRadius: "50%",
            border: "2px solid rgba(34, 197, 94, 0.2)",
            display: "flex",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 30,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "rgba(34, 197, 94, 0.1)",
              border: "2px solid rgba(34, 197, 94, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
            }}
          >
            🚗
          </div>
          <span
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: "#e0e0e0",
              letterSpacing: "-0.02em",
            }}
          >
            AutoRadar
          </span>
        </div>

        <span
          style={{
            fontSize: 24,
            color: "#22c55e",
            letterSpacing: "0.15em",
            textTransform: "uppercase" as const,
            fontWeight: 600,
          }}
        >
          Inteligencia de Mercado Automotriz
        </span>

        <span
          style={{
            fontSize: 18,
            color: "#6b7280",
            marginTop: 16,
          }}
        >
          Oportunidades en tiempo real · MercadoLibre & Facebook · Uruguay
        </span>
      </div>
    ),
    { ...size },
  );
}
