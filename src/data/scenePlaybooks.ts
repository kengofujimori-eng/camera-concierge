export type ScenePlaybookType =
  | "family"
  | "recital"
  | "sports-day"
  | "travel"
  | "portrait"
  | "video";

export type ScenePlaybookStatus =
  | "manual-draft"
  | "verified"
  | "ai-assisted"
  | "not-ready";

export type ScenePlaybookDecisionFlow = {
  premise: string;
  branches: {
    condition: string;
    cases: {
      situation: string;
      recommendation: string;
      reason: string;
    }[];
  }[];
  summary: string;
  caution: string;
};

export type ScenePlaybookDetail = {
  oneLineVerdict: string;
  commonFailures: string[];
  firstQuestions: string[];
  focalLengthGuide: {
    label: string;
    guidance: string;
  }[];
  lensRoles: {
    label: string;
    bestFor: string;
    caution: string;
  }[];
  lensNaviConclusion: string;
  decisionFlow?: ScenePlaybookDecisionFlow;
};

export type ScenePlaybookCard = {
  id: string;
  title: string;
  shortTitle: string;
  sceneType: ScenePlaybookType;
  headline: string;
  primaryUse: string[];
  keyDecisions: string[];
  representativeFocalRanges: string[];
  mainLensRoles: {
    label: string;
    role: string;
  }[];
  primaryCaution: string;
  relatedLensIds: string[];
  status: ScenePlaybookStatus;
  detail?: ScenePlaybookDetail;
};

