# Deep review research: Sony FE 50mm F1.4 GM

## Status

- manual research draft
- not yet reflected in `lens_data.json`
- not yet reflected in API / Dify
- intended for future replacement of the current UI mock sample

## Research goal

このレンズの使いこなしレビューを、汎用アドバイスではなく、測定・レビュー傾向・比較に基づく事実ベースの攻略メモへ更新する。

現在のUI検証用サンプルは読みやすさ確認には十分だが、「大口径50mm一般」寄りの表現が残っている。次の更新では、Sony FE 50mm F1.4 GM固有の強みと弱点を、撮影時の判断へ翻訳する。

## Sources checked

| Source | URL / note | Checked items | Confidence |
| ------ | ---------- | ------------- | ---------- |
| Sony official specifications | https://www.sony.jp/ichigan/products/SEL50F14GM/spec.html / https://www.sony.com/electronics/support/lenses-e-mount-lenses/sel50f14gm/specifications | mount, format, size, weight, filter, MFD, magnification, aperture blades, OSS | high |
| Sony press release | https://www.sony.com.hk/press/pdf/20230221_e.pdf | release timing, positioning, XD Linear Motor / creator features | high |
| Lenstip: Sony FE 50mm F1.4 GM | https://www.lenstip.com/645.4-Lens_review-Sony_FE_50_mm_f_1.4_GM_Image_resolution.html and related chapters | resolution, CA, distortion, coma, astigmatism, bokeh, vignetting, flare, AF summary | high |
| Lenstip: Sigma 50mm F1.4 DG DN Art | https://www.lenstip.com/648.4-Lens_review-__Image_resolution.html and related chapters | comparison: resolution, CA, vignetting, flare, bokeh, mechanical vignetting | high |
| Lenstip: Sony FE 50mm F1.2 GM | https://www.lenstip.com/601.4-Lens_review-Sony_FE_50_mm_f_1.2_GM_Image_resolution.html | comparison: F1.2 GM resolution tendency | medium |
| TechRadar: Sony FE 50mm F1.4 GM | https://www.techradar.com/reviews/sony-fe-50mm-f14-gm-review | practical review tendency, high-resolution body use, sharpness across apertures | medium |
| Digital Camera World: Sony FE 50mm F1.4 GM | https://www.digitalcameraworld.com/reviews/sony-fe-50mm-f14-gm-review | practical review tendency, AF, compactness, fringing/distortion impressions | medium |
| Photography Blog: Sony FE 50mm F1.4 GM | https://www.photographyblog.com/reviews/sony_fe_50mm_f1_4_gm_review | CA, vignetting, flare, sunstars, distortion impressions | medium |
| Cameralabs: Sony FE 50mm F1.4 GM | https://www.cameralabs.com/sony-fe-50mm-f1-4-gm-review/ | field sharpness and bokeh impressions | medium |
| The Digital Picture | https://www.the-digital-picture.com/Reviews/Sony-FE-50mm-F1-4-GM-Lens.aspx | bokeh shape / cat's-eye tendency, practical comparison | medium |
| Focus Review | https://focus-review.com/en/review-sony-fe-50mm-f1-4-gm-2/ | profile correction, vignetting/distortion, LoCA tendency | medium |
| Fred Miranda / DPReview forums | examples: https://www.fredmiranda.com/forum/topic/1807861/39 | long-term user impressions and debate around F1.2 / F1.4 / Sigma positioning | low |

Confidence labels:

- high: 公式仕様または明確な測定データ
- medium: 複数レビューで一致する傾向
- low: 単独レビューや作例印象
- needs verification: まだ要確認

## 1. Official specifications

Based primarily on Sony official specifications.

