# Deep Review research: Sony FE 135mm F1.8 GM

## Status

- manual research draft
- not yet reflected in `lens_data.json`
- not yet reflected in API / Dify
- not yet reflected in the warehouse UI
- intended as source material for future Lens Navi "使いこなしレビュー"

## Research goal

Sony FE 135mm F1.8 GM を、Lens Navi の「レンズ攻略本」形式へ落とし込むための根拠を整理する。

完成版レビューはまだ作らない。まずは、公式仕様・測定・レビュー傾向から、135mm F1.8を選ぶ理由と注意点を撮影判断へ翻訳する。

## Sources checked

| Source | URL / note | Checked items | Confidence |
| ------ | ---------- | ------------- | ---------- |
| Sony official specifications | https://www.sony.jp/ichigan/products/SEL135F18GM/spec.html / https://www.sony.com/electronics/support/lenses-e-mount-lenses/sel135f18gm/specifications | weight, filter, MFD, magnification, optical construction, OSS | high |
| Sony press release | https://www.sony.com.au/microsite/consumerpressreleases/articles/Press-release-Sony-announces-new-full-frame-135mm-F18-G-Master-prime.pdf | 0.7m MFD, 0.25x, four XD Linear Motors, 950g, controls, close-up capability | high |
| Lenstip: Sony FE 135mm F1.8 GM | https://www.lenstip.com/635.4-Lens_review-Sony_FE_135_mm_f_1.8_GM_Image_resolution.html and related chapters | resolution, CA, vignetting, coma, astigmatism, bokeh, flare, summary | high |
| Lenstip summary | https://www.lenstip.com/635.11-Lens_review-Sony_FE_135_mm_f_1.8_GM_Summary.html | strengths / weaknesses overview | high |
| Phillip Reeve | https://phillipreeve.net/blog/review-sony-fe-135mm-f1-8-gm/ | LoCA, bokeh, cat's-eye, rendering, Samyang comparison comments | medium |
| The Digital Picture | https://www.the-digital-picture.com/Reviews/Sony-FE-135mm-f-1.8-GM-Lens.aspx | wide-open sharpness, close focus, magnification, vignetting, focus breathing, AF, product / studio use | medium |
| TechRadar | https://www.techradar.com/reviews/sony-fe-135mm-f18-gm | practical handling, vignetting, CA control, portrait use | medium |
| Digital Camera World | https://www.digitalcameraworld.com/reviews/sony-fe-135mm-f18-gm-review | practical image quality, distortion / fringing / bokeh review tendency | medium |
| Amateur Photographer | https://amateurphotographer.com/review/sony-fe-135mm-f1-8-gm-review/ | resolution, vignetting, 0.25x close-up, portrait / action impressions | medium |
| Focus Review | https://focus-review.com/en/review-sony-fe-135mm-f1-8-gm-2/ | LoCA, bokeh, real-world rendering notes | medium |
| Reddit / Fred Miranda / forum discussions | examples: SonyAlpha discussions and Fred Miranda comparisons | long-term user impressions, Samyang / Sigma / Batis alternatives, rendering preference | low |

Confidence labels:

- high: 公式仕様または明確な測定データ
- medium: 複数レビューで一致する傾向
- low: 単独レビュー、フォーラム、長期使用印象
- needs verification: UI本文に入れるには追加確認が必要

## Basic specifications

| Item | Value | Notes |
| ---- | ----- | ----- |
| mount | Sony E-mount | Native FE lens |
| format | 35mm full frame | APS-C equivalent angle of view is 202.5mm |
| focal length | 135mm | Telephoto portrait / stage / compressed detail |
| max aperture | F1.8 | Minimum aperture F22 |
| aperture blades | 11 | Circular aperture |
| optical construction | 13 elements in 10 groups | XA, Super ED, ED elements in Sony materials |
| weight | approx. 950g | Serious carry, but lighter than some DSLR-era 135mm F1.8 alternatives |
| dimensions | approx. 89.5mm x 127mm | Large telephoto prime |
| filter size | 82mm | Pro-grade filter size; not small or cheap |
| minimum focus distance | 0.7m | Strong close-focus capability for 135mm |
| maximum magnification | 0.25x | Major practical differentiator vs many portrait primes |
| AF drive | four XD Linear Motors | Two motors per focus group, floating focus design |
| optical stabilization | none | Body-side stabilization only |
| controls | aperture ring, click on/off, focus range limiter, AF/MF switch, two focus hold buttons, Linear Response MF | Stills and movie operation controls |
| sealing | dust- and moisture-resistant design, fluorine front coating | Treat as resistance, not waterproof |
| release timing | announced February 2019 | Mature GM lens, no Mark II yet |

