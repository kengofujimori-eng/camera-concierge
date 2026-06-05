import type { ScenePlaybookCard as ScenePlaybookCardType } from "@/data/scenePlaybooks";

type ScenePlaybookCardProps = {
  playbook: ScenePlaybookCardType;
};

function Chip({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
      {children}
    </span>
  );
}

export function ScenePlaybookCard({ playbook }: ScenePlaybookCardProps) {
  const keyDecisions = playbook.keyDecisions.slice(0, 3);
  const focalRanges = playbook.representativeFocalRanges.slice(0, 4);
  const lensRoles = playbook.mainLensRoles.slice(0, 3);

  return (
    <article
      data-testid={`scene-playbook-card-${playbook.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md dark:border-white/10 dark:bg-slate-950 dark:hover:border-white/20"
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
          <span
            data-testid={`scene-playbook-open-${playbook.id}`}
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors group-hover:border-violet-200 group-hover:text-violet-700 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200 dark:group-hover:border-violet-400/30 dark:group-hover:text-violet-200"
          >
            撮影判断を見る
          </span>
        </div>
      </div>
    </article>
  );
}