export const scenePlaybooks: ScenePlaybookCard[] = [
  {
    id: "family-photography",
    title: "家族写真ガイド",
    shortTitle: "家族写真",
    sceneType: "family",
    headline:
      "家族写真の本命は50mm。屋外で子供を切り出すなら85mm、広い場所なら135mmも候補。",
    primaryUse: ["室内", "屋外", "子供", "日常記録"],
    keyDecisions: [
      "室内か屋外か",
      "子供が動くか",
      "複数人を撮るか",
      "背景を残すか",
    ],
    representativeFocalRanges: ["35mm", "50mm", "85mm", "135mm"],
    mainLensRoles: [
      { label: "35mm系", role: "室内・複数人・生活感" },
      { label: "50mm", role: "家族写真の中心" },
      { label: "85mm", role: "屋外で子供をきれいに切り出す" },
      { label: "135mm", role: "広い場所やイベントで遠くの表情を狙う" },
    ],
    primaryCaution: "ボケ量より、距離感と歩留まりを優先する。",
    relatedLensIds: [],
    status: "manual-draft",
    detail: {
      oneLineVerdict:
        "家族写真では、最高のボケよりも、距離感・複数人・子どもの動きに対応できることが重要。",
      commonFailures: [
        "室内で距離が足りない",
        "F値を開けすぎて複数人のピントが浅い",
        "子どもが近づいて構図が崩れる",
        "背景を消しすぎて、その日の状況が残らない",
      ],
      firstQuestions: [
        "室内中心か屋外中心か",
        "1人をきれいに撮るのか、家族の記録を残すのか",
        "子どもが動くか、止まってくれるか",
        "複数人を撮る頻度が高いか",
      ],
      focalLengthGuide: [
        { label: "35mm", guidance: "室内、複数人、生活感を残す撮影に向く" },
        {
          label: "50mm",
          guidance: "家族写真の中心。日常と人物のバランスが取りやすい",
        },
        { label: "85mm", guidance: "屋外で子どもをきれいに切り出しやすい" },
        {
          label: "135mm",
          guidance: "広い場所やイベントで遠くの自然な表情を拾いやすい",
        },
      ],
      lensRoles: [
        {
          label: "35mm系",
          bestFor: "室内・複数人・食事や部屋の雰囲気",
          caution: "背景整理や大きなボケは控えめ",
        },
        {
          label: "50mm",
          bestFor: "日常の家族写真の主力",
          caution: "狭い室内では少し長く感じることがある",
        },
        {
          label: "85mm",
          bestFor: "屋外で1人をきれいに撮る",
          caution: "室内や近距離では長すぎることがある",
        },
        {
          label: "135mm",
          bestFor: "公園やイベントで遠くの表情を切り出す",
          caution: "日常の会話距離では使いにくい",
        },
      ],
      lensNaviConclusion:
        "家族写真の最初の本命は50mm。室内や複数人が多いなら35mm系、屋外で子どもをきれいに切り出したいなら85mm、広い場所やイベントでは135mmを追加候補にする。",
      decisionFlow: {
        premise:
          "家族写真では、最高のボケよりも、距離感・複数人・子どもの動きに対応できることが重要です。まずは「室内か屋外か」と「子どもが近づいてくるか」で候補を絞ります。",
        branches: [
          {
            condition: "室内で撮る",
            cases: [
              {
                situation: "引きが取りにくい / 子どもが近づいてくる",
                recommendation: "35mm",
                reason: "近距離でも家族や部屋の状況を残しやすい",
              },
              {
                situation: "少し距離が取れる / 1〜2人中心",
                recommendation: "50mm",
                reason:
                  "日常の記録と人物らしい見え方のバランスを取りやすい",
              },
            ],
          },
          {
            condition: "屋外で撮る",
            cases: [
              {
                situation: "1人をきれいに切り出したい",
                recommendation: "85mm",
                reason: "少し離れて、背景を整理しながら表情を残しやすい",
              },
              {
                situation: "広い公園やイベントで遠くの表情を拾いたい",
                recommendation: "135mm",
                reason: "距離を保ちながら自然な瞬間を切り出しやすい",
              },
            ],
          },
        ],
        summary:
          "家族写真を室内で撮るなら、引きが取れない場面が多いため35〜50mmが中心。子どもがすぐ近づいてくるなら35mm、少し距離が取れるなら50mmが扱いやすい。屋外で1人をきれいに撮るなら85mm、広い場所では135mmも候補。",
        caution:
          "F値を開けすぎると、複数人や動く子どもではピントが浅くなります。家族写真では、背景をぼかすことよりも、表情と状況が残ることを優先した方が失敗しにくいです。",
      },
    },
  },
  {
    id: "recital-stage",
    title: "発表会ガイド",
    shortTitle: "発表会",
    sceneType: "recital",
    headline:
      "発表会は明るさだけでなく、届くことと構図変更できることが重要。",
    primaryUse: ["発表会", "ステージ", "小ホール", "体育館"],
    keyDecisions: ["座席距離", "会場サイズ", "暗さ", "全身か表情か"],
    representativeFocalRanges: ["85mm", "135mm", "70-200mm", "200mm+"],
    mainLensRoles: [
      { label: "85mm", role: "前方席・小会場向き" },
      { label: "135mm", role: "中距離から出演者を切り出す" },
      { label: "70-200mm", role: "席が読めない発表会の安全策" },
      { label: "200mm以上", role: "後方席・大きな会場向き" },
    ],
    primaryCaution: "席が読めない場合は、単焦点よりズームが安全。",
    relatedLensIds: [],
    status: "manual-draft",
    detail: {
      oneLineVerdict:
        "発表会では、明るさだけでなく、座席から届くこと・構図変更できること・被写体ブレを避けることが重要。",
      commonFailures: [
        "座席から被写体まで距離があり、焦点距離が足りない",
        "単焦点で構図変更できず、全身や表情を切り替えにくい",
        "暗い会場でシャッター速度が落ち、被写体ブレが出る",
        "F値の明るさだけで選んで、席や会場サイズに合わない",
        "後方席なのに85mmや135mmだけで足りると思ってしまう",
      ],
      firstQuestions: [
        "座席位置は前方か、中央か、後方か",
        "会場は小ホールか、体育館か、大きなホールか",
        "全身を残したいのか、表情を切り出したいのか",
        "レンズ交換できる余裕があるか",
        "写真だけか、動画も撮るか",
      ],
      focalLengthGuide: [
        {
          label: "85mm",
          guidance: "前方席や小会場で、少し離れた子どもを自然に撮りやすい",
        },
        {
          label: "135mm",
          guidance: "中距離から表情や上半身を切り出しやすい",
        },
        {
          label: "70-200mm",
          guidance:
            "席が読めない発表会の安全策。全身と表情を切り替えやすい",
        },
        {
          label: "200mm以上",
          guidance: "後方席、大きなホール、体育館で距離が足りないときの候補",
        },
      ],
      lensRoles: [
        {
          label: "85mm",
          bestFor: "前方席・小会場・近めのステージ",
          caution: "中央席や後方席では届かないことがある",
        },
        {
          label: "135mm",
          bestFor: "中距離から子どもの表情や上半身を切り出す",
          caution: "会場が広い場合や後方席ではまだ短いことがある",
        },
        {
          label: "70-200mm",
          bestFor: "座席位置が読めない発表会、全身と表情の切り替え",
          caution: "単焦点より重く、暗所ではF値とISOの判断が必要",
        },
        {
          label: "200mm以上",
          bestFor: "後方席、大きなホール、体育館",
          caution: "手ブレ・被写体ブレ・重量の負担が増えやすい",
        },
      ],
      lensNaviConclusion:
        "発表会では、席が読めないなら70-200mmが最も安全。前方席や小会場なら85mm、少し距離があるなら135mmも候補。後方席や大きな会場では200mm以上を考え、明るさだけでなく届くことと構図変更を優先する。",
    },
  },
  {
    id: "sports-day",
    title: "運動会ガイド",
    shortTitle: "運動会",
    sceneType: "sports-day",
    headline:
      "運動会はボケ量より、届く・追える・ブレない・一日持てることが重要。",
    primaryUse: ["運動会", "屋外イベント", "子供", "動体"],
    keyDecisions: ["校庭の広さ", "競技距離", "子供の動き", "重量"],
    representativeFocalRanges: ["70-200mm", "100-400mm", "85mm", "135mm"],
    mainLensRoles: [
      { label: "70-200mm", role: "運動会全体の安全策" },
      { label: "100-400mm", role: "広い校庭や遠距離向き" },
      { label: "85mm", role: "近い競技や待機中の表情" },
      { label: "135mm", role: "少し離れた表情の切り出し" },
    ],
    primaryCaution:
      "単焦点は追加表現レンズ。運動会全体の主力はズームが安全。",
    relatedLensIds: [],
    status: "manual-draft",
    detail: {
      oneLineVerdict:
        "運動会では、ボケ量よりも、届くこと・追えること・ブレにくいこと・一日持ち歩けることが重要。",
      commonFailures: [
        "焦点距離が足りず、子どもが小さく写る",
        "単焦点だけで構図変更が追いつかない",
        "シャッター速度が足りず、走る子どもがブレる",
        "重いレンズで一日持ち歩くのがつらくなる",
        "近い競技と遠い競技を同じレンズで無理に撮ろうとする",
      ],
      firstQuestions: [
        "校庭や会場は広いか",
        "撮影位置を自由に動けるか",
        "走る競技が多いか、待機中や表情も撮りたいか",
        "子どもまでの距離が読めるか",
        "一日持ち歩ける重さか",
      ],
      focalLengthGuide: [
        {
          label: "70-200mm",
          guidance:
            "運動会全体の安全策。近〜中距離の競技や表情を撮りやすい",
        },
        {
          label: "100-400mm",
          guidance: "広い校庭や遠い競技で、距離不足を補いやすい",
        },
        {
          label: "85mm",
          guidance: "近い競技、待機中、親子ショットなどに向く",
        },
        {
          label: "135mm",
          guidance: "少し離れた表情や、競技前後の自然な瞬間を切り出しやすい",
        },
      ],
      lensRoles: [
        {
          label: "70-200mm",
          bestFor: "近〜中距離の競技、表情、全身と上半身の切り替え",
          caution: "広い校庭や遠い競技では届かないことがある",
        },
        {
          label: "100-400mm",
          bestFor: "広い校庭、遠い競技、撮影位置が限られる場面",
          caution: "重さと暗さの負担が増えやすく、近距離では扱いにくい",
        },
        {
          label: "85mm",
          bestFor: "近い競技、待機中の表情、親子ショット",
          caution:
            "運動会全体を撮る主力としては距離も構図変更も不足しやすい",
        },
        {
          label: "135mm",
          bestFor: "少し離れた子どもの表情や自然な瞬間",
          caution: "競技中の動きや距離変化には対応しにくい",
        },
      ],
      lensNaviConclusion:
        "運動会の主力は、まず70-200mmや100-400mmのような望遠ズームで考える。85mmや135mmは、近い競技や待機中の表情をきれいに切り出す追加表現レンズとして使うと失敗しにくい。ボケ量より、届くこと・追えること・ブレないこと・一日持てることを優先する。",
    },
  },
  {
    id: "travel-outing",
    title: "旅行・おでかけガイド",
    shortTitle: "旅行",
    sceneType: "travel",
    headline:
      "旅行では最高画質より、持ち出せること・交換しなくて済むこと・夜も撮れることを優先する。",
    primaryUse: ["旅行", "街歩き", "おでかけ", "家族記録"],
    keyDecisions: [
      "荷物を減らすか",
      "夜も撮るか",
      "人物も風景も撮るか",
      "レンズ交換できるか",
    ],
    representativeFocalRanges: ["24-70mm", "20-70mm", "35mm", "50mm"],
    mainLensRoles: [
      { label: "標準ズーム", role: "人物も風景も1本で拾いやすい" },
      { label: "軽量標準ズーム", role: "長時間の街歩きや家族旅行で持ち出しやすい" },
      { label: "35mm", role: "街歩き、食事、室内を自然に残しやすい" },
      { label: "50mm", role: "荷物を軽くしつつ人物を印象的に撮りやすい" },
    ],
    primaryCaution:
      "旅行では、持って行ける重さと交換しなくてよい安心感を画質より先に見る。",
    relatedLensIds: [],
    status: "manual-draft",
  },
];

export function getScenePlaybookById(id: string) {
  return scenePlaybooks.find((playbook) => playbook.id === id);
}