Lens Navi interpretation:

- 950g / 82mm filter means this is not a casual portrait lens.
- 0.7m / 0.25x is unusually useful for a 135mm F1.8 and gives it product detail / wedding detail / flower / compressed close-up value.
- Four XD Linear Motors are central to the lens's identity: 135mm F1.8 shallow depth plus moving subjects needs reliable AF.

## 🔍 解像とF値

### Evidence

- Lenstip reports extremely high resolution results and treats the lens as one of the strongest Sony FE lenses in its test ecosystem.
- Lenstip summary lists sensational center image quality from maximum aperture and excellent APS-C edge performance.
- Public Lenstip comment context around Samyang comparisons cites Sony FE 135mm F1.8 GM center values around 76 lpmm at F2.8 and 81 lpmm at F4, while also indicating weaker full-frame edge numbers than some newer alternatives when stopped down.
- The Digital Picture reports exceptional full-frame sharpness even wide open, with corner differences mostly showing vignetting clearing rather than a need to stop down for sharpness.
- Phillip Reeve notes very high contrast even wide open, with optical errors generally well corrected.
- Amateur Photographer and practical reviews consistently treat F1.8 performance as a major strength.

### Interpretation

- F1.8 is a real working aperture, not a soft portrait-effect setting.
- The practical appeal is "135mm compression + F1.8 blur + high open-aperture detail."
- For portraits, F1.8 can show eyes, hair, eyelashes, and fabric very strongly, but depth of field is thin enough that pose and focus placement matter more than lens sharpness.
- F2-F2.8 is the safer keeper-rate zone when both eyes, moving people, or small subject motion matter.
- F4-F5.6 are for frame-wide detail, product, studio, compressed landscape, or groups, not because F1.8 is weak.
- Edge performance should be phrased carefully: for portrait use the edges are rarely the subject, but for architecture / landscape-like work, compare stopped-down edge behavior with newer 135mm alternatives before final UI.

### Practical use

- 1人ポートレート: F1.8-F2. Use F1.8 when separation and compression are the point.
- 子供 / ペット / ステージ: F2-F2.8 for more reliable depth and tracking.
- 商品・花・圧縮ディテール: F2.8-F5.6.
- compressed landscape / stage detail: F4-F8 if frame-wide stability matters.
- F11以降: depth / light effect only. Do not present it as the default sharpness aperture.

## 🫧 ボケ

### Evidence

- Sony positions the lens around natural and beautiful background defocus.
- The 135mm focal length plus F1.8 aperture creates strong subject separation and compression compared with 85mm.
- Phillip Reeve notes the lens is highly corrected and contrasty wide open, producing a more neutral / less creamy transition than some less corrected lenses.
- Phillip Reeve and The Digital Picture both note cat's-eye shaped bokeh balls at frame edges wide open due to mechanical vignetting, improving as the lens is stopped down.
- Focus Review calls the bokeh beautiful at full aperture, while also discussing LoCA / rendering behavior.
- The Digital Picture shows wide-open cat's-eye behavior as normal for the class and notes rounded highlights when stopped down.

### Interpretation

- "なぜ135GMを選ぶのか" is primarily about distance and compression: it separates the subject from background more dramatically than 85mm without needing F1.4.
- The bokeh is not only "more blur." It changes working distance, background scale, and facial rendering.
- The lens is highly corrected, so the bokeh can look clean and neutral rather than dreamy / spherical-aberration-rich.
- If the user wants soft, vintage, swirly, or character-heavy bokeh, 135GM may feel too corrected.
- If the user wants clean subject isolation, event/stage reach, and strong compression, this is exactly the point.

### Practical use

- Outdoor portrait: choose F1.8-F2 for maximum separation when there is room to step back.
- Stage / ceremony: use F1.8-F2.8 to isolate people from cluttered backgrounds.
- Headshot: flattering compression, but working distance and communication become harder.
- Busy background: 135mm helps by enlarging and smoothing distant backgrounds; subject-background distance still matters.
- Point lights: check cat's-eye at edges if round bokeh balls are important.

## 🔬 収差

### Evidence

- Lenstip summary reports very good correction of longitudinal chromatic aberration.
- Phillip Reeve reports LoCA is very well controlled and appears mainly in harsh contrast.
- TechRadar notes ED and Super ED design elements for controlling chromatic aberration.
- The Digital Picture includes lateral CA examples and generally presents image quality as exceptional.
- Focus Review discusses LoCA behavior but treats the lens as strong overall.

