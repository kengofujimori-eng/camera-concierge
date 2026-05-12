# Camera Concierge handoff: current UI phase

Last updated: 2026-05-13

## Current direction

Camera Concierge is moving toward a modern product UI, not a handmade personal app.

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

Use accent locally only.

Current preferred range:
- Blue: #2563EB
- Blue-violet: #4F46E5
- Violet: #7C3AED
- Purple: #9333EA
- Magenta: #D946EF

Use these for:
- sliders
- selected states
- icons
- CTA
- focus rings

Do not tint the whole background.

## Completed UI phase

Completed or in progress:
- Scene cards changed from emoji-feel to lucide icon product cards.
- Mount selection improved with sensor size and body examples.
- Sidebar hint appears after mount selection.
- Budget and focal sliders use blue-to-magenta accents.
- Budget dots are colored by position.
- Focal min handle is blue-violet.
- Focal max handle is magenta.
- Focal slider was slimmed.
- Old macro-only toggle is being replaced with lens type selector.

Lens type options:
- おまかせ
- 単焦点
- ズーム
- マクロ

Expected behavior:
- Store selected lens type in localStorage as selectedLensType.
- Keep old isMacro localStorage compatibility.
- Macro behaves like the old macro toggle.
- Prime / Zoom / Macro are passed into the recommendation prompt.
- Auto does not constrain recommendations.

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

## Main files

For UI:
- src/components/ChatInterface.tsx
- src/app/globals.css

For recommendation cards:
- src/components/LensRecommendationCards.tsx

For warehouse:
- src/app/warehouse/page.tsx

## Image audit notes

Image audit tools:
- /image-audit
- npm run audit:images
- audit-output/ is ignored by Git

Purpose:
- Check missing images.
- Check whether images are lens bodies, not hoods/accessories.
- Contact sheets should remain local-only.

## Workflow rules

When Codex is unavailable:
- Use GitHub/repo as source of truth.
- Inspect files before proposing patches when possible.
- Prefer small copy-pasteable commands.
- Use python3, not python, on this Mac.
- Check branch/state before PR.
- If PR says no commits between branches, the patch did not apply or the branch equals main.

Useful commands:
- npm run dev:sync
- npm run dev:status
- npm run dev:check

Manual checks:
- npm run build
- npm run db:check
- npm run test:e2e

Restart local dev:
- lsof -ti:3000 | xargs kill -9 2>/dev/null || true
- rm -rf .next
- npm run dev

## Current handoff point

Current branch is likely add-lens-type-selector.

Before moving to a new chat:
1. Finish lens type selector.
2. Run checks.
3. Commit.
4. Push.
5. Create PR.
6. Merge.
7. Run npm run dev:sync.

Next likely work:
- Fine-tune lens type selector UI.
- Then modernize recommendation cards and warehouse page.
