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
