import { ScenePlaybookCard } from "@/components/ScenePlaybookCard";
import { scenePlaybooks } from "@/data/scenePlaybooks";

export default function ScenePlaybooksPage() {
  return (
    <main
      data-testid="scene-playbook-page"
      className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="max-w-3xl space-y-4">
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
            Scene Playbook
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl dark:text-white">
              撮影シーン攻略
            </h1>
            <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
              レンズ単体の評価ではなく、家族写真・発表会・運動会などの撮影条件から、焦点距離・F値・距離感を整理するためのガイドです。
            </p>
          </div>
        </header>

        <div className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
          現在は初期モックです。レンズ倉庫・チャット推薦・Deep Review とはまだ接続していません。
        </div>

        <section
          data-testid="scene-playbook-grid"
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          aria-label="Scene Playbook list"
        >
          {scenePlaybooks.map((playbook) => (
            <ScenePlaybookCard key={playbook.id} playbook={playbook} />
          ))}
        </section>

        <footer className="border-t border-slate-200 pt-5 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
          スコアやランキングではなく、失敗しにくい撮影判断を整理するためのメモです。
        </footer>
      </div>
    </main>
  );
}
