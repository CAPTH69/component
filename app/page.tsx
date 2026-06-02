"use client";

import { useState } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
} from "@codesandbox/sandpack-react";

type GenerateDebug = {
  uiUxProMaxUsed: boolean;
  uiUxContextPreview?: string;
  uiUxError?: string | null;
  error?: string;
};

type GenerateResponse = {
  code: string;
  debug?: GenerateDebug;
};

function ProgressWheel({
  progress,
  label,
}: {
  progress: number;
  label: string;
}) {
  const rounded = Math.round(progress);

  return (
    <div
      style={{
        marginTop: 16,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: "50%",
          background: `conic-gradient(#22c55e ${
            rounded * 3.6
          }deg, #1f2937 0deg)`,
          display: "grid",
          placeItems: "center",
        }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            background: "#020617",
            color: "white",
            display: "grid",
            placeItems: "center",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {rounded}%
        </div>
      </div>

      <div>
        <div style={{ color: "white", fontWeight: 600 }}>{label}</div>
        <div style={{ color: "#94a3b8", fontSize: 13 }}>
          Generating your widget...
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [debug, setDebug] = useState<GenerateDebug | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");

  async function handleClick() {
    if (!text.trim()) return;

    setLoading(true);
    setProgress(5);
    setStage("Preparing request");
    setError("");
    setResult("");
    setDebug(null);

    const timer = window.setInterval(() => {
      setProgress((current) => {
        if (current < 25) {
          setStage("Applying UI/UX Pro Max");
          return current + 3;
        }

        if (current < 70) {
          setStage("Generating React widget");
          return current + 1.5;
        }

        if (current < 90) {
          setStage("Preparing preview");
          return current + 0.5;
        }

        return current;
      });
    }, 300);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: text }),
      });

      const data = (await response.json()) as GenerateResponse;

      if (!response.ok) {
        throw new Error(data.debug?.error || "Failed to generate component.");
      }

      setProgress(100);
      setStage("Preview ready");

      setResult(data.code);
      setDebug(data.debug ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      window.clearInterval(timer);

      setTimeout(() => {
        setLoading(false);
        setProgress(0);
        setStage("");
      }, 700);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 40,
        background: "#020617",
        color: "white",
      }}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Describe a widget, e.g. sign in page, navbar, pricing card..."
        rows={4}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 10,
          border: "1px solid #334155",
          background: "#0f172a",
          color: "white",
          outline: "none",
          resize: "vertical",
        }}
      />

      <button
        onClick={handleClick}
        disabled={loading || !text.trim()}
        style={{
          marginTop: 12,
          padding: "10px 18px",
          borderRadius: 10,
          border: "none",
          background: loading || !text.trim() ? "#334155" : "#2563eb",
          color: "white",
          cursor: loading || !text.trim() ? "not-allowed" : "pointer",
          fontWeight: 600,
        }}
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      {loading && <ProgressWheel progress={progress} label={stage} />}

      {error && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 8,
            background: "#450a0a",
            color: "#fecaca",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {debug && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 8,
            background: debug.uiUxProMaxUsed ? "#052e16" : "#450a0a",
            color: "white",
            fontSize: 13,
          }}
        >
          <strong>
            UI/UX Pro Max used: {debug.uiUxProMaxUsed ? "YES" : "NO"}
          </strong>

          {debug.uiUxError && (
            <p style={{ marginTop: 8, color: "#fecaca" }}>
              Error: {debug.uiUxError}
            </p>
          )}

          {debug.uiUxContextPreview && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ cursor: "pointer", color: "#bbf7d0" }}>
                View UI/UX Pro Max context
              </summary>

              <pre
                style={{
                  marginTop: 8,
                  whiteSpace: "pre-wrap",
                  color: "#d1d5db",
                  maxHeight: 180,
                  overflow: "auto",
                }}
              >
                {debug.uiUxContextPreview}
              </pre>
            </details>
          )}
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: 20,
            borderRadius: 14,
            overflow: "hidden",
            border: "1px solid #334155",
          }}
        >
          <SandpackProvider
            key={result}
            template="react"
            files={{
              "/App.js": {
                code: result,
                active: true,
              },
            }}
            options={{
              externalResources: ["https://cdn.tailwindcss.com"],
            }}
          >
            <SandpackLayout>
              <SandpackPreview style={{ height: 600 }} />
            </SandpackLayout>
          </SandpackProvider>
        </div>
      )}
    </div>
  );
}