### Interpretation

- CA should not be presented as a major weakness.
- At 135mm F1.8, high-contrast highlights, stage lights, backlit hair, jewelry, and white clothing can still reveal edge cases.
- The useful UI phrasing is: "F1.8から実用的に補正されているが、強い逆光や高輝度境界では確認."
- Spherical aberration is low enough that focus shift is not a practical story in the available reviews; The Digital Picture explicitly notes focus shift is not an issue.

### Practical use

- Portrait / wedding: use F1.8 without making CA a headline fear.
- Backlit hair / white dress / jewelry: inspect critical images.
- If fringing appears, try F2-F2.8 before giving up the compression look.

## 🔆 周辺減光・逆光

### Evidence

- The Digital Picture reports around 2 stops of corner shading at F1.8, reducing quickly when stopped down.
- Amateur Photographer notes vignetting pretty much disappears by F2.8.
- TechRadar reports visible vignetting wide open and notes it affects bokeh character.
- Phillip Reeve and The Digital Picture note mechanical vignetting / cat's-eye bokeh balls wide open near edges.
- Lenstip has dedicated coma / astigmatism / flare chapters and summary does not frame flare as the main weakness, but exact values should be recorded before final UI.

### Interpretation

- Wide-open vignetting is expected and often useful for portraits.
- For product, studio, copy-like work, and uniform backgrounds, use correction or stop down.
- Cat's-eye bokeh at the edges is a normal consequence of the design, not a defect, but it matters for night portraits and point-light backgrounds.
- Flare / ghosting should be treated as needing verification for direct sun / stage light work, not as a settled "very strong" claim.
- Coma / point-light behavior can matter for stage lights and night detail, but this is not primarily an astro lens.

### Practical use

- Portrait: vignetting can help direct attention.
- Product / studio detail: F2.8-F5.6 and correction.
- Night portraits: test edge bokeh shape if lights are important.
- Direct sun / stage lights: take backup framing and check ghosts.

## 📸 近接・倍率

### Evidence

- Sony official / press release: 0.7m minimum focus and 0.25x maximum magnification.
- The Digital Picture describes the 0.25x spec as best-in-class-level for the time and useful for product / studio details.
- The Digital Picture notes a subject around 138 x 94mm can fill the frame at minimum focus.
- Sony attributes close-up capability to dual autofocus groups in floating focus arrangement.

### Interpretation

- This is one of the lens's most important non-portrait strengths.
- 0.25x makes it much more useful for wedding details, flowers, accessories, products, hands, texture, and compressed close-ups than many portrait primes.
- It is not a macro replacement, but it is far more versatile than a typical long portrait prime.
- 135mm plus 0.25x can create compressed detail images that 85mm cannot mimic easily.

### Practical use

- Good: wedding rings in bouquet, flowers, hands, accessories, fashion details, product detail, compressed tabletop cuts.
- Conditional: small product catalog work; use macro if flatness / repeatability matter.
- Weak: true macro, copy work, tiny objects.

## 🎥 AF・動画

### Evidence

- Sony press release: four XD Linear Motors, two per focus group, designed for rapid, reliable AF tracking and quiet low-vibration operation.
- The Digital Picture reports smooth and quiet focusing with impressively consistent accuracy, including human and animal Eye AF continuous focus.
- The Digital Picture warns of a strong change in subject size through full focus adjustment, relevant to video focus pulls and critical framing.
- Sony press release lists aperture ring, Linear Response MF, focus limiter, and focus hold buttons for stills and movie operation.
- Forum and practical discussions generally treat Sony AF as a major advantage over third-party 135mm options, but long-term body-specific behavior needs verification.

### Interpretation

- For stills, AF is a major reason to choose the Sony 135GM: 135mm F1.8 leaves little room for focus error.
- For children, pets, stage, sports-adjacent portraits, and weddings, fast Eye AF / tracking is more important than raw MTF.
- For video, the optical quality and controls are attractive, but focus breathing / subject-size change is a real caution.
- Do not position it as a simple video-first lens without checking breathing on the target body and whether breathing compensation applies.

### Practical use

- Still portraits: strong choice for Eye AF and shallow-depth precision.
- Stage / event: reach and F1.8 speed are valuable; use focus limiter when possible.
- Video: good for controlled telephoto looks, but verify breathing and working distance.
- Gimbal / handheld: 950g plus 135mm framing makes stabilization and operator distance important.

