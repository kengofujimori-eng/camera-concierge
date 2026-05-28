# Lens Navi handoff: current UI phase

Last updated: 2026-05-15

## Current direction

Lens Navi, formerly Camera Concierge, is moving toward a modern product UI.

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

## Recent RF-S recommendation quality work

Latest baseline:
- Latest commit: 536d5d3 test: add RF-S indoor child recommendation smoke case
- RF-S recommendation quality improvement phase is complete.
- npm run build passed.
- npm run db:check passed.
- npm run test:e2e passed with 7 tests.

RF-S recommendation guardrails now include:
- Canon RF-S users should see both RF-S dedicated lenses and Canon RF full-frame lenses as normal candidates.
- Canon APS-C uses 1.6x crop conversion.
- Treat 24mm as about 38mm equivalent, 35mm as about 56mm equivalent, and 50mm as about 80mm equivalent when judging use cases.
- For indoor child photography, do not make ultra-wide lenses like RF-S 10-18mm the main recommendation too aggressively.
- EF-M is not compatible with RF-S bodies.
- EF / EF-S lenses require an adapter, so they should not be prioritized as normal candidates.

RF-S data / image work completed:
- RF-S 10-18mm image corrected.
- RF 24mm F1.8 Macro image corrected.
- RF-S 55-210mm image corrected.
- RF-S contact sheets were checked after image updates.

RF-S test coverage added:
- E2E smoke test for Canon RF-S indoor child photography with APS-C conversion guidance.

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
