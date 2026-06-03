# Deep Review research: Sony FE 85mm F1.4 GM II

## Status

- manual research draft
- not yet reflected in `lens_data.json`
- not yet reflected in API / Dify
- not yet reflected in the warehouse UI
- intended as source material for future Lens Navi "使いこなしレビュー"

## Research goal

Sony FE 85mm F1.4 GM II を、Lens Navi の「レンズ攻略本」形式へ落とし込むための根拠を整理する。

完成版レビューはまだ作らない。まずは、公式仕様・測定・レビュー傾向・GM I比較・Sigma比較から、撮影判断に使える材料を固定する。

## Sources checked

| Source | URL / note | Checked items | Confidence |
| ------ | ---------- | ------------- | ---------- |
| Sony official specifications | https://www.sony.com/electronics/support/lenses-e-mount-lenses/sel85f14gm2/specifications / https://www.sony.jp/ichigan/products/SEL85F14GM2/spec.html | weight, filter, MFD, magnification, optical construction, OSS | high |
| Sony press release | https://www.sony.com.hk/press/pdf/20240829_e.pdf | 20% lighter / 13% smaller than GM I, AF up to 3x faster, tracking up to 7x, 120fps support, video features | high |
| Sony operating instruction / spec mirror | https://www.bhphotovideo.com/lit_files/1156822.pdf | 0.85m AF / 0.80m MF, 0.11x AF / 0.12x MF, 642g, 77mm filter | high |
| Lenstip: Sony FE 85mm F1.4 GM II | https://www.lenstip.com/674.4-Lens_review-Sony_FE_85_mm_f_1.4_GM_II_Image_resolution.html and related chapters | resolution, CA, vignetting, coma, astigmatism, bokeh, flare, summary | high |
| Lenstip: Meike 85mm F1.4 FF STM | https://www.lenstip.com/680.4-Lens_review-__Image_resolution.html | comparison context: center peak vs edge performance | medium |
| Lenstip: Viltrox AF 85mm F1.4 Pro | https://www.lenstip.com/696.4-Lens_review-__Image_resolution.html | comparison context: resolution and value landscape | medium |
| TechRadar | https://www.techradar.com/cameras/camera-lenses/sony-fe-85mm-f14-gm-ii-review | practical sharpness, bokeh, AF, focus breathing, GM I upgrade judgment | medium |
| Digital Camera World | https://www.digitalcameraworld.com/reviews/sony-fe-85mm-f14-gm-ii-review | wide-open sharpness, bokeh, CA, AF, Sigma / GM I positioning | medium |
| The Digital Picture | https://www.the-digital-picture.com/Reviews/Sony-FE-85mm-F1-4-GM-II-Lens.aspx | practical handling and image quality impressions | medium |
| Photography Blog | https://www.photographyblog.com/reviews/sony_fe_85mm_f1_4_gm_ii_review | handling, filters, vignetting, image quality tendency | medium |
| ePHOTOzine | https://www.ephotozine.com/article/sony-fe-85mm-f-1-4-gm-ii-lens-review-37025 | lab-style sharpness / CA / vignetting impressions | medium |
| Amateur Photographer | https://amateurphotographer.com/review/sony-fe-85mm-f-1-4-gm-ii-review/ | field review, GM I comparison, portrait use | medium |
| SonyAlpha / DPReview / forum discussions | examples: Reddit and DPReview threads | long-term expectation, Sigma value debate, GM I owners' upgrade hesitation | low |

Confidence labels:

- high: 公式仕様または明確な測定データ
- medium: 複数レビューで一致する傾向
- low: 単独レビュー、フォーラム、長期使用印象
- needs verification: UI本文に入れるには追加確認が必要

## Basic specifications