| Item | Value | Notes |
| ---- | ----- | ----- |
| mount | Sony E-mount | Native FE lens |
| format | 35mm full frame | APS-C equivalent angle of view is 75mm |
| focal length | 50mm | Sony official angle of view: 47 degrees on full frame |
| max aperture | F1.4 | Minimum aperture F16 |
| aperture blades | 11 | Circular aperture |
| optical construction | 14 elements in 11 groups | Sony lists 11-14 |
| weight | approx. 516g | Lighter than FE 50mm F1.2 GM and many high-end 50mm options |
| length / diameter | 96mm / 80.6mm | Official max diameter x length |
| filter size | 67mm | Smaller than FE 50mm F1.2 GM's 72mm |
| minimum focus distance | 0.41m AF / 0.38m MF | Not a macro lens |
| maximum magnification | 0.16x AF / 0.18x MF | Useful for detail shots, but not close-up specialist |
| weather sealing | dust- and moisture-resistant construction | Treat as resistance, not waterproof |
| AF motor / controls | XD Linear Motors; aperture ring; focus hold button; AF/MF switch; de-click / lock controls reported by Sony and spec aggregators | Confirm exact number of XD motors before UI copy |
| optical stabilization | none | Sony notes body-integrated stabilization support |
| release timing | announced February 2023 | Sony press release date: 2023-02-21 |

Lens Navi interpretation:

- 516g / 67mm filter / 96mm length make this a "serious but carryable" 50mm F1.4.
- Minimum focus and magnification are practical, but this is not a half-macro or table-photo close-up lens.
- No optical stabilization is not a major issue on modern IBIS bodies, but video users on non-IBIS bodies should note it.

## 2. Resolution

### Evidence

- Lenstip measured Sony FE 50mm F1.4 GM on Sony A7R III / A7R II class 42MP RAW methodology.
- Lenstip reports the frame center is already over 75 lpmm at F1.4.
- Lenstip reports 88.6 lpmm at F2 and a center peak of 90.9 +/- 1.1 lpmm at F2.8.
- Lenstip describes APS-C edge performance as excellent, around 69 lpmm near maximum aperture and 78-79 lpmm stopped down.
- Lenstip reports full-frame edge around 58-59 lpmm at F1.4 / F2, with a peak around 66 lpmm by F5.6.
- Lenstip's Sigma 50mm F1.4 DG DN Art review reports roughly 47 lpmm in the center at F1.4, over 65 lpmm at F2, and about 80.8 lpmm around F2.8.
- Lenstip states the Sigma is noticeably weaker than the Sony FE 50mm F1.4 GM at practically every measured position / aperture, while still being an excellent lens for the price.
- Lenstip's own Sony FE 50mm F1.4 GM resolution chapter says the F1.4 GM peak exceeds the FE 50mm F1.2 GM's maximum MTF values, which were close to 80 lpmm in that test system.

### Interpretation

- This is not a lens where F1.4 is only for atmosphere. On Lenstip's data, F1.4 is already a high-resolution working aperture in the center and acceptable even toward the full-frame edge.
- F2 is the first "serious detail" step: it improves center resolution dramatically while keeping much of the F1.4 subject separation.
- F2.8 is the measured center peak. For product detail, texture, portraits with more reliable facial depth, and high-pixel bodies, F2.8 is the most defensible "detail first" aperture.
- For landscape / architecture where frame-wide stability matters, the full-frame edge behavior points to F5.6 as a strong target, with F8 as a safe practical setting when depth of field is needed.
- The Sigma comparison matters: Sigma is a high-value and sharp lens, but if the specific goal is "use F1.4 as a real resolution aperture," the Sony has stronger measurement support.
- The F1.2 GM comparison should not be written as "inferior." The F1.2 GM buys F1.2 rendering, depth, and subject separation. The F1.4 GM's argument is sharper measured performance at equal / stopped-down apertures with smaller size.

### Practical use

- 1人ポートレート: F1.4-F2. Use F1.4 when subject isolation is the priority; use F2 when eyelashes / both eyes / slight movement matter.
- 子供 / 家族: F1.8-F2.8. This is the better default than blindly using F1.4, because subject movement and shallow depth will dominate lens sharpness.
- 商品 / 質感重視: F2.8-F4. F2.8 is the measured center peak; F4 adds depth for small objects.
- 風景 / 建築: F5.6-F8. F5.6 is supported by full-frame edge peak behavior; F8 is useful when depth matters.
- F11以降: use for depth of field or sunstars only. Do not recommend it as the default "sharpest" setting.

