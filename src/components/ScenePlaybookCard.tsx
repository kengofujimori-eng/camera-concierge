"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  ScenePlaybookCard as ScenePlaybookCardType,
  ScenePlaybookConditionDecisionFlow,
  ScenePlaybookDecisionFlow,
} from "@/data/scenePlaybooks";

const SCENE_GUIDE_HANDOFF_KEY = "lensNaviSceneGuideHandoff";

const FOCAL_LENGTH_RAILS: Record<
  string,
  { value: string; meaning: string }[]
> = {
  "family-photography": [
    { value: "35mm", meaning: "室内広め" },
    { value: "50mm", meaning: "自然な距離" },
    { value: "85mm", meaning: "屋外ポートレート" },
    { value: "135mm", meaning: "背景整理" },
  ],
  "recital-stage": [
    { value: "85mm", meaning: "前方席" },
    { value: "135mm", meaning: "中距離" },
    { value: "70-200mm", meaning: "安全ズーム" },
    { value: "200mm+", meaning: "後方席" },
  ],
  "sports-day": [
    { value: "85-135mm", meaning: "近距離" },
    { value: "70-200mm", meaning: "標準望遠" },
    { value: "100-400mm", meaning: "遠距離" },
    { value: "200mm+", meaning: "望遠側" },
  ],
  "travel-outing": [
    { value: "20-70mm", meaning: "広く残す" },
    { value: "24-70mm", meaning: "万能標準" },
    { value: "35mm", meaning: "街歩き" },
    { value: "50mm", meaning: "人物自然" },
    { value: "85mm", meaning: "きれいに切り出す" },
    { value: "便利ズーム", meaning: "撮り逃し防止" },
  ],
};

type SceneGuideHandoff = {
  source: "scene-guide";
  sceneId: string;
  sceneLabel: string;
  selectedConditions: {
    key: string;
    label: string;
    value: string;
  }[];
  derivedLensConditions: {
    focalRangeLabel: string;
    lensTypeLabel: string;
    priorities: string[];
    cautions: string[];
  };
  candidateRoles: {
    role: "main" | "secondary" | "safe" | "conditional";
    label: string;
    reason: string;
  }[];
  generatedPrompt: string;
  createdAt: string;
};

type ScenePlaybookCardProps = {
  playbook: ScenePlaybookCardType;
  isOpen?: boolean;
  isSelected?: boolean;
  onOpen?: (id: string) => void;
};

function Chip({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
      {children}
    </span>
  );
}