| Item | Value | Notes |
| ---- | ----- | ----- |
| mount | Sony E-mount | Native FE lens |
| format | 35mm full frame | APS-C equivalent angle of view is 127.5mm |
| focal length | 85mm | Portrait short telephoto |
| max aperture | F1.4 | Minimum aperture F16 |
| aperture blades | 11 | Circular aperture |
| optical construction | 14 elements in 11 groups | Sony official specs list 11-14 |
| weight | approx. 642g | Sony says approx. 20% lighter than FE 85mm F1.4 GM |
| dimensions | approx. 84.7mm x 107.3mm | Sony official specs |
| filter size | 77mm | Same filter diameter as GM I |
| minimum focus distance | 0.85m AF / 0.80m MF | Not a close-up specialist |
| maximum magnification | 0.11x AF / 0.12x MF | Useful for portrait details, not macro |
| AF drive | 2 XD Linear Motors | Sony says up to 3x faster AF speed than GM I, and tracking up to 7x improved |
| optical stabilization | none | Body-integrated stabilization only |
| controls | aperture ring, click on/off, iris lock, AF/MF switch, two focus hold buttons, Linear Response MF | Video / portrait orientation operation is improved |
| sealing | dust- and moisture-resistant design, fluorine front coating | Treat as resistance, not waterproof |
| release timing | announced August 29, 2024; availability September 2024 | Sony press release |

Lens Navi interpretation:

- 642g is still a serious portrait lens, but the reduction from the original 85GM's approx. 820g changes real carry behavior.
- 0.85m AF / 0.11x means this is not a table-photo or macro replacement. It is a portrait-first lens.
- Two XD Linear Motors are a major practical reason to choose GM II over GM I, especially for moving subjects and video.

## 🔍 解像とF値

### Evidence

- Lenstip reports the frame center exceeds 70 lpmm already at F1.4.
- Lenstip reports a center result of 85.8 +/- 1.5 lpmm at F2.8, making it one of the highest Sony FE results in their 42MP test system at the time.
- Lenstip reports the edge of APS-C and full frame are already excellent near maximum aperture, around 64-65 lpmm, with stopped-down edge performance over 75 lpmm on APS-C edge and almost 69 lpmm on full-frame edge.
- Lenstip explicitly frames the gap vs older Sony 85mm lenses as very large: GM II at F1.4 is sharper than older system 85mm lenses near their stopped-down peak.
- Digital Camera World reports Mark II is highly sharp wide open and clearly improved at wide apertures vs GM I.
- TechRadar reports strong edge-to-edge resolution and practical wide-open sharpness.

### Interpretation

- F1.4 is not just for shallow depth. On measured evidence, it is a real working aperture for sharp eyes, eyelashes, hair, fabric, and portrait detail.
- F2-F2.8 is the practical maximum-detail / keeper-rate zone. F2.8 is the measured center peak in Lenstip's data.
- F5.6-F8 are not "because this lens needs stopping down"; they are for depth of field, frame-wide consistency, groups, or environmental portrait details.
- For high-pixel bodies, GM II's advantage over GM I is not subtle: the upgrade is especially meaningful if the user shoots F1.4-F2 and cares about fine detail.
- Do not write "needs F2.8 to become sharp." The point is that it is already strong at F1.4 and becomes record-class stopped down.

### Practical use

- 1人ポートレート: F1.4-F2. Use F1.4 when separation and rendering matter; use F2 when both eyes / slight motion matter.
- 動く人物・子供・ペット: F1.8-F2.8. AF is faster than GM I, but depth of field is still thin.
- 商品寄りのポートレート / 質感: F2.8-F4.
- 屋外ポートレート with environment: F4-F5.6 when clothing, background, and context matter.
- F8-F11: group depth / landscape-like use only. Do not present F8 as the default sharpness aperture.

## 🫧 ボケ

### Evidence

- Sony positions the lens as keeping G Master bokeh while improving resolution.
- Sony specs include an 11-blade circular aperture and two XA elements.
- Lenstip summary lists sensational image quality and improved GM replacement; bokeh chapter should be checked directly before final UI copy.
- TechRadar reports beautiful soft bokeh, nice focus fall-off, no bokeh fringing in its sample experience, and cat's-eye bokeh near edges.
- Digital Camera World reports smoother bokeh than the original lens and good transition from focus to defocus.
- Practical reviews generally frame the lens as a portrait lens whose update improves sharpness without giving up bokeh.