## 3. Chromatic aberration

### Evidence

- Lenstip reports practically no longitudinal chromatic aberration problems, with only slight coloring even at F1.4 and in farther out-of-focus areas.
- Lenstip reports lateral chromatic aberration values never exceeding 0.04%, describing it as very low practically everywhere.
- Lenstip notes the Sony FE 50mm F1.4 GM is slightly better than the FE 50mm F1.2 GM in lateral CA in their measurements.
- Lenstip's Sigma 50mm F1.4 DG DN Art review reports slight longitudinal CA at F1.4, mostly disappearing by F2.0; lateral CA remains good, but Sony handles it marginally better.
- Photography Blog / TechRadar / Focus Review practical impressions also report little visible CA, though these are less controlled than Lenstip.

### Interpretation

- Do not write generic "white clothes / metal / water are dangerous" as the main story. For this lens, the evidence suggests CA is one of its better-corrected areas.
- The useful statement is: "色収差を理由にF1.4を避ける必要は少ない。ただし高コントラストのアウトフォーカス部では等倍確認する."
- Longitudinal CA is not absent in all imaginable cases, but measured and practical reviews do not support treating it as a major weakness.
- Lateral CA is low enough that UI copy can say correction is strong, while avoiding "zero" or "never appears."

### Practical use

- Backlit hair, chrome, white clothing, and water highlights: F1.4 can be used, but check high-contrast edges if the deliverable is critical.
- If fringing is visible in a specific frame, try F2 before abandoning the shot; Sigma data suggests LoCA behavior can improve quickly by F2, and Sony's LoCA starts from a stronger baseline.
- For normal family / portrait / event use, CA should not be presented as a reason to avoid wide open.

## 4. Vignetting

### Evidence

- Lenstip APS-C crop: about 29% (-0.97 EV) at F1.4, 13% (-0.41 EV) at F2, 6% (-0.19 EV) at F2.8.
- Lenstip full frame: about 63% (-2.89 EV) at F1.4, 47% (-1.84 EV) at F2, 39% (-1.42 EV) at F2.8, 32% (-1.11 EV) at F4, 26% (-0.87 EV) at F5.6, and 22% (-0.72 EV) from F8.
- Lenstip lists significant full-frame vignetting as a con.
- Lenstip comparison notes the bigger Sigma 50mm F1.4 DG DN Art measured worse: 67% (-3.23 EV) at F1.4 and still 45% (-1.75 EV) at F2.8.
- Photography Blog and Focus Review also observe visible wide-open vignetting and improvement with correction / stopping down.

### Interpretation

- Full-frame vignetting is the main measurable weakness to surface in the UI.
- It is not a deal-breaker for portraits, night street, or single-subject shots. It can even help frame the subject.
- It matters for product photography, flat reproductions, stitched panoramas, uniform walls, blue sky, and architecture.
- Corrections are likely routine in JPEG / RAW workflow, but corner exposure recovery can cost noise / dynamic range. Do not imply correction is free.

### Practical use

- Portrait / family: F1.4-F2 vignetting can be acceptable or desirable.
- Product / copy / uniform background: use correction and prefer F4-F8 if even illumination matters.
- Landscape with sky: expect correction at F5.6-F8 if the sky fills corners.
- APS-C bodies: vignetting is much less of an issue.

## 5. Distortion

### Evidence

- Lenstip APS-C distortion: -0.27%, effectively near zero within test margin.
- Lenstip full frame distortion: +0.60% pincushion, described as low and not concerning.
- Lenstip notes possible slight moustache distortion behavior because sign changes from APS-C to full-frame measurement.
- TechRadar / Digital Camera World practical reviews report little or no visible distortion.
- Focus Review reports that with lens profiles on, distortion is not a practical problem, but without profiles it can be more visible.

### Interpretation

