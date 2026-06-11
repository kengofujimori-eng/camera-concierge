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
    summary?: string;
    caution?: string;
    cases: {
      situation: string;
      recommendation: string;
      reason: string;
    }[];
  }[];
  summary: string;
  caution: string;
};

export type ScenePlaybookConditionDecisionFlow = {
  premise: string;
  controls: {
    key: string;
    label: string;
    defaultValue: string;
    options: {
      value: string;
      label: string;
    }[];
  }[];
  results: Record<
    string,
    {
      primary: string;
      secondary: string;
      safe: string;
      reason: string;
      caution: string;
    }
  >;
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
  conditionDecisionFlow?: ScenePlaybookConditionDecisionFlow;
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
            summary:
              "室内の家族写真では、35〜50mmが中心。子どもがすぐ近づいてくるなら35mm、少し距離が取れるなら50mmが扱いやすい。",
            caution:
              "F値を開けすぎると、複数人や動く子どもではピントが浅くなります。",
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
            summary:
              "屋外では距離が取れるため、85mmで背景を整理しながら子どもを切り出しやすい。広い場所では135mmも候補。",
            caution:
              "距離が取れない場所では85mm以上は長く感じやすいので、50mmも残しておくと安心です。",
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
      conditionDecisionFlow: {
        premise:
          "発表会では、明るさだけでなく、座席から届くことと構図変更できることが重要です。座席位置・会場サイズ・残したい構図から目安を絞ります。",
        controls: [
          {
            key: "seat",
            label: "座席位置",
            defaultValue: "center",
            options: [
              { value: "front", label: "前方席" },
              { value: "center", label: "中央席" },
              { value: "rear", label: "後方席" },
            ],
          },
          {
            key: "venue",
            label: "会場サイズ",
            defaultValue: "small",
            options: [
              { value: "small", label: "小ホール" },
              { value: "gym", label: "体育館" },
              { value: "large", label: "大ホール" },
            ],
          },
          {
            key: "goal",
            label: "狙い",
            defaultValue: "expression",
            options: [
              { value: "full-body", label: "全身も残したい" },
              { value: "expression", label: "表情を切り出したい" },
            ],
          },
        ],
        results: {
          "front|small|full-body": {
            primary: "85mm",
            secondary: "135mm",
            safe: "70-200mm",
            reason:
              "前方席の小ホールなら、85mmでも全身から上半身を自然に残しやすいです。",
            caution:
              "出演者が手前まで来る演目では、85mmでも全身が入りにくいことがあります。",
          },
          "front|small|expression": {
            primary: "135mm",
            secondary: "85mm",
            safe: "70-200mm",
            reason:
              "前方席の小ホールで表情を切り出すなら、135mmが距離と背景整理のバランスを取りやすいです。",
            caution:
              "席が近すぎる場合は135mmが長くなるため、85mmも候補に残します。",
          },
          "front|gym|full-body": {
            primary: "135mm",
            secondary: "70-200mm",
            safe: "70-200mm",
            reason:
              "体育館は前方席でもステージや演技エリアまで距離が出やすく、135mmが自然な基準になります。",
            caution:
              "演目ごとに立ち位置が変わる場合は、70-200mmの構図変更が安全です。",
          },
          "front|gym|expression": {
            primary: "70-200mm",
            secondary: "135mm",
            safe: "70-200mm",
            reason:
              "体育館で表情を狙うと距離変化が大きいため、70-200mmで届き方を調整しやすくなります。",
            caution:
              "暗い体育館では、ズームのF値とISO・シャッター速度も確認が必要です。",
          },
          "front|large|full-body": {
            primary: "135mm",
            secondary: "70-200mm",
            safe: "70-200mm",
            reason:
              "大ホールでも前方席なら135mmで全身を残せる場面がありますが、演目差にはズームが対応しやすいです。",
            caution:
              "ステージが広い場合は135mmでも短く感じるため、70-200mmが安全です。",
          },
          "front|large|expression": {
            primary: "70-200mm",
            secondary: "200mm以上",
            safe: "70-200mm",
            reason:
              "大ホールで表情を切り出すには、前方席でも70-200mmの調整幅が使いやすいです。",
            caution:
              "ステージ奥の表情を狙う場合は、200mmでも足りない可能性があります。",
          },
          "center|small|full-body": {
            primary: "135mm",
            secondary: "70-200mm",
            safe: "70-200mm",
            reason:
              "中央席の小ホールで全身を残すなら、135mmが届き方と構図のバランスを取りやすいです。",
            caution:
              "複数人や広い演目では、70-200mmで少し広めへ戻せる安心感があります。",
          },
          "center|small|expression": {
            primary: "135mm",
            secondary: "70-200mm",
            safe: "70-200mm",
            reason:
              "中央席で表情を切り出すなら、85mmでは少し短く感じやすく、135mmが自然な候補になります。",
            caution:
              "席や立ち位置が読めない場合は、単焦点より70-200mmの方が安全です。",
          },
          "center|gym|full-body": {
            primary: "70-200mm",
            secondary: "135mm",
            safe: "70-200mm",
            reason:
              "中央席の体育館では距離と演技範囲が変わりやすく、70-200mmが全身を残しやすいです。",
            caution:
              "暗い会場では、焦点距離だけでなくF値・ISO・シャッター速度も重要です。",
          },
          "center|gym|expression": {
            primary: "70-200mm",
            secondary: "200mm以上",
            safe: "70-200mm",
            reason:
              "体育館の中央席で表情を狙うなら、70-200mmを基準に距離不足を避けるのが自然です。",
            caution:
              "表情を大きく残したい場合は、200mm側でも短いことがあります。",
          },
          "center|large|full-body": {
            primary: "70-200mm",
            secondary: "200mm以上",
            safe: "70-200mm",
            reason:
              "大ホールの中央席では、全身と舞台の広さを切り替えられる70-200mmが扱いやすいです。",
            caution:
              "舞台奥では200mmでも小さく写る場合があるため、席位置を事前に確認したい条件です。",
          },
          "center|large|expression": {
            primary: "200mm以上",
            secondary: "70-200mm",
            safe: "200mm以上",
            reason:
              "大ホールの中央席から表情を切り出すには、200mm以上の届き方が必要になりやすいです。",
            caution:
              "長い望遠は全身や複数人へ戻しにくく、重量と被写体ブレの負担も増えます。",
          },
          "rear|small|full-body": {
            primary: "70-200mm",
            secondary: "135mm",
            safe: "70-200mm",
            reason:
              "小ホールでも後方席では距離が出るため、70-200mmが全身と上半身を切り替えやすいです。",
            caution:
              "135mm単焦点は構図を足で調整できないため、演目によっては短く感じます。",
          },
          "rear|small|expression": {
            primary: "70-200mm",
            secondary: "200mm以上",
            safe: "70-200mm",
            reason:
              "後方席から表情を狙う場合は、小ホールでも70-200mmの望遠端が基準になります。",
            caution:
              "被写体が小さく見える場合は、200mm以上も比較対象になります。",
          },
          "rear|gym|full-body": {
            primary: "70-200mm",
            secondary: "200mm以上",
            safe: "70-200mm",
            reason:
              "体育館の後方席で全身を残すなら、70-200mmの構図変更と届き方が使いやすいです。",
            caution:
              "遠い立ち位置では200mmでも短く感じる場合があります。",
          },
          "rear|gym|expression": {
            primary: "200mm以上",
            secondary: "70-200mm",
            safe: "200mm以上",
            reason:
              "体育館の後方席で表情を切り出す場合、単焦点85mmや135mmだけでは届かない可能性があります。",
            caution:
              "長い望遠ほど手ブレ・被写体ブレ・重量の負担が増えやすくなります。",
          },
          "rear|large|full-body": {
            primary: "200mm以上",
            secondary: "70-200mm",
            safe: "200mm以上",
            reason:
              "大ホールの後方席では、全身を残す場合でも200mm以上の届き方が必要になりやすいです。",
            caution:
              "舞台全体や複数人も残したい場合は、70-200mmとの使い分けが必要です。",
          },
          "rear|large|expression": {
            primary: "200mm以上",
            secondary: "70-200mm",
            safe: "200mm以上",
            reason:
              "後方席の大ホールで表情を切り出すには、200mm以上を基準に考える方が距離不足を避けやすいです。",
            caution:
              "暗い会場ではF値・ISO・シャッター速度に加え、動画時の構図変更も難しくなります。",
          },
        },
      },
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