### Interpretation

- "85GM IIを選ぶ理由" is not only sharpness. It is wide-open detail plus smooth enough portrait rendering plus faster AF.
- Compared with GM I, the risk is that some users loved the older lens's slightly less corrected, character-heavy rendering. GM II should be framed as more modern and controlled, not automatically "more beautiful" for every taste.
- Cat's-eye / mechanical vignetting near edges remains a normal wide-aperture portrait-lens behavior; do not imply perfect round balls across the frame at F1.4.
- For most portraits, the stronger open sharpness and smoother fall-off are a practical win.

### Practical use

- F1.4: headshots, bust-up portraits, background separation, low light, signature 85mm look.
- F2: stronger keeper rate while keeping a strong blur.
- F2.8: half-body / movement / fashion where face, clothes, and pose need more reliable depth.
- Busy backgrounds: increase subject-background distance before only changing aperture.
- Point lights near corners: check cat's-eye shape if round bokeh balls matter.

## 🔬 収差

### Evidence

- Lenstip summary reports very good correction of longitudinal chromatic aberration.
- Digital Camera World reports minimal axial chromatic aberration / bokeh fringing.
- TechRadar reports no bokeh fringing in its sample set, including attempts to provoke it.
- Sony claims ED elements and refined optics reduce aberrations.
- Lenstip's detailed chromatic aberration chapter should be recorded directly before final numeric UI copy.

### Interpretation

- CA is not the headline weakness of GM II. The better story is: "F1.4 portrait use with fewer color-fringe distractions than older fast 85mm expectations."
- Do not write "色収差ゼロ." High contrast hair, jewelry, backlit edges, and specular highlights can still produce edge cases.
- Compared with GM I, the consistent review tendency is that GM II is better controlled and more modern.

### Practical use

- Backlit hair / white clothing: F1.4 is usable, but inspect critical files.
- If high-contrast fringing appears, try F2 before abandoning the look.
- For wedding / portrait delivery, CA should not be the reason to avoid wide-open use.

## 🔆 周辺減光・逆光

### Evidence

- TechRadar and other reviews show / discuss cat's-eye bokeh near frame edges, which overlaps with mechanical vignetting behavior.
- Lenstip has a dedicated vignetting chapter and summary says APS-C vignetting is slight; full-frame wide-open values should be copied directly before final UI.
- Sony press release claims Nano AR Coating II and improved coatings for flare / ghosting reduction.
- Digital Camera World reports resistance to ghosting and flare is enhanced vs GM I.
- Some practical reviews report improved flare handling compared with the original lens, but strong direct-light work should still be verified with examples.

### Interpretation

- Wide-open vignetting is expected for an 85mm F1.4 portrait lens and may help draw attention to faces.
- Do not present vignetting as a deal-breaker for portraits. Present it as a correction / taste issue.
- For product, copy, flat background, sky, or stitched scenes, correction is more important.
- Flare / ghosting appears improved over GM I, but Lens Navi should avoid claiming "very strong against all backlight" until direct controlled sources are added.

### Practical use

- Portrait: vignetting can be useful.
- Studio product / uniform wall: use correction and consider F2.8-F5.6.
- Direct sun / stage lights: take a backup framing; inspect ghosts before finalizing.
- Night point lights: check corner cat's-eye and mechanical vignetting at F1.4.

## 📸 近接・倍率

### Evidence

- Official specs: 0.85m AF / 0.80m MF minimum focus.
- Official specs: 0.11x AF / 0.12x MF maximum magnification.
- GM I has very similar close-focus numbers, so close-up performance is not the main upgrade story.

### Interpretation

- This lens is not for table-photo versatility. It is a portrait / short-tele lens.
- 0.12x can handle face details, hands, accessories, bouquet, hair, clothing texture, and environmental detail shots.
- Food, small products, rings, or copy work should not be a primary recommendation reason.

