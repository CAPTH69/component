import Replicate from "replicate";

export const runtime = "nodejs";

const replicate = new Replicate();

const tasteSkillGuidance = `
Taste-skill generation rules:
- The user's request is the source of truth. Use these rules only to improve visual quality; never use them to add unrelated UI.
- Generate one focused React widget/component unless the user explicitly asks for a full page or multi-part flow.
- Build a premium software UI: minimal, functional, sharply aligned, generous whitespace, clear hierarchy, and no generic filler.
- Use a restrained neutral base with one accent color only. Avoid rainbow palettes, neon glows, purple-blue AI gradients, beige/brown themes, and pure black.
- Prefer zinc/slate/neutral surfaces, subtle 1px borders, inner highlight borders, and soft tinted shadows. Use cards only when they clarify hierarchy.
- Use modern sans typography with tight but readable hierarchy. Do not use serif styling for software UI.
- Make forms accessible: labels above inputs, visible focus states, helper/error text where appropriate, and good contrast.
- Add complete states when naturally relevant: hover, focus, active/tactile feedback, loading, empty, and error states. Do not add fake complex workflows.
- Animate only with CSS transitions or Tailwind animation utilities. Animate transform and opacity, not layout dimensions.
- Be responsive across mobile and desktop. Use stable grids and avoid fragile width math.
- Avoid AI tells: no generic avatar placeholders, no predictable fake numbers, no startup-slop names, no filler copy, no emojis.
`.trim();

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
            error: "Description is empty.",
          },
        },
        { status: 400 }
      );
    }

    const input = {
      prompt: `
You are a strict React widget generator.

MOST IMPORTANT RULE:
The user's request is the source of truth.
Taste-skill guidance is only for visual quality and interaction quality.
Do not use taste-skill guidance to add extra sections, stories, dashboards, progress panels, onboarding journeys, chapter lists, analytics panels, sidebars, or unrelated UI.

TASTE-SKILL GUIDANCE:
${tasteSkillGuidance}

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
- Use Tailwind CSS classes only for styling. The component runs in Sandpack with Tailwind CDN, so do not rely on custom project CSS or Tailwind config.
- Do not import external libraries except React.
- Do not use shadcn, lucide-react, framer-motion, recharts, radix, or other packages.
- Use inline SVG icons only if needed.
- Do not use TypeScript syntax or type annotations.
- Make it responsive.
- Add polished spacing, typography, hover states, focus states, rounded corners, and subtle shadows.
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
    });
  } catch (error) {
    return Response.json(
      {
        code: "",
        debug: {
          error: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}
