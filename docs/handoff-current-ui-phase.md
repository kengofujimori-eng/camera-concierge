# Camera Concierge handoff: current UI phase

Last updated: 2026-05-13

## Current direction

Camera Concierge is moving toward a modern product UI.

Design direction:
- White / slate base
- Thin borders
- Clear readability
- Subtle shadows
- Vercel / Linear style
- Local accent only
- Blue-violet to magenta accent
- Avoid full-screen purple haze
- Avoid pastel lavender fog
- Avoid noisy neon
- Avoid emoji-heavy scene cards

## Current accent colors

Preferred range:
- Blue: #2563EB
- Blue-violet: #4F46E5
- Violet: #7C3AED
- Purple: #9333EA
- Magenta: #D946EF

Use accents locally only:
- sliders
- selected states
- icons
- CTA
- focus rings

Do not tint the whole background.

## Current UI language

Preferred selected-state style:
- Outer wrapper: thin blue-violet to magenta gradient outline.
- Inner surface: white / slate.
- Avoid purple filled selected cards.
- Shadow should be subtle.
- Text should mostly remain slate / white.
- Avoid gradient text unless intentionally small.

Recommended selected outer background:

bg-[linear-gradient(120deg,#2563EB_0%,#7C3AED_56%,#D946EF_100%)]

Recommended unselected outer background:

bg-slate-200/80 hover:bg-violet-300/70 dark:bg-white/10 dark:hover:bg-violet-400/30

Recommended structure:

button: group rounded-xl p-[1px]
inner span/div: block h-full rounded-[11px] bg-white dark:bg-slate-950

## Completed or merged

- Branch add-lens-type-selector was merged into main.
- AGENTS.md now references this handoff file.
- Lens type selector is on main.
- Lens type options:
  - おまかせ
  - 単焦点
  - ズーム
  - マクロ
- Lens type selection is stored as selectedLensType.
- Old isMacro localStorage compatibility should be preserved.
- Macro behaves like the old macro toggle.
- Prime / Zoom / Macro are passed into the recommendation prompt.
- Auto does not constrain recommendations.
- Budget and focal sliders use blue-to-magenta accents.
- Focal min handle is blue-violet.
- Focal max handle is magenta.
- Scene cards use lucide icons, not emoji-heavy design.

## Latest local UI work

The sidebar lens type selector was refined locally toward:
- thin gradient outline
- white/slate inner surface
- less purple fill
- calmer text color

User feedback: this looked better and should become the shared selected-state language.

Before continuing, confirm whether this local lens type outline change has been committed and pushed.

## Next UI phase

Next likely work:
1. Confirm branch and local status.
2. Inspect src/components/ChatInterface.tsx.
3. Apply the same selected outline language to the initial mount/brand selection cards.
4. Apply the same selected outline language to scene cards if applicable.
5. Then modernize recommendation cards and warehouse page.

Important note:
- When a mount is already selected, the initial mount card grid is hidden.
- Screenshots may show scene cards instead of mount cards.
- To reveal initial mount selection, clear selectedMountId in browser localStorage.

Browser console:

localStorage.removeItem('selectedMountId')
location.reload()

## Useful inspection commands

git branch --show-current
git status --short
git log --oneline --decorate -5

grep -n "SCENES.map\|子供・家族\|quick-question\|scene\|撮影シーン" src/components/ChatInterface.tsx | head -120
grep -n "カメラを選ぶと\|MOUNTS.map\|mount-button\|selectedMount\|マウントを選ばず" src/components/ChatInterface.tsx | head -160

Known approximate locations during this phase:
- Initial mount/brand cards: around lines 1312-1358.
- Scene cards: around line 1384.

## Restart local dev if UI appears stale

lsof -ti:3000 | xargs kill -9 2>/dev/null || true
rm -rf .next
npm run dev

## Preserve E2E selectors

Do not break:
- selected-mount-display
- mount-button-*
- mount-option-*
- chat-input
- chat-send-button
- assistant-answer
- lens-card
- lens-card-image
- lens-card-placeholder
- price-badge

## Do not casually change

Avoid touching unless explicitly needed:
- recommendation matching logic
- Dify API contract
- lens database structure
- price logic
- review links
- affiliate link behavior
- localStorage formats

## Main files

For UI:
- src/components/ChatInterface.tsx
- src/app/globals.css

For recommendation cards:
- src/components/LensRecommendationCards.tsx

For warehouse:
- src/app/warehouse/page.tsx

For project handoff:
- AGENTS.md
- docs/handoff-current-ui-phase.md

## Workflow rules

When Codex is unavailable:
- Use GitHub/repo as source of truth.
- Inspect files before proposing patches.
- Prefer small copy-pasteable commands.
- Use python3, not python.
- Check branch/state before PR.
- Keep changes UI-only unless explicitly requested.
- Prefer one focused commit per UI surface.

Checks:
- npm run build
- npm run db:check
- npm run test:e2e

If Playwright/Chromium fails because of local environment, report the exact error and do not claim E2E passed.