### Practical use

- Good: headshots, hands, jewelry worn by subject, fashion details, wedding bouquet.
- Conditional: food / table details if the framing is loose.
- Weak: tiny product, macro-style detail, flat lay.

## 🎥 AF・動画

### Evidence

- Sony press release: AF speed up to 3x faster than GM I and tracking performance up to 7x improved compared with GM I, under Sony test conditions.
- Sony press release: keeps up with Alpha 9 III 120fps continuous shooting.
- Sony press release: focus breathing is minimal and in-body breathing compensation is supported.
- TechRadar tested difficult moving subjects and found the faster AF meaningful for eye focus; it also showed focus breathing examples and notes some scale change.
- Digital Camera World reports noticeably quicker AF than the original lens.
- GM I used Ring SSM and was often criticized for slower / noisier AF in long-term user discussions; GM II's XD Linear Motor system is a major operational update.

### Interpretation

- AF and video are where GM II has the clearest practical reason to replace GM I.
- For portraits, the improvement is about catching expression, movement, pets, children, weddings, and event moments.
- For video, GM II is much more credible than GM I, but breathing compensation depends on body support.
- Do not claim focus breathing is absent. Say "improved / controlled, but verify on target body."

### Practical use

- Still portraits: Eye AF at F1.4 becomes more dependable than GM I.
- Children / pets: F1.8-F2.8 may be better than always using F1.4, even with faster AF.
- Video: use de-click aperture, Linear Response MF, and test breathing compensation.
- High-speed bodies: GM II is designed to keep up with modern Sony AF / burst systems; GM I is not the best match for that use.

## 📏 サイズ・重量

### Evidence

- GM II: approx. 642g, 84.7mm x 107.3mm, 77mm filter.
- GM I: approx. 820g, 89.5mm x 107.5mm, 77mm filter.
- Sony press release says GM II is approx. 20% lighter and 13% smaller in volume.
- TechRadar and Digital Camera World both highlight the weight reduction as meaningful, while noting it remains a large premium prime.
- Sigma 85mm F1.4 DG DN Art is often discussed as a value competitor around the same broad weight class, but with lower price and third-party AF / system tradeoffs.

### Interpretation

- The weight reduction changes use: less fatigue, easier vertical shooting, better event / wedding carry, and better balance on smaller Alpha bodies.
- It is not a compact 85. Users wanting lightweight should compare FE 85mm F1.8 or smaller 90mm-class alternatives.
- Compared with Sigma 85 DG DN, GM II's premium is less about weight and more about Sony-native AF / burst / video integration plus GM rendering.

### Practical use

- All-day portrait / wedding: GM II is meaningfully easier than GM I.
- Travel light: still heavy; consider FE 85mm F1.8.
- Pro Sony body / high-speed shooting: GM II makes more sense than GM I and often more sense than third-party options.

## GM Iとの比較

### 解像

- GM II is substantially stronger wide open and across the frame.
- GM I can still make beautiful portraits, especially if the user likes its rendering and does not need maximum F1.4 detail.
- Upgrade if high-pixel bodies, F1.4-F2 use, or edge-to-edge confidence matter.

### ボケ

- GM II keeps smooth portrait bokeh while improving correction and sharpness.
- Some GM I users may prefer the older rendering character. Treat this as taste, not measurable superiority.
- Upgrade if the user wants cleaner wide-open files without losing portrait softness.

### AF

- GM II's two XD Linear Motors are the biggest operational upgrade.
- Sony claims up to 3x faster AF and up to 7x tracking improvement vs GM I.
- GM I can remain acceptable for posed portraits, but GM II is the better tool for moving subjects.

### 動画

- GM II adds a much stronger video case: faster / quieter AF, click/de-click aperture, Linear Response MF, breathing compensation support.
- GM I's slower / noisier AF reputation makes it less attractive for modern hybrid use.
- Upgrade if video, focus pulls, or quiet operation matter.

### サイズ重量

