import type {
  ScenePlaybookCard as ScenePlaybookCardType,
  ScenePlaybookDecisionFlow,
} from "@/data/scenePlaybooks";

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
  const hasDetail = Boolean(playbook.detail);
  const keyDecisions = playbook.keyDecisions.slice(0, 3);
  const focalRanges = playbook.representativeFocalRanges.slice(0, 4);
  const lensRoles = playbook.mainLensRoles.slice(0, 3);

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
            {playbook.detail.decisionFlow ? (
              <DecisionFlow flow={playbook.detail.decisionFlow} />
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

function DecisionFlow({ flow }: { flow: ScenePlaybookDecisionFlow }) {
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
          撮影条件から候補を選ぶ
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {flow.branches.map((branch) => (
            <div
              key={branch.condition}
              className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-950/60"
            >
              <p className="text-sm font-semibold text-slate-950 dark:text-white">
                {branch.condition}
              </p>
              <div className="mt-2.5 space-y-2">
                {branch.cases.map((item) => (
                  <div
                    key={`${branch.condition}-${item.recommendation}`}
                    className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {item.situation}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="inline-flex shrink-0 items-center rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-800 dark:border-violet-400/30 dark:bg-violet-400/10 dark:text-violet-100">
                        {item.recommendation}
                      </span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        が候補
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-5 text-slate-600 dark:text-slate-400">
                      {item.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white px-3 py-3 dark:border-white/10 dark:bg-slate-950/60">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          総評
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-700 dark:text-slate-300">
          {flow.summary}
        </p>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3 dark:border-amber-400/20 dark:bg-amber-400/10">
        <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">
          注意
        </p>
        <p className="mt-1 text-xs leading-5 text-amber-800 dark:text-amber-200">
          {flow.caution}
        </p>
      </section>
    </>
  );
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