- For portraits, family, street, and ordinary travel, distortion should not affect lens choice.
- For architecture / copy work, assume profile correction should stay on, and verify straight-line rendering if uncropped RAW is the deliverable.
- Do not claim "perfectly distortion-free"; say "low, usually handled by correction."

### Practical use

- People / snapshots: ignore in most cases.
- Architecture / interiors: keep correction enabled and avoid placing critical straight lines at the far edge if profile status is uncertain.
- Reproduction: this lens can be used, but a macro / flat-field lens remains the better tool if exact geometry matters.

## 6. Coma / astigmatism / night lights

### Evidence

- Lenstip says the Sony FE 50mm F1.4 GM does not have serious coma problems.
- Lenstip measures astigmatism at 2.7%, described as very low.
- Lenstip says the F1.4 GM fares much better than the FE 50mm F1.2 GM in astigmatism.
- Lenstip still calls coma "moderate" in the summary, not absent.
- The bokeh / mechanical vignetting section indicates off-axis point highlights can be affected by mechanical vignetting even stopped down by 2 EV.

### Interpretation

- This is credible for night street and point-light portraits.
- It is not the first recommendation for star fields because 50mm is narrow for general star landscape, full-frame vignetting is high wide open, and corner point rendering still needs direct astrophotography confirmation.
- For night city portraits, F1.4-F2 is usable; for cleaner point lights toward the edges, test F2-F2.8.

### Practical use

- 夜の街歩き / イルミネーション: F1.4-F2.8. Use F1.4 for subject separation; use F2-F2.8 when corner lights look stretched.
- 星空: needs verification. Start at F2-F2.8 if corners matter; choose wider lens for star landscape.
- 点光源の多い構図: place important lights away from extreme corners when shooting wide open.

## 7. Flare / ghosting / backlight

### Evidence

- Lenstip says the lens did not avoid problems with strong light; artifacts were mainly registered when the sun was inside the frame.
- Lenstip reports that when the sun moved just outside the frame, most reflections disappeared and contrast remained proper.
- Lenstip gives this category an average assessment.
- Lenstip's Sigma 50mm F1.4 DG DN Art flare chapter says Sigma performs better than the more expensive Sony in this specific category.
- Photography Blog says flare can appear when shooting directly into the sun even with hood, though mostly controlled.

### Interpretation

- Do not write "逆光に非常に強い." The evidence points to average / controlled but not exceptional flare resistance.
- For backlit portraits, the lens should be usable, but direct sun in frame needs attention.
- This is one of the few areas where Sigma can be framed as a valid practical alternative if the user shoots into strong light often.

### Practical use

- 半逆光ポートレート: safe starting point, especially when the sun is outside frame.
- 太陽を画面内に入れる: take a second framing; tiny angle changes may reduce ghosts.
- フード: use it, but do not assume it fully solves direct-sun artifacts.
- If shooting event / wedding against strong lights, inspect a few frames at the location.

## 8. Bokeh / rendering

### Evidence

- Sony official / spec sources: 11-blade circular aperture.
- Lenstip says out-of-focus areas are pleasing, light spread in circles is even, onion-ring bokeh is barely visible despite aspherical elements, and the brighter rim after stopping down is not especially intensive.
- Lenstip also notes mechanical vignetting can remain bothersome even after stopping down by 2 EV.
- The Digital Picture and Cameralabs note cat's-eye / corner defocused highlight shape caused by mechanical vignetting, especially wide open.
- Sigma Lenstip bokeh section says Sigma's onion-ring bokeh can be slightly visible and mechanical vignetting remains a noticeable issue; Sigma may fare a bit better than the smaller Sony in mechanical vignetting.
- Forum / user impressions sometimes frame FE 50mm F1.2 GM as smoother / more expressive, while FE 50mm F1.4 GM is the sharper and more balanced tool. Treat this as low-confidence until confirmed across more controlled comparisons.

### Interpretation

