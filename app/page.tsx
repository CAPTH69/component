"use client";

import { useState } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
} from "@codesandbox/sandpack-react";

type GenerateDebug = {
  error?: string;
};

type GenerateResponse = {
  code: string;
  debug?: GenerateDebug;
};

const examplePrompts = [
  "a pricing card with three tiers",
  "a SaaS navbar",
  "a login form",
  "an analytics dashboard card",
];

function ProgressWheel({
  progress,
  label,
}: {
  progress: number;
  label: string;
}) {
  const rounded = Math.round(progress);

  return (
    <div className="mt-4 flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/80 p-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div
        className="grid h-12 w-12 shrink-0 place-items-center rounded-full"
        style={{
          background: `conic-gradient(#10b981 ${
            rounded * 3.6
          }deg, #27272a 0deg)`,
        }}
      >
        <div className="grid h-9 w-9 place-items-center rounded-full bg-zinc-950 text-[11px] font-bold text-zinc-50">
          {rounded}%
        </div>
      </div>

      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-zinc-100">
          {label}
        </div>
        <div className="text-xs text-zinc-500">Generating your widget...</div>
      </div>
    </div>
  );
}

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
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

    const timer = window.setInterval(() => {
      setProgress((current) => {
        if (current < 25) {
          setStage("Preparing design direction");
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
    <main className="min-h-[100dvh] bg-zinc-950 text-zinc-50">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />

      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col px-5 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-zinc-900 pb-5">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-semibold text-emerald-300">
              SH
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-100">Shyc</p>
              <p className="text-xs text-zinc-500">Component generator</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-400 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Live preview
          </div>
        </header>

        <section className="flex flex-1 items-center py-10 lg:py-14">
          <div className="w-full max-w-3xl">
            <p className="mb-5 inline-flex rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-medium uppercase tracking-[0.16em] text-emerald-300">
              Text to component
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.95] tracking-tight text-zinc-50 sm:text-6xl">
              Describe it. See it.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">
              Type a description, get a live, rendered React component -
              instantly.
            </p>

            <section className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_24px_70px_-40px_rgba(0,0,0,0.9)]">
              <label
                htmlFor="component-prompt"
                className="mb-2 block px-1 text-sm font-medium text-zinc-200"
              >
                Component prompt
              </label>

              <div className="rounded-lg border border-zinc-800 bg-zinc-950 transition-colors focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15">
                <textarea
                  id="component-prompt"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Describe a widget, e.g. sign in page, navbar, pricing card..."
                  rows={4}
                  className="min-h-32 w-full resize-y rounded-t-lg bg-transparent px-4 py-3 text-sm leading-6 text-zinc-100 outline-none placeholder:text-zinc-600"
                />

                <div className="flex flex-col gap-3 border-t border-zinc-800 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    One focused component works best.
                  </div>
                  <button
                    onClick={handleClick}
                    disabled={loading || !text.trim()}
                    className="inline-flex cursor-pointer items-center justify-center rounded-md bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none disabled:hover:translate-y-0"
                  >
                    {loading ? "Generating..." : "Generate"}
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {examplePrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setText(prompt)}
                    className="cursor-pointer rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs font-medium text-zinc-400 transition duration-200 hover:border-emerald-500/70 hover:bg-emerald-500/10 hover:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {loading && <ProgressWheel progress={progress} label={stage} />}

              {error && (
                <div className="mt-4 rounded-lg border border-red-900/60 bg-red-950/70 p-3 text-sm text-red-100">
                  {error}
                </div>
              )}
            </section>
          </div>
        </section>

        {result && (
          <div className="mb-10 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 shadow-[0_24px_70px_-42px_rgba(0,0,0,0.9)]">
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
    </main>
  );
}
