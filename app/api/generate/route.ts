import Replicate from "replicate";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import { existsSync } from "fs";

export const runtime = "nodejs";

const replicate = new Replicate();
const execFileAsync = promisify(execFile);

type UiUxSkillResult = {
  used: boolean;
  context: string;
  error: string | null;
};

async function runUiUxSkill(description: string): Promise<UiUxSkillResult> {
  const scriptPath = path.join(
    process.cwd(),
    "skills",
    "ui-ux-pro-max-skill",
    "src",
    "ui-ux-pro-max",
    "scripts",
    "search.py"
  );

  if (!existsSync(scriptPath)) {
    return {
      used: false,
      context: "",
      error: `Skill file not found at: ${scriptPath}`,
    };
  }

  try {
    const designSystem = await execFileAsync(
      "python3",
      [
        scriptPath,
        description,
        "--design-system",
        "-f",
        "markdown",
        "-p",
        "Generated UI",
      ],
      {
        timeout: 15000,
        maxBuffer: 1024 * 1024,
      }
    );

    const reactGuidelines = await execFileAsync(
      "python3",
      [scriptPath, description, "--stack", "react"],
      {
        timeout: 15000,
        maxBuffer: 1024 * 1024,
      }
    );

    const context = `
UI/UX PRO MAX DESIGN SYSTEM:
${designSystem.stdout}

REACT-SPECIFIC UI GUIDELINES:
${reactGuidelines.stdout}
`.trim();

    return {
      used: context.length > 0,
      context,
      error: null,
    };
  } catch (error) {
    return {
      used: false,
      context: "",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function cleanGeneratedCode(raw: unknown): string {
  const code = Array.isArray(raw) ? raw.join("") : String(raw);

  return code
    .replace(/^```(?:jsx|tsx|js|javascript|typescript)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const description = String(body.description || "").trim();

    if (!description) {
      return Response.json(
        {
          code: "",
          debug: {
            uiUxProMaxUsed: false,
            error: "Description is empty.",
          },
        },
        { status: 400 }
      );
    }

    const widgetBrief = `
Create exactly one isolated UI widget/component for this request:
${description}

Do not create a landing page, storytelling flow, dashboard, multi-section page, progress chapter UI, onboarding journey, or extra content unless the user explicitly asks for it.
`.trim();

    const uiUxResult = await runUiUxSkill(widgetBrief);

    console.log("UI/UX Pro Max used:", uiUxResult.used);
    console.log("UI/UX Pro Max error:", uiUxResult.error);
    console.log("UI/UX Pro Max preview:", uiUxResult.context.slice(0, 500));

    const input = {
      prompt: `
You are a strict React widget generator.

MOST IMPORTANT RULE:
The user's request is the source of truth.
UI/UX Pro Max is only for visual styling guidance.
Do not use UI/UX Pro Max to add extra sections, stories, dashboards, progress panels, onboarding journeys, chapter lists, analytics panels, or unrelated UI.

UI/UX PRO MAX STATUS:
${
  uiUxResult.used
    ? "Successfully loaded and applied for styling only."
    : "Not loaded. Use best-practice UI styling."
}

UI/UX PRO MAX CONTEXT:
${uiUxResult.context}

USER REQUEST:
${description}

Generate only one isolated widget/component that directly matches the user request.

Hard scope rules:
- If user asks for "sign in page", create only a sign-in page/widget.
- If user asks for "navbar", create only a navbar.
- If user asks for "pricing panel", create only a pricing panel.
- Do not add progress panels unless user explicitly asks for progress panels.
- Do not add chapter lists, stories, dashboards, analytics, sidebars, or onboarding unless requested.
- Do not invent extra sections or extra flows.
- Do not create a full multi-section app.
- Keep it focused and usable.

Code rules:
- Name the component "App".
- Export it exactly as: export default function App()
- Use React only.
- Use Tailwind CSS classes only for styling.
- Do not import external libraries except React.
- Do not use shadcn, lucide-react, framer-motion, recharts, radix, or other packages.
- Use inline SVG icons only if needed.
- Make it responsive.
- Add polished spacing, typography, hover states, focus states, rounded corners, and shadows.
- Avoid default browser-looking UI.
- Return only valid React code.
- No markdown.
- No explanation.
- No triple backticks.
`,
      reasoning_effort: "low",
    };

    const output = await replicate.run("openai/gpt-5.2", { input });

    const code = cleanGeneratedCode(output);

    return Response.json({
      code,
      debug: {
        uiUxProMaxUsed: uiUxResult.used,
        uiUxContextPreview: uiUxResult.context.slice(0, 1200),
        uiUxError: uiUxResult.error,
      },
    });
  } catch (error) {
    return Response.json(
      {
        code: "",
        debug: {
          uiUxProMaxUsed: false,
          error: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}