- The F1.4 GM's bokeh is strong enough for serious portrait / family work, but its measurable identity is not "maximum dreaminess"; it is "high wide-open sharpness plus pleasing bokeh."
- If the user wants the largest blur and rendering-first look, the FE 50mm F1.2 GM remains the comparison point.
- If the user wants cost-effective F1.4 bokeh, Sigma is valid, but Sony has stronger evidence for open-aperture resolution and CA control.
- Mechanical vignetting / cat's-eye bokeh should be explained as a corner highlight shape issue, not as a universal defect.

### Practical use

- F1.4: single subject, night street, background cleanup, subject separation.
- F2: more reliable face depth with still-strong blur.
- F2.8: family / children / half-body shots where eyes and facial plane matter.
- Background choice matters: the lens can render nicely, but busy branches / grids / LEDs near frame edges can still show shape and mechanical vignetting. Move the subject away from the background rather than only changing aperture.

## 9. AF / handling / video

### Evidence

- Sony and spec sources identify XD Linear Motor AF and internal focus.
- Lenstip summary lists autofocus as fast, silent, and accurate.
- TechRadar / Digital Camera World practical reviews also report fast / accurate / near-silent AF.
- Official specs list no optical stabilization; stabilization is body-side.
- Specs confirm aperture ring, compact 516g weight, 67mm filters, and 0.41m AF minimum focus.
- Video-specific focus breathing needs stronger confirmation. Some reviews mention creator features and smooth aperture control, but Lens Navi should not overstate breathing performance until checked.

### Interpretation

- For family / children, the key value is not just F1.4 brightness but Sony-native AF reliability with high wide-open resolution.
- 516g is a major handling advantage versus FE 50mm F1.2 GM and many DSLR-era 50mm F1.4 designs, but it is still a premium prime, not a pancake.
- For video, the aperture ring / de-click controls are useful; focus breathing and stabilization need user-body-specific confirmation.

### Practical use

- 子供 / 家族: F1.8-F2.8 with AF-C / Eye AF is the pragmatic default. Use F1.4 for slower moments.
- 動画: useful controls, quiet AF tendency, but verify focus breathing on the user's body and framing.
- ジンバル / 長時間: 516g is manageable, but not lightweight compared with FE 50mm F1.8 / FE 40mm F2.5 G.
- Close detail: minimum focus is decent; not suitable as a macro replacement.

## 10. Comparison notes

### Sigma 50mm F1.4 DG DN Art

- Evidence: Lenstip center resolution at F1.4 is around 47 lpmm; by F2 it exceeds 65 lpmm; by F2.8-F4 it reaches about 80 lpmm.
- Evidence: Lenstip says Sony FE 50mm F1.4 GM is noticeably stronger at almost every measured position / aperture, while Sigma remains excellent and much cheaper.
- Evidence: Sigma full-frame edge at F1.4 is below Lenstip's decency threshold, but improves by F1.6 / F2.
- Evidence: Sigma's full-frame vignetting is slightly worse than Sony's in Lenstip measurements, despite its larger size.
- Evidence: Sigma flare resistance is rated better than Sony's in Lenstip's comparison.
- Lens Navi interpretation: Sigma is the price / value challenger. Sony is the "F1.4から本気で使う" choice.

### Sony FE 50mm F1.2 GM

- Evidence: Lenstip's Sony FE 50mm F1.4 GM review states the F1.4 GM center peak exceeds the F1.2 GM's maximum MTF values in their test.
- Evidence: FE 50mm F1.2 GM is larger and heavier; it offers F1.2 brightness and blur.
- Medium-confidence practical interpretation: F1.2 GM is the rendering / blur / expression choice; F1.4 GM is the wide-open practical resolution and carryability choice.
- Do not write "F1.4 GM is better than F1.2 GM." Write: "優先価値が違う."

### Sony FE 50mm F1.8

- Needs verification for exact measurement comparison in this doc.
- Practical interpretation: use as budget / light first-50 option, but not as the benchmark for AF / wide-open resolution / build.

### 35mm class lenses

- Relevant when the user shoots indoors, family, or daily documentary.
- If the user often feels 50mm is tight indoors, compare FE 35mm F1.4 GM / FE 35mm F1.8 before pushing a premium 50mm.