## 📏 サイズ・重量

### Evidence

- Official specs: approx. 950g, 89.5mm x 127mm, 82mm filter.
- The Digital Picture lists the lens at 950g and highlights 82mm filters as common in pro kits but large / not cheap.
- Sony press release frames the lens as compact and lightweight for its class, but this is relative to 135mm F1.8 designs.
- OpticalLimits Viltrox 135mm F1.8 LAB review context notes Viltrox at 1.3kg, around 350g heavier than Sony 135GM.

### Interpretation

- 950g is heavy in everyday carry terms but reasonable for a high-performance 135mm F1.8.
- The real practical issue is not only weight: 135mm demands distance, communication, and enough room.
- Indoors, 135mm is often too tight. Outdoors or in large venues, it becomes a strength.
- Users should not buy this as a general portrait lens unless they already know they like longer working distances.

### Practical use

- Excellent: outdoor portraits, stage, wedding ceremony, compressed landscape / detail, larger studio.
- Conditional: indoor portraits, small rooms, family snapshots.
- Weak: travel-light, walkaround, tight indoor children photography.

## 85GM IIとの違い

### 85GM II

- More flexible portrait focal length.
- Easier communication distance.
- Better indoor / smaller-space usability.
- Modern AF / video integration and lower weight than 135GM.
- Better first portrait prime for most users.

### 135GM

- Stronger compression and background separation.
- More reach for stage, ceremony, outdoor portrait, and distant subject isolation.
- 0.25x close focus adds compressed detail and product / flower value.
- Less flexible indoors and harder for casual interaction.

### Lens Navi interpretation

85GM II is the safer portrait workhorse.

135GM is the more specialized compression / isolation / detail lens. It is not "better than 85mm"; it is for photographers who want the distance and look of 135mm.

## High confidence

- Official specs: approx. 950g, 82mm filter, 0.7m minimum focus, 0.25x maximum magnification.
- Optical construction: 13 elements in 10 groups; 11 aperture blades.
- AF drive: four XD Linear Motors with floating focus groups.
- F1.8 open aperture is genuinely usable; multiple sources describe very high sharpness / contrast wide open.
- 0.25x close focus is a major practical advantage and not a minor spec.
- The lens is portrait-first, but it has strong product / detail / flower / wedding-detail utility because of close focus and compression.
- Wide-open vignetting and cat's-eye bokeh near edges are expected and should be surfaced as handling notes.
- Focus breathing / subject-size change during focus adjustment is a meaningful video caution.
- 85GM II and 135GM solve different shooting problems: 85mm flexibility vs 135mm compression / reach.

## Needs verification

- Exact Lenstip numeric values for center / APS-C edge / full-frame edge at F1.8, F2.8, F4, and F5.6 should be recorded directly before final UI text.
- Exact Lenstip CA, vignetting, coma, astigmatism, and flare values should be copied into a future evidence table.
- OpticalLimits primary Sony 135GM review was not located in this pass; use primary page if available.
- Dustin Abbott / asobinet / long-term Japanese reviews should be added before final "攻略本" copy.
- Bokeh quality vs Samyang 135mm F1.8 and Sigma 135mm F1.8 DG HSM needs a dedicated comparison if Lens Navi recommends alternatives.
- Focus breathing should be checked on target Sony bodies; body-side breathing compensation support may vary.
- Whether edge resolution matters depends on usage. For portraits it is often irrelevant, but for compressed landscapes / product it may matter.

## Lens Navi暫定結論

Sony FE 135mm F1.8 GM 最大の強みは、F1.8開放からの高い解像と135mmならではの圧縮・分離感を、Sony純正AFで使えること。

最大の注意点は、950gの携帯負荷と135mmの作業距離。室内や日常の万能ポートレートには長すぎる場面が多い。

135GMを選ぶ理由は、85mmよりも背景を大きく引き寄せ、主役を強く切り出し、さらに0.25x近接で花・手元・商品・ウェディングディテールまで撮れること。

85GM IIとの違いは、85GM IIが柔軟な人物用ワークホース、135GMが屋外・ステージ・式典・圧縮表現・ディテール用途の専門性。どちらが上ではなく、撮影距離と背景処理の選び分けで考える。

まだ完成版レビューにはしない。次に進むなら、Lenstip各章の詳細数値、Dustin Abbott / asobinet / long-term reviews、Samyang 135mm F1.8との比較を追加確認する。
