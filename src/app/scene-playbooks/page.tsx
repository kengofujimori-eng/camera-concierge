"use client";

import { useState } from "react";
import { ScenePlaybookCard } from "@/components/ScenePlaybookCard";
import { scenePlaybooks } from "@/data/scenePlaybooks";

export default function ScenePlaybooksPage() {
  const [openGuideId, setOpenGuideId] = useState<string | null>(null);

  function handleOpenGuide(id: string) {
    setOpenGuideId((currentId) => (currentId === id ? null : id));
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
              {[
                ["日常・子ども・家族の記録", "家族写真ガイド"],
                ["ホール・体育館・暗い会場", "発表会ガイド"],
                ["屋外イベント・動く子ども", "運動会ガイド"],
                ["旅行・街歩き・荷物を減らしたい", "旅行・おでかけガイド"],
              ].map(([condition, guide]) => (
                <div
                  key={guide}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]"
                >
                  <p className="text-xs font-medium leading-5 text-slate-500 dark:text-slate-400">
                    {condition}
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-5 text-slate-900 dark:text-slate-100">
                    {guide}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          data-testid="scene-playbook-grid"
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          aria-label="Scene Playbook list"
        >
          {scenePlaybooks.map((playbook) => (
            <ScenePlaybookCard
              key={playbook.id}
              playbook={playbook}
              isOpen={openGuideId === playbook.id}
              onOpen={handleOpenGuide}
            />
          ))}
        </section>

        <footer className="border-t border-slate-200 pt-5 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
          スコアやランキングではなく、失敗しにくい撮影判断を整理するためのメモです。
        </footer>
      </div>
    </main>
  );
}
