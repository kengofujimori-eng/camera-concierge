"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  ScenePlaybookCard as ScenePlaybookCardType,
  ScenePlaybookConditionDecisionFlow,
  ScenePlaybookDecisionFlow,
} from "@/data/scenePlaybooks";

const SCENE_GUIDE_HANDOFF_KEY = "lensNaviSceneGuideHandoff";

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
                onConsult={handoffToConsultation}
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
  onConsult: (handoff: SceneGuideHandoff) => void;
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
      <section className="rounded-2xl border border-violet-200 bg-white px-3 py-3 dark:border-violet-400/20 dark:bg-slate-950/60">
        <p className="text-xs font-semibold text-violet-700 dark:text-violet-200">
          発表会でまず見ること
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-200">
          {flow.premise}
        </p>
      </section>

      <section className="space-y-3">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          撮影条件を選ぶ
        </p>
        <div className="grid gap-3 lg:grid-cols-3">
          {flow.controls.map((control) => (
            <fieldset
              key={control.key}
              className="min-w-0 rounded-2xl border border-slate-200 bg-white p-2.5 dark:border-white/10 dark:bg-slate-950/60"
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
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              この条件での候補
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              <CandidateRoleCard
                label="主候補"
                value={result.primary}
                emphasized
              />
              <CandidateRoleCard label="次点候補" value={result.secondary} />
              <CandidateRoleCard label="安全策" value={result.safe} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white px-3 py-3 dark:border-white/10 dark:bg-slate-950/60">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              理由
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-700 dark:text-slate-300">
              {result.reason}
            </p>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3 dark:border-amber-400/20 dark:bg-amber-400/10">
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">
              注意
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-800 dark:text-amber-200">
              {result.caution}
            </p>
          </section>

          <ConsultationHandoffButton
            onClick={() =>
              onConsult(
                createRecitalHandoff(
                  sceneId,
                  sceneLabel,
                  selectedConditions,
                  result,
                ),
              )
            }
          />
        </>
      ) : null}
    </>
  );
}

function CandidateRoleCard({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border px-3 py-3 ${
        emphasized
          ? "border-violet-200 bg-violet-50/70 dark:border-violet-400/30 dark:bg-violet-400/10"
          : "border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950/60"
      }`}
    >
      <p
        className={`text-[11px] font-semibold ${
          emphasized
            ? "text-violet-700 dark:text-violet-200"
            : "text-slate-500 dark:text-slate-400"
        }`}
      >
        {label}
      </p>
      <p className="mt-1 text-base font-semibold text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
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
      <section className="rounded-2xl border border-violet-200 bg-white px-3 py-3 dark:border-violet-400/20 dark:bg-slate-950/60">
        <p className="text-xs font-semibold text-violet-700 dark:text-violet-200">
          家族写真でまず見ること
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-200">
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
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              おすすめ候補
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {selectedBranch.cases.map((item) => (
                <div
                  key={`${selectedBranch.condition}-${item.recommendation}`}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-3 dark:border-white/10 dark:bg-slate-950/60"
                >
                  <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-sm font-semibold text-violet-800 dark:border-violet-400/30 dark:bg-violet-400/10 dark:text-violet-100">
                    {item.recommendation}
                  </span>
                  <p className="mt-2 text-xs font-medium leading-5 text-slate-700 dark:text-slate-300">
                    {item.situation}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {item.reason}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white px-3 py-3 dark:border-white/10 dark:bg-slate-950/60">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              総評
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-700 dark:text-slate-300">
              {selectedBranch.summary ?? flow.summary}
            </p>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3 dark:border-amber-400/20 dark:bg-amber-400/10">
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">
              注意
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-800 dark:text-amber-200">
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
    <section className="rounded-2xl border border-violet-200 bg-white px-3 py-3 dark:border-violet-400/20 dark:bg-slate-950/60">
      <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">
        選んだ撮影条件をもとに、具体的なレンズ候補をAIに相談します。
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