### "F1.4を開放から使い切る" perspective

- Strong evidence supports this as the central value statement.
- Recommended phrasing: "F1.4を雰囲気用ではなく実用画質として使いやすい50mm."
- Avoid: "always shoot F1.4." Depth of field and subject motion still determine keeper rate.

## 11. Lens Navi interpretation draft

These are UI copy candidates. Use only after source checks are accepted.

### One-line verdict

F1.4開放から解像とボケを両立しやすい、Sony Eマウントの実用派50mm本命候補。

### Resolution use

開放F1.4から中央解像は非常に高く、F2でさらに大きく伸び、F2.8で中央ピークを狙える。人物の目元や質感を開放から狙える一方、画面全体の安定を求める風景・建築ではF5.6-F8を基準にしたい。

### Bokeh use

F1.4では背景整理と主役の立ち上がりが強い。玉ボケはおおむね整っているが、隅では口径食による形の変化が出やすい。F1.2 GMほどの大きなボケ量を買うレンズではなく、解像とボケの両立を買うレンズ。

### Aberration use

色収差は測定上かなりよく抑えられており、F1.4を避ける主因にはなりにくい。むしろ注意点はフルサイズ開放の周辺減光と、太陽を画面内に入れた時のゴースト。均一背景や商品撮影では補正前提、逆光では構図を少し振って確認したい。

### Landscape / stopped-down use

風景や建築ではF5.6-F8が扱いやすい。F11以降は深度や光芒が必要な場合に使い、解像目的だけで絞りすぎない。

### Buy if

- 50mmを主力画角にしたい
- F1.4を雰囲気用ではなく実用画質として使いたい
- 子供・家族・ポートレート・日常スナップでAFと開放画質を両立したい
- Sigmaより価格は上がっても、軽さ・純正AF・開放性能を重視したい

### Wait if

- 室内や日常で50mmが狭く感じる可能性がある
- 価格重視でSigma 50mm F1.4 DG DN Artを比較したい
- 最大のボケ量やF1.2の表現力が最優先
- 商品撮影や複写が中心で、50mm大口径よりマクロ / フラットフィールド性能が重要

## 12. Needs verification

- OpticalLimitsのSony FE 50mm F1.4 GM固有レビューは未確認。競合レビューからの間接情報のみ。
- Dustin Abbottの該当レビュー本文 / 動画で、解像・AF・動画・比較評価を確認したい。
- Phillip Reeve / asobinet / 国内レビューで、実写上のボケ質・逆光・周辺減光の受け止め方を確認したい。
- FE 50mm F1.2 GMとの比較は、Lenstip測定とユーザー印象が混ざるため、UIでは「用途の違い」として慎重に表現する。
- Focus breathingの程度はUI本文に入れるには根拠不足。Sony純正ボディのブリージング補正対応状況も要確認。
- AFについては測定よりレビュー傾向中心。低照度AFや子供撮影の実戦信頼性は追加レビューが必要。
- 星空用途の四隅は、Lenstipのcoma情報だけでは実戦星景レビューとして不十分。星景用途に強く推すなら追加確認が必要。
- Sony公式の防塵防滴は「配慮 / resistant」表現に留める。防水のように書かない。

## 13. Do not use yet

根拠が足りない限り、以下の表現はUI本文に使わない。

- "色収差はほぼゼロ"
- "逆光に非常に強い"
- "ボケは完璧"
- "Sigmaより全てにおいて上"
- "F1.2 GMより優れている"
- "最強の50mm"
- "星景にも安心して開放から使える"
- "動画向けにブリージングの心配がない"

Safer wording:

- "色収差は測定上かなり低く、通常撮影では大きな弱点になりにくい"
- "逆光は平均的。太陽を画面内に入れる構図では確認したい"
- "F1.2 GMは表現力、Sigmaは価格、50mm F1.4 GMは開放実用性と携帯性のバランス"
- "F1.4を開放から使いやすいが、子供・家族ではF1.8-F2.8も積極的に使う"
