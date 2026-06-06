"use client";

import { useRef, useState } from "react";
import { ScenePlaybookCard } from "@/components/ScenePlaybookCard";
import { scenePlaybooks } from "@/data/scenePlaybooks";

const sceneGuideChoices = [
  {
    id: "family-photography",
    condition: "日常・子ども・家族の記録",
    guide: "家族写真ガイド",
  },
  {
    id: "recital-stage",
    condition: "ホール・体育館・暗い会場",
    guide: "発表会ガイド",
  },
  {
    id: "sports-day",
    condition: "屋外イベント・動く子ども",
    guide: "運動会ガイド",
  },
  {
    id: "travel-outing",
    condition: "旅行・街歩き・荷物を減らしたい",
    guide: "旅行・おでかけガイド",
  },
];

export default function ScenePlaybooksPage() {
  const [openGuideId, setOpenGuideId] = useState<string | null>(null);
  const [filteredGuideId, setFilteredGuideId] = useState<string | null>(null);
  const gridRef = useRef<HTMLElement | null>(null);

  const visiblePlaybooks = filteredGuideId
    ? scenePlaybooks.filter((playbook) => playbook.id === filteredGuideId)
    : scenePlaybooks;

  function handleOpenGuide(id: string) {
    setOpenGuideId((currentId) => (currentId === id ? null : id));
  }

  function scrollToGrid() {
    window.setTimeout(() => {
      gridRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  function handleChooseGuide(id: string) {
    const selectedPlaybook = scenePlaybooks.find(
      (playbook) => playbook.id === id,
    );

    setFilteredGuideId(id);
    setOpenGuideId(selectedPlaybook?.detail ? id : null);
    scrollToGrid();
  }

  function handleShowAllGuides() {
    setFilteredGuideId(null);
    setOpenGuideId(null);
    scrollToGrid();
  }

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
              撮影シーンガイド
            </h1>
            <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
              レンズ単体の評価ではなく、家族写真・発表会・運動会などの撮影条件から、焦点距離・F値・距離感を整理するためのガイドです。
            </p>
          </div>
        </header>

        <div className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
          まずは撮影シーンごとの判断ガイドとして公開しています。レンズ倉庫・チャット推薦との連携は今後追加予定です。
        </div>

        <section
          data-testid="scene-guide-chooser"
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
          aria-labelledby="scene-guide-chooser-title"
        >
          <div className="h-1 bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-500" />
          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] lg:items-start">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-violet-700 dark:text-violet-200">
                まずは撮影条件を選ぶ
              </p>
              <div className="space-y-2">
                <h2
                  id="scene-guide-chooser-title"
                  className="text-xl font-semibold tracking-normal text-slate-950 dark:text-white"
                >
                  どのガイドを見るべき？
                </h2>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                  撮りたい場面に近いものから選ぶと、レンズ名より先に見るべき判断軸が分かります。
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {sceneGuideChoices.map((choice) => {
                const isSelected = filteredGuideId === choice.id;

                return (
                  <button
                    key={choice.id}
                    type="button"
                    data-testid={`scene-guide-chooser-button-${choice.id}`}
                    aria-pressed={isSelected}
                    onClick={() => handleChooseGuide(choice.id)}
                    className={`rounded-2xl border px-4 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 ${
                      isSelected
                        ? "border-violet-200 bg-violet-50/70 shadow-sm dark:border-violet-400/30 dark:bg-violet-400/10"
                        : "border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white hover:shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20 dark:hover:bg-white/[0.06]"
                    }`}
                  >
                    <p className="text-xs font-medium leading-5 text-slate-500 dark:text-slate-400">
                      {choice.condition}
                    </p>
                    <p
                      className={`mt-1 text-sm font-semibold leading-5 ${
                        isSelected
                          ? "text-violet-800 dark:text-violet-100"
                          : "text-slate-900 dark:text-slate-100"
                      }`}
                    >
                      {choice.guide}
                    </p>
                  </button>
                );
              })}
            </div>

            {filteredGuideId ? (
              <div className="mt-4 flex justify-start">
                <button
                  type="button"
                  data-testid="scene-guide-show-all"
                  onClick={handleShowAllGuides}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white dark:focus-visible:ring-offset-slate-950"
                >
                  すべてのガイドを見る
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <section
          ref={gridRef}
          data-testid="scene-playbook-grid"
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          aria-label="Scene Playbook list"
        >
          {visiblePlaybooks.map((playbook) => (
            <div key={playbook.id} className="h-full scroll-mt-24">
              <ScenePlaybookCard
                playbook={playbook}
                isOpen={openGuideId === playbook.id}
                isSelected={filteredGuideId === playbook.id}
                onOpen={handleOpenGuide}
              />
            </div>
          ))}
        </section>

        <footer className="border-t border-slate-200 pt-5 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
          スコアやランキングではなく、失敗しにくい撮影判断を整理するためのメモです。
        </footer>
      </div>
    </main>
  );
}