- GM II: 642g.
- GM I: approx. 820g.
- The reduction is meaningful for weddings, long portrait sessions, and smaller bodies.

### 実運用

- Why upgrade to GM II:
  - F1.4 open sharpness matters.
  - AF speed / tracking matters.
  - Video / hybrid use matters.
  - Weight and handling affect session fatigue.
  - High-resolution bodies expose GM I limitations.

- Why keep GM I:
  - Posed portraits are the main use.
  - The user likes GM I's rendering.
  - Budget is better spent on another focal length.
  - AF speed / video / weight are not current pain points.
  - Used value drop makes replacement cost hard to justify.

## Sigma 85mm F1.4 DG DN Artとの立ち位置

- Sigma 85mm F1.4 DG DN Art remains the value comparison.
- It is optically strong enough that budget-sensitive users should compare it seriously.
- GM II's case is Sony-native AF integration, high-speed body compatibility, video controls, GM handling, and the combination of wide-open sharpness plus portrait rendering.
- If the user shoots mostly slow posed portraits and price matters, Sigma can be the rational choice.
- If the user shoots weddings, children, pets, moving portrait sessions, or video on Sony bodies, GM II's operational advantages are easier to justify.

## High confidence

- Official specs: 642g, 77mm filter, 0.85m AF / 0.80m MF minimum focus, 0.11x AF / 0.12x MF maximum magnification.
- Optical construction: 14 elements in 11 groups; 11 aperture blades.
- AF drive: two XD Linear Motors.
- Sony states AF speed is up to 3x faster than GM I and tracking performance up to 7x improved, under Sony test conditions.
- Sony states GM II is approx. 20% lighter and 13% smaller in volume than GM I.
- Lenstip reports F1.4 center resolution over 70 lpmm and a F2.8 center peak of 85.8 lpmm.
- Lenstip reports excellent edge performance, including strong full-frame edge values near maximum aperture.
- Multiple practical reviews agree GM II is sharper wide open and faster focusing than GM I.
- GM II is a portrait-first lens; close-up / table-photo use is not a primary strength.

## Needs verification

- Exact Lenstip values for longitudinal CA, lateral CA, full-frame vignetting, distortion, coma, astigmatism, and flare should be recorded directly before final UI text.
- OpticalLimits primary review should be checked directly if available, not only secondary mentions.
- Phillip Reeve, Dustin Abbott, asobinet, and long-term Japanese reviews should be added before final "攻略本" copy.
- Whether GM II bokeh is "better" than GM I is partly subjective. UI should frame it as smoother / more controlled only when sources align.
- Focus breathing should be verified on target Sony bodies because breathing compensation support changes practical video evaluation.
- Sigma 85mm F1.4 DG DN Art comparison needs a dedicated measurement-backed note if Lens Navi makes direct buy recommendations.
- Long-term reliability / copy variation should not be inferred from early reviews.

## Lens Navi暫定結論

Sony FE 85mm F1.4 GM II 最大の強みは、F1.4開放から高い解像を出しながら、85mmらしいボケとSony純正AFの追従性を両立したこと。

最大の注意点は、価格と用途の狭さ。642gに軽量化されても、85mm F1.4は日常万能レンズではなく、ポートレート中心の道具として考えるべき。

GM Iとの違いは、描写の好みよりも、開放解像・AF速度・動画適性・軽量化という実運用の改善が大きい。GM Iで静止ポートレート中心なら買い替え必須ではないが、動く人物、子供、ペット、ウェディング、動画ではGM IIの意味が出る。

Sigma 85 DG DNとの立ち位置は、価格対性能のSigma、Sony純正AF / 高速連写 / 動画連携 / GM操作性のGM II。Lens Naviでは「最高のSony純正85mmが必要か」「価格を抑えて高画質な85mmが欲しいか」で分ける。

まだ完成版レビューにはしない。次に進むなら、OpticalLimits / Dustin Abbott / Phillip Reeve / asobinet / Sigma 85 DG DN の直接比較を追加確認する。