export function ScenePlaybookCard({
  playbook,
  isOpen = false,
  isSelected = false,
  onOpen,
}: ScenePlaybookCardProps) {
  const router = useRouter();
  const hasDetail = Boolean(playbook.detail);
  const keyDecisions = playbook.keyDecisions.slice(0, 3);
  const focalRanges = playbook.representativeFocalRanges.slice(0, 4);
  const lensRoles = playbook.mainLensRoles.slice(0, 3);

  function handoffToConsultation(handoff: SceneGuideHandoff) {
    try {
      sessionStorage.setItem(SCENE_GUIDE_HANDOFF_KEY, JSON.stringify(handoff));
    } catch {
      // The consultation handoff is optional; keep the Scene Guide usable.
    }
    router.push("/");
  }

  return (
    <article
      data-testid={`scene-playbook-card-${playbook.id}`}
      className={`group flex h-full flex-col overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md dark:bg-slate-950 dark:hover:border-white/20 ${
        isSelected
          ? "border-violet-200 ring-2 ring-violet-200/70 dark:border-violet-400/30 dark:ring-violet-400/20"
          : "border-slate-200 dark:border-white/10"
      }`}
    >
      <div className="h-1 bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-500" />

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-200">
            撮影ガイド
          </span>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            {playbook.shortTitle}
          </span>
        </div>

        <div className="space-y-3">
          <h2
            data-testid={`scene-playbook-title-${playbook.id}`}
            className="text-xl font-semibold tracking-normal text-slate-950 dark:text-white"
          >
            {playbook.title}
          </h2>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            {playbook.headline}
          </p>
        </div>

        <div className="mt-5 space-y-4">
          <section aria-label="判断軸" className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              判断軸
            </p>
            <div className="flex flex-wrap gap-2">
              {keyDecisions.map((decision) => (
                <Chip key={decision}>{decision}</Chip>
              ))}
            </div>
          </section>

          <section aria-label="代表焦点距離" className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              代表焦点距離
            </p>
            <div className="flex flex-wrap gap-2">
              {focalRanges.map((range) => (
                <Chip key={range}>{range}</Chip>
              ))}
            </div>
          </section>

          <section aria-label="レンズの役割" className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              レンズの役割
            </p>
            <div className="space-y-2">
              {lensRoles.map((role) => (
                <div
                  key={role.label}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]"
                >
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {role.label}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-600 dark:text-slate-400">
                    {role.role}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
          {playbook.primaryCaution}
        </div>

        <div className="mt-auto pt-5">
          <button
            type="button"
            data-testid={`scene-playbook-open-${playbook.id}`}
            onClick={() => {
              if (hasDetail) {
                onOpen?.(playbook.id);
              }
            }}
            disabled={!hasDetail}
            aria-expanded={hasDetail ? isOpen : undefined}
            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              hasDetail
                ? "border-slate-200 bg-white text-slate-700 group-hover:border-violet-200 group-hover:text-violet-700 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200 dark:group-hover:border-violet-400/30 dark:group-hover:text-violet-200"
                : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-500"
            }`}
          >
            {hasDetail
              ? isOpen
                ? "撮影判断を閉じる"
                : "撮影判断を見る"
              : "要点のみ表示中"}
          </button>
        </div>

        {isOpen && playbook.detail ? (
          <div
            data-testid={`scene-guide-detail-${playbook.id}`}
            className="mt-4 space-y-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-3.5 text-sm text-slate-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 sm:p-4"
          >
            {playbook.detail.conditionDecisionFlow ? (
              <ConditionDecisionFlow
                flow={playbook.detail.conditionDecisionFlow}
                sceneId={playbook.id}
                sceneLabel={playbook.title}
                onConsult={
                  playbook.id === "recital-stage" ||
                  playbook.id === "sports-day" ||
                  playbook.id === "travel-outing"
                    ? handoffToConsultation
                    : undefined
                }
              />
            ) : playbook.detail.decisionFlow ? (
              <DecisionFlow
                flow={playbook.detail.decisionFlow}
                sceneId={playbook.id}
                sceneLabel={playbook.title}
                onConsult={handoffToConsultation}
              />
            ) : (
              <StandardDetail detail={playbook.detail} />
            )}

            <button
              type="button"
              data-testid={`scene-guide-detail-close-${playbook.id}`}
              onClick={() => onOpen?.(playbook.id)}
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white"
            >
              閉じる
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function ConditionDecisionFlow({
  flow,
  sceneId,
  sceneLabel,
  onConsult,
}: {
  flow: ScenePlaybookConditionDecisionFlow;
  sceneId: string;
  sceneLabel: string;
  onConsult?: (handoff: SceneGuideHandoff) => void;
}) {
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        flow.controls.map((control) => [control.key, control.defaultValue]),
      ),
  );
  const resultKey = flow.controls
    .map((control) => selectedValues[control.key])
    .join("|");
  const result = flow.results[resultKey];
  const selectedConditions = flow.controls.map((control) => {
    const value = selectedValues[control.key];
    const option = control.options.find((item) => item.value === value);

    return {
      key: control.key,
      label: control.label,
      value: option?.label ?? value,
    };
  });

  return (
    <>
      <section className="rounded-2xl border border-violet-200 bg-white px-3 py-2.5 dark:border-violet-400/20 dark:bg-slate-950/60">
        <p className="text-xs font-semibold text-violet-700 dark:text-violet-200">
          {flow.heading ?? "撮影シーンでまず見ること"}
        </p>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-700 dark:text-slate-200">
          {flow.premise}
        </p>
      </section>

      <section className="space-y-2.5">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          撮影条件を選ぶ
        </p>
        <div className="grid gap-2.5 lg:grid-cols-3">
          {flow.controls.map((control) => (
            <fieldset
              key={control.key}
              className="min-w-0 rounded-2xl border border-slate-200 bg-white/70 p-2 dark:border-white/10 dark:bg-slate-950/40"
            >
              <legend className="px-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {control.label}
              </legend>
              <div className="flex flex-wrap gap-1.5">
                {control.options.map((option) => {
                  const isSelected =
                    selectedValues[control.key] === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      data-testid={`scene-guide-condition-${control.key}-${option.value}`}
                      aria-pressed={isSelected}
                      onClick={() =>
                        setSelectedValues((current) => ({
                          ...current,
                          [control.key]: option.value,
                        }))
                      }
                      className={`whitespace-nowrap rounded-full border px-2.5 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 ${
                        isSelected
                          ? "border-violet-300 bg-violet-50 text-violet-900 shadow-sm dark:border-violet-400/40 dark:bg-violet-400/10 dark:text-violet-100"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:border-white/20"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      {result ? (
        <>
          <section className="space-y-2.5" aria-live="polite">
            <FocalLengthRail
              sceneId={sceneId}
              primary={result.primary}
              secondary={result.secondary}
              safe={result.safe}
            />
            <FocalRecommendation
              sceneId={sceneId}
              primary={result.primary}
              secondary={result.secondary}
              safe={result.safe}
              primaryReason={result.reason}
            />
          </section>

          <section className="rounded-2xl border border-amber-200/70 bg-amber-50/50 px-3 py-2 dark:border-amber-400/15 dark:bg-amber-400/[0.06]">
            <p className="line-clamp-2 text-[11px] leading-5 text-amber-800/80 dark:text-amber-200/80">
              <span className="mr-1 font-semibold">補足:</span>
              {result.caution}
            </p>
          </section>

          {onConsult ? (
            <ConsultationHandoffButton
              onClick={() =>
                onConsult(
                  createConditionHandoff(
                    sceneId,
                    sceneLabel,
                    selectedConditions,
                    result,
                  ),
                )
              }
            />
          ) : null}
        </>
      ) : null}
    </>
  );
}

function normalizeFocalLength(value: string) {
  return value === "200mm以上" ? "200mm+" : value;
}

function FocalLengthRail({
  sceneId,
  primary,
  secondary,
  safe,
}: {
  sceneId: string;
  primary: string;
  secondary?: string;
  safe?: string;
}) {
  const rail = FOCAL_LENGTH_RAILS[sceneId] ?? [];
  const normalizedPrimary = normalizeFocalLength(primary);
  const normalizedSecondary = secondary
    ? normalizeFocalLength(secondary)
    : undefined;
  const normalizedSafe = safe ? normalizeFocalLength(safe) : undefined;

  if (rail.length === 0) {
    return null;
  }

  return (
    <section className="space-y-2">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
        焦点距離の目安
      </p>
      <div
        className={`relative grid gap-1.5 ${
          rail.length > 4 ? "grid-cols-3 sm:grid-cols-6" : "grid-cols-4"
        }`}
      >
        <div
          className={`absolute left-3 right-3 top-3 h-px bg-slate-200 dark:bg-white/10 ${
            rail.length > 4 ? "hidden sm:block" : ""
          }`}
        />
        {rail.map((item) => {
          const isPrimary = item.value === normalizedPrimary;
          const isSecondary = item.value === normalizedSecondary;
          const isSafe = item.value === normalizedSafe;
          const isRelevant = isPrimary || isSecondary || isSafe;

          return (
            <div
              key={item.value}
              className="relative flex min-w-0 flex-col items-center text-center"
            >
              <span
                className={`relative z-10 block rounded-full border-4 border-slate-50 transition-all dark:border-slate-900 ${
                  isPrimary
                    ? "size-8 bg-violet-600 shadow-sm shadow-violet-300 dark:bg-violet-400"
                    : isRelevant
                      ? "mt-0.5 size-7 bg-violet-300 dark:bg-violet-500/70"
                      : "mt-1 size-6 bg-slate-200 dark:bg-slate-700"
                }`}
              />
              <span
                className={`mt-1 whitespace-nowrap text-[10px] font-semibold sm:text-xs ${
                  isPrimary
                    ? "text-violet-800 dark:text-violet-100"
                    : isRelevant
                      ? "text-slate-700 dark:text-slate-300"
                      : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {item.value}
              </span>
              <span
                className={`mt-0.5 min-h-6 text-[9px] leading-3 sm:text-[10px] ${
                  isPrimary
                    ? "font-semibold text-violet-700 dark:text-violet-200"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {item.meaning}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function getFocalMeaning(sceneId: string, value: string) {
  const normalizedValue = normalizeFocalLength(value);
  return (
    FOCAL_LENGTH_RAILS[sceneId]?.find(
      (item) => item.value === normalizedValue,
    )?.meaning ?? "撮影条件に合わせる"
  );
}

function getSafeMeaning(value: string) {
  if (value === "便利ズーム") {
    return "撮り逃し防止";
  }
  if (value.includes("70-200")) {
    return "構図変更に強い";
  }
  if (value.includes("100-400") || value.includes("200mm")) {
    return "距離不足を避ける";
  }
  return "焦点距離に余裕";
}

function FocalRecommendation({
  sceneId,
  primary,
  secondary,
  safe,
  primaryReason,
}: {
  sceneId: string;
  primary: string;
  secondary?: string;
  safe?: string;
  primaryReason: string;
}) {
  const supportingRoles = [
    {
      label: "次点",
      value: secondary,
      meaning: secondary ? getFocalMeaning(sceneId, secondary) : "",
    },
    {
      label: "安全策",
      value: safe,
      meaning: safe ? getSafeMeaning(safe) : "",
    },
  ].filter(
    (role): role is { label: string; value: string; meaning: string } =>
      Boolean(role.value),
  );

  return (
    <section className="space-y-2">
      <div className="rounded-2xl border border-violet-200 bg-violet-50/70 px-3.5 py-3 dark:border-violet-400/30 dark:bg-violet-400/10">
        <p className="text-[10px] font-semibold text-violet-700 dark:text-violet-200">
          この条件の本命
        </p>
        <div className="mt-0.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="text-2xl font-semibold tracking-normal text-violet-950 dark:text-white">
            {primary}
          </p>
          <p className="text-xs font-semibold text-violet-700/80 dark:text-violet-200/80">
            {getFocalMeaning(sceneId, primary)}
          </p>
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
          {primaryReason}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {supportingRoles.map((role) => (
          <div
            key={`${role.label}-${role.value}`}
            className="inline-flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-700 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-300"
          >
            <span className="text-[10px] font-semibold opacity-60">
              {role.label}
            </span>
            <span className="whitespace-nowrap text-sm font-semibold">
              {role.value}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {role.meaning}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function DecisionFlow({
  flow,
  sceneId,
  sceneLabel,
  onConsult,
}: {
  flow: ScenePlaybookDecisionFlow;
  sceneId: string;
  sceneLabel: string;
  onConsult: (handoff: SceneGuideHandoff) => void;
}) {
  const [selectedCondition, setSelectedCondition] = useState(
    flow.branches[0]?.condition,
  );
  const selectedBranch =
    flow.branches.find((branch) => branch.condition === selectedCondition) ??
    flow.branches[0];

  return (
    <>
      <section className="rounded-2xl border border-violet-200 bg-white px-3 py-2.5 dark:border-violet-400/20 dark:bg-slate-950/60">
        <p className="text-xs font-semibold text-violet-700 dark:text-violet-200">
          家族写真でまず見ること
        </p>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-700 dark:text-slate-200">
          {flow.premise}
        </p>
      </section>

      <section className="space-y-2.5">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          撮影条件を選ぶ
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {flow.branches.map((branch, branchIndex) => (
            <button
              type="button"
              key={branch.condition}
              data-testid={`scene-guide-decision-${branchIndex}`}
              aria-pressed={selectedCondition === branch.condition}
              onClick={() => setSelectedCondition(branch.condition)}
              className={`rounded-2xl border px-3 py-2.5 text-left text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-950 ${
                selectedCondition === branch.condition
                  ? "border-violet-300 bg-violet-50 text-violet-900 shadow-sm dark:border-violet-400/40 dark:bg-violet-400/10 dark:text-violet-100"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white"
              }`}
            >
              {branch.condition}
            </button>
          ))}
        </div>
      </section>

      {selectedBranch ? (
        <>
          <section className="space-y-2.5">
            <FocalLengthRail
              sceneId={sceneId}
              primary={selectedBranch.cases[0]?.recommendation ?? ""}
              secondary={selectedBranch.cases[1]?.recommendation}
            />
            <FocalRecommendation
              sceneId={sceneId}
              primary={selectedBranch.cases[0]?.recommendation ?? ""}
              secondary={selectedBranch.cases[1]?.recommendation}
              primaryReason={selectedBranch.cases[0]?.reason ?? ""}
            />
          </section>

          <section className="rounded-2xl border border-amber-200/70 bg-amber-50/50 px-3 py-2 dark:border-amber-400/15 dark:bg-amber-400/[0.06]">
            <p className="line-clamp-2 text-[11px] leading-5 text-amber-800/80 dark:text-amber-200/80">
              <span className="mr-1 font-semibold">補足:</span>
              {selectedBranch.caution ?? flow.caution}
            </p>
          </section>

          <ConsultationHandoffButton
            onClick={() =>
              onConsult(
                createFamilyHandoff(sceneId, sceneLabel, selectedBranch),
              )
            }
          />
        </>
      ) : null}
    </>
  );
}

function ConsultationHandoffButton({ onClick }: { onClick: () => void }) {
  return (
    <section className="rounded-2xl border border-violet-200 bg-white px-3 py-2.5 dark:border-violet-400/20 dark:bg-slate-950/60">
      <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">
        この条件をもとに、具体的な候補をAIに相談します。
      </p>
      <button
        type="button"
        data-testid="scene-guide-consult"
        onClick={onClick}
        className="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-800 transition-colors hover:border-violet-300 hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-violet-400/30 dark:bg-violet-400/10 dark:text-violet-100 dark:hover:border-violet-400/50 dark:hover:bg-violet-400/15 dark:focus-visible:ring-offset-slate-950 sm:w-auto"
      >
        この条件で相談する
      </button>
    </section>
  );
}

function createFamilyHandoff(
  sceneId: string,
  sceneLabel: string,
  branch: ScenePlaybookDecisionFlow["branches"][number],
): SceneGuideHandoff {
  const isIndoor = branch.condition === "室内で撮る";
  const focalRangeLabel = isIndoor ? "35〜50mm前後" : "85〜135mm前後";
  const generatedPrompt = isIndoor
    ? "室内の家族写真で、子どもが近づいてくる場面や複数人を撮る場面を想定しています。35〜50mm前後の明るいレンズを中心に、室内で使いやすく、失敗しにくい候補を教えてください。"
    : "屋外の家族写真で、背景を少しぼかしながら自然な距離で撮る場面を想定しています。85〜135mm前後のレンズを中心に、子どもや家族写真に向く候補を教えてください。";

  return {
    source: "scene-guide",
    sceneId,
    sceneLabel,
    selectedConditions: [
      { key: "location", label: "撮影条件", value: branch.condition },
    ],
    derivedLensConditions: {
      focalRangeLabel,
      lensTypeLabel: isIndoor ? "明るい標準域" : "中望遠・望遠域",
      priorities: isIndoor
        ? ["近距離", "複数人", "室内での扱いやすさ"]
        : ["自然な距離", "背景整理", "子どもの表情"],
      cautions: [branch.caution ?? ""].filter(Boolean),
    },
    candidateRoles: branch.cases.map((item, index) => ({
      role: index === 0 ? "main" : "secondary",
      label: item.recommendation,
      reason: item.reason,
    })),
    generatedPrompt,
    createdAt: new Date().toISOString(),
  };
}

function createRecitalHandoff(
  sceneId: string,
  sceneLabel: string,
  selectedConditions: SceneGuideHandoff["selectedConditions"],
  result: ScenePlaybookConditionDecisionFlow["results"][string],
): SceneGuideHandoff {
  const conditionValue = (key: string) =>
    selectedConditions.find((condition) => condition.key === key)?.value ?? "";
  const seat = conditionValue("seat");
  const venue = conditionValue("venue");
  const goal = conditionValue("goal");
  const goalPhrase =
    goal === "全身も残したい"
      ? "子どもの全身も残しながら撮りたいです"
      : "子どもの表情を切り出したいです";
  const comparisonLabels = Array.from(
    new Set([result.secondary, result.safe]),
  ).join("や");

  return {
    source: "scene-guide",
    sceneId,
    sceneLabel,
    selectedConditions,
    derivedLensConditions: {
      focalRangeLabel: `${result.primary}中心`,
      lensTypeLabel: result.primary.includes("-")
        ? "望遠ズーム"
        : "望遠域のレンズ",
      priorities: ["距離不足を避ける", "構図変更", "暗所での歩留まり"],
      cautions: [result.caution],
    },
    candidateRoles: [
      { role: "main", label: result.primary, reason: result.reason },
      { role: "secondary", label: result.secondary, reason: "次点候補として比較" },
      { role: "safe", label: result.safe, reason: "撮影条件が読めない場合の安全策" },
    ],
    generatedPrompt: `発表会で${seat}・${venue}から、${goalPhrase}。${result.primary}を中心に、${comparisonLabels}も含めて、距離不足を避けやすい候補を比較してください。`,
    createdAt: new Date().toISOString(),
  };
}

function createConditionHandoff(
  sceneId: string,
  sceneLabel: string,
  selectedConditions: SceneGuideHandoff["selectedConditions"],
  result: ScenePlaybookConditionDecisionFlow["results"][string],
) {
  if (sceneId === "sports-day") {
    return createSportsDayHandoff(
      sceneId,
      sceneLabel,
      selectedConditions,
      result,
    );
  }

  if (sceneId === "travel-outing") {
    return createTravelHandoff(
      sceneId,
      sceneLabel,
      selectedConditions,
      result,
    );
  }

  return createRecitalHandoff(
    sceneId,
    sceneLabel,
    selectedConditions,
    result,
  );
}

function createSportsDayHandoff(
  sceneId: string,
  sceneLabel: string,
  selectedConditions: SceneGuideHandoff["selectedConditions"],
  result: ScenePlaybookConditionDecisionFlow["results"][string],
): SceneGuideHandoff {
  const conditionValue = (key: string) =>
    selectedConditions.find((condition) => condition.key === key)?.value ?? "";
  const venue = conditionValue("venue");
  const distance = conditionValue("distance");
  const motion = conditionValue("motion");
  const venuePhrase =
    venue === "園庭・小さめ"
      ? "小さめの園庭"
      : venue === "校庭・標準"
        ? "標準的な校庭"
        : "広いグラウンド";
  const distancePhrase =
    distance === "近い"
      ? "近い距離"
      : distance === "遠い"
        ? "遠い距離"
        : "中くらいの距離";
  const motionPhrase =
    motion === "ゆっくり"
      ? "ゆっくり動く"
      : motion === "速い"
        ? "速く動く"
        : "動きのある";
  const comparisonLabels = Array.from(
    new Set([result.secondary, result.safe]),
  )
    .filter((label) => label !== result.primary)
    .join("や");
  const comparisonPhrase = comparisonLabels
    ? `${comparisonLabels}も含めて、`
    : "";

  return {
    source: "scene-guide",
    sceneId,
    sceneLabel,
    selectedConditions,
    derivedLensConditions: {
      focalRangeLabel: `${result.primary}中心`,
      lensTypeLabel:
        result.primary === "70-200mm" || result.primary === "100-400mm"
          ? "望遠ズーム・望遠域"
          : "中望遠・望遠域",
      priorities: [
        "距離不足を避ける",
        "AF追従",
        "シャッター速度",
        "一日持ち歩ける重さ",
      ],
      cautions: [result.caution],
    },
    candidateRoles: [
      { role: "main", label: result.primary, reason: result.reason },
      { role: "secondary", label: result.secondary, reason: "次点候補として比較" },
      { role: "safe", label: result.safe, reason: "距離や動きが読めない場合の安全策" },
    ],
    generatedPrompt: `運動会で${venuePhrase}から、${distancePhrase}で${motionPhrase}子どもを撮りたいです。${result.primary}を中心に、${comparisonPhrase}距離・AF追従・シャッター速度・重さ・一日持ち歩きやすさも含めて候補を教えてください。`,
    createdAt: new Date().toISOString(),
  };
}

function createTravelHandoff(
  sceneId: string,
  sceneLabel: string,
  selectedConditions: SceneGuideHandoff["selectedConditions"],
  result: ScenePlaybookConditionDecisionFlow["results"][string],
): SceneGuideHandoff {
  const conditionValue = (key: string) =>
    selectedConditions.find((condition) => condition.key === key)?.value ?? "";
  const load = conditionValue("load");
  const subject = conditionValue("subject");
  const exchange = conditionValue("exchange");
  const subjectPhrase =
    subject === "風景・建物"
      ? "風景や建物"
      : subject === "子ども・人物"
        ? "子どもや人物"
        : "街歩きや家族";
  const loadPhrase =
    load === "軽さ優先"
      ? "荷物を軽くしながら"
      : load === "画質優先"
        ? "画質を優先しながら"
        : "持ち歩きやすさと画質のバランスを取りながら";
  const exchangePhrase =
    exchange === "できるだけ少なく"
      ? "レンズ交換をできるだけ減らして"
      : exchange === "交換してもよい"
        ? "必要に応じてレンズを交換して"
        : "多少のレンズ交換も許容して";
  const comparisonLabels = Array.from(
    new Set([result.secondary, result.safe]),
  )
    .filter((label) => label !== result.primary)
    .join("や");
  const comparisonPhrase = comparisonLabels
    ? `${comparisonLabels}も含めて、`
    : "";

  return {
    source: "scene-guide",
    sceneId,
    sceneLabel,
    selectedConditions,
    derivedLensConditions: {
      focalRangeLabel: `${result.primary}中心`,
      lensTypeLabel:
        result.primary === "便利ズーム"
          ? "撮り逃しを減らすズーム"
          : result.primary === "35mm" || result.primary === "50mm"
            ? "軽量な標準単焦点"
            : result.primary === "85mm"
              ? "人物向け中望遠"
              : "旅行向け標準ズーム",
      priorities: [
        "持ち歩きやすさ",
        "撮り逃しにくさ",
        "レンズ交換の少なさ",
        "旅行先での使いやすさ",
      ],
      cautions: [result.caution],
    },
    candidateRoles: [
      { role: "main", label: result.primary, reason: result.reason },
      { role: "secondary", label: result.secondary, reason: "次点候補として比較" },
      { role: "safe", label: result.safe, reason: "撮り逃しを減らす安全策" },
    ],
    generatedPrompt: `旅行で${subjectPhrase}を、${loadPhrase}${exchangePhrase}撮りたいです。${result.primary}を中心に、${comparisonPhrase}軽さ・使いやすさ・画質・撮り逃しにくさを含めて候補を教えてください。`,
    createdAt: new Date().toISOString(),
  };
}

function StandardDetail({
  detail,
}: {
  detail: NonNullable<ScenePlaybookCardType["detail"]>;
}) {
  return (
    <>
      <section className="rounded-2xl border border-violet-200 bg-white px-3 py-2.5 dark:border-violet-400/20 dark:bg-slate-950/60">
        <p className="text-xs font-semibold text-violet-700 dark:text-violet-200">
          一言でいうと
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-200">
          {detail.oneLineVerdict}
        </p>
      </section>

      <DetailList title="失敗しやすいこと" items={detail.commonFailures} />
      <DetailList title="まず考えるべき判断" items={detail.firstQuestions} />

      <section className="space-y-2">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          焦点距離の考え方
        </p>
        <div className="grid gap-2">
          {detail.focalLengthGuide.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-slate-950/60"
            >
              <p className="text-xs font-semibold text-slate-950 dark:text-white">
                {item.label}
              </p>
              <p className="mt-0.5 text-xs leading-5 text-slate-600 dark:text-slate-400">
                {item.guidance}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          レンズの役割
        </p>
        <div className="grid gap-2">
          {detail.lensRoles.map((role) => (
            <div
              key={role.label}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-slate-950/60"
            >
              <p className="text-xs font-semibold text-slate-950 dark:text-white">
                {role.label}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  使いやすい条件:
                </span>{" "}
                {role.bestFor}
              </p>
              <p className="mt-0.5 text-xs leading-5 text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  注意:
                </span>{" "}
                {role.caution}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-violet-200 bg-white px-3 py-3 dark:border-violet-400/20 dark:bg-slate-950/60">
        <p className="text-xs font-semibold text-violet-700 dark:text-violet-200">
          Lens Navi 結論
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-700 dark:text-slate-300">
          {detail.lensNaviConclusion}
        </p>
      </section>
    </>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="space-y-2">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
        {title}
      </p>
      <ul className="grid gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs leading-5 text-slate-600 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-400"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
