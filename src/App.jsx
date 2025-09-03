import React, { useMemo, useRef, useState } from "react";

/** =============================
 *  出題データ（ご指定の問題に置き換え）
 * =============================*/
const QUESTIONS = [
  {
    prompt_jp: "彼(かれ)はもう家(いえ)に帰(かえ)った＿＿＿。",
    prompt_cn: "他已经回家了＿＿＿。",
    choices: ["かもしれない", "から", "のに"],
    correct_index: 0,
    explanation_jp:
      "「かもしれない」は不確実な推量。ほかの選択肢は理由（から）・逆接（のに）で不適。",
    explanation_cn:
      "「かもしれない」表示不确定的推测。其他选项分别表示理由（から）和转折（のに），与语境不符。",
  },
  {
    prompt_jp: "雨(あめ)が降(ふ)った＿＿＿、試合(しあい)は中止(ちゅうし)になった。",
    prompt_cn: "下雨了＿＿＿，比赛中止了。",
    choices: ["から", "のに", "より"],
    correct_index: 0,
    explanation_jp:
      "「から」は明確な理由。『のに』は逆接、『より』は比較で不適。",
    explanation_cn:
      "「から」表示明确的理由。「のに」是转折，「より」是比较，都不符合。",
  },
  {
    prompt_jp: "体調(たいちょう)が悪(わる)かった＿＿＿、学校(がっこう)を休(やす)んだ。",
    prompt_cn: "因为身体不舒服＿＿＿，没去上学。",
    choices: ["ので", "ほど", "なら"],
    correct_index: 0,
    explanation_jp:
      "「ので」は丁寧な理由。「ほど」は程度、「なら」は条件で不自然。",
    explanation_cn:
      "「ので」表示较为礼貌的原因说明。「ほど」表示程度，「なら」表示条件，在此不自然。",
  },
  {
    prompt_jp: "お金(かね)がない＿＿＿、旅行(りょこう)に行(い)きたい。",
    prompt_cn: "没钱＿＿＿，还是想去旅行。",
    choices: ["のに", "から", "ために"],
    correct_index: 0,
    explanation_jp:
      "「のに」は事実と期待の逆転。ほかは理由・目的で不適。",
    explanation_cn:
      "「のに」表示事实与预期相反（转折）。其他为理由/目的，不合适。",
  },
  {
    prompt_jp: "努力(どりょく)した＿＿＿、結果(けっか)が出(で)なかった。",
    prompt_cn: "尽管努力了＿＿＿，还是没有出结果。",
    choices: ["にもかかわらず", "によって", "ために"],
    correct_index: 0,
    explanation_jp:
      "「にもかかわらず」は強い逆接。他は手段・原因で意味不適合。",
    explanation_cn:
      "「にもかかわらず」表示强烈的让步转折。其他分别是手段（によって）和原因（ために），语义不合。",
  },
  {
    prompt_jp: "雨(あめ)が降(ふ)っ＿＿＿、試合(しあい)は中止(ちゅうし)になります。",
    prompt_cn: "如果下雨＿＿＿，比赛就会取消。",
    choices: ["たら", "なら", "ことがある"],
    correct_index: 0,
    explanation_jp:
      "「降ったら」で仮定条件。「なら」は名詞や終止形に付くためここでは不可。",
    explanation_cn:
      "用「〜たら」表示假定条件。「なら」多接名词或句子终止形，此处不合适。",
  },
  {
    prompt_jp: "暇(ひま)＿＿＿、一緒(いっしょ)に映画(えいが)を見(み)に行(い)きませんか。",
    prompt_cn: "要是有空＿＿＿，要不要一起去看电影？",
    choices: ["なら", "と", "のに"],
    correct_index: 0,
    explanation_jp:
      "勧誘の条件は「〜なら」が自然。「と」は確定的連続、『のに』は逆接。",
    explanation_cn:
      "用于邀请时，「〜なら」最自然。「と」表示确定的连锁关系，「のに」为转折。",
  },
  {
    prompt_jp: "私(わたし)は先生(せんせい)にほめ＿＿＿。",
    prompt_cn: "我被老师表扬了＿＿＿。",
    choices: ["られた", "させた", "ている"],
    correct_index: 0,
    explanation_jp:
      "「ほめられた」で受身。他は使役・進行で不適。",
    explanation_cn:
      "「ほめられた」是被动态。其他分别为使役和进行体，不合适。",
  },
  {
    prompt_jp:
      "母(はは)は子(こ)どもに野菜(やさい)を食(た)べ＿＿＿、デザートをあげた。",
    prompt_cn: "妈妈让孩子吃了蔬菜＿＿＿，给了甜点。",
    choices: ["させた", "られた", "にした"],
    correct_index: 0,
    explanation_jp:
      "「食べさせた」が唯一自然。被害の受身『食べられた』は後件と論理不一致。「にした」も不適。",
    explanation_cn:
      "只有「食べさせた」（让其吃）自然。「食べられた」作受害被动与后句逻辑不一致；「にした」也不当。",
  },
  {
    prompt_jp: "先生(せんせい)は明日(あした)こちらにお越(こ)し＿＿＿ます。",
    prompt_cn: "老师明天要过来这边＿＿＿。",
    choices: ["になり", "する", "られる"],
    correct_index: 0,
    explanation_jp:
      "「お越しになり＋ます」で尊敬語。『する』『られる』単独は形として不可。",
    explanation_cn:
      "「お越しになり＋ます」是尊敬语的正确形式。「する」「られる」单独在此形式不成立。",
  },
  {
    prompt_jp: "社長(しゃちょう)はもうお帰(かえ)り＿＿＿ました。",
    prompt_cn: "社长已经回去了＿＿＿。",
    choices: ["になり", "する", "させる"],
    correct_index: 0,
    explanation_jp: "「お帰りになりました」で尊敬語。他は誤用。",
    explanation_cn: "「お帰りになりました」为尊敬语，其他为误用。",
  },
  {
    prompt_jp:
      "授業(じゅぎょう)が始(はじ)まる＿＿＿に、教室(きょうしつ)に入(はい)った。",
    prompt_cn: "在上课开始＿＿＿，进了教室。",
    choices: ["前", "間", "うち"],
    correct_index: 0,
    explanation_jp:
      "「前に」が唯一自然。「始まる間に」「始まるうちに」は不自然。",
    explanation_cn:
      "只有「前に」自然。「始まる間に」「始まるうちに」都不自然。",
  },
  {
    prompt_jp: "東京(とうきょう)は大阪(おおさか)＿＿＿人(ひと)が多(おお)い。",
    prompt_cn: "东京比大阪＿＿＿人多。",
    choices: ["より", "まで", "でも"],
    correct_index: 0,
    explanation_jp: "比較は『A は B より〜』。他は用法不適。",
    explanation_cn: "比较句型是「A は B より〜」。其余用法不当。",
  },
  {
    prompt_jp: "健康(けんこう)の＿＿＿に毎日(まいにち)走(はし)っている。",
    prompt_cn: "为了健康＿＿＿，每天跑步。",
    choices: ["ため", "よう", "ので"],
    correct_index: 0,
    explanation_jp: "名詞＋『ために』で目的。『よう』単独は不可。",
    explanation_cn: "名词＋「ために」表示目的。「よう」单独不能使用。",
  },
  {
    prompt_jp:
      "日本語(にほんご)が話(はな)せる＿＿＿、毎日(まいにち)練習(れんしゅう)している。",
    prompt_cn: "为了能说日语＿＿＿，每天练习。",
    choices: ["ように", "ので", "から"],
    correct_index: 0,
    explanation_jp: "動詞可能形＋『ように』で目的表現。",
    explanation_cn: "「动词可能形＋ように」表示目的。",
  },
  {
    prompt_jp:
      "私(わたし)は一度(いちど)富士山(ふじさん)に登(のぼ)った＿＿＿がある。",
    prompt_cn: "我曾经登过一次富士山＿＿＿。",
    choices: ["こと", "の", "そう"],
    correct_index: 0,
    explanation_jp: "『〜たことがある』で経験。他は文型不成立。",
    explanation_cn: "用「〜たことがある」表达经验。其余句型不成立。",
  },
  {
    prompt_jp: "私(わたし)は今(いま)、宿題(しゅくだい)を終(お)わった＿＿＿。",
    prompt_cn: "我刚刚做完作业＿＿＿。",
    choices: ["ところだ", "ことがある", "ようだ"],
    correct_index: 0,
    explanation_jp:
      "『〜たところだ』で直後の完了。一次話者で『ようだ』は不自然、経験『ことがある』も不可。",
    explanation_cn:
      "用「〜たところだ」表示刚刚完成。第一人称用「ようだ」不自然，「ことがある」表示经验也不合此处。",
  },
  {
    prompt_jp: "日本語(にほんご)が話(はな)せるように＿＿＿。",
    prompt_cn: "变得能说日语了＿＿＿。",
    choices: ["なった", "する", "いる"],
    correct_index: 0,
    explanation_jp: "『〜ようになる』で能力・習慣の変化。",
    explanation_cn: "用「〜ようになる」表示能力/习惯的变化。",
  },
  {
    prompt_jp: "来月(らいげつ)から転勤(てんきん)する＿＿＿になった。",
    prompt_cn: "决定从下个月开始调职＿＿＿。",
    choices: ["こと", "よう", "ことに"],
    correct_index: 0,
    explanation_jp:
      "『〜ことになる』で決定・規則による変化。「よう」「ことに」は不可。",
    explanation_cn:
      "用「〜ことになる」表示（由决定/规则导致的）变化。「よう」「ことに」都不对。",
  },
  {
    prompt_jp:
      "天気予報(てんきよほう)に よ(よ)る と、明日(あした)は雨(あめ)が降(ふ)る＿＿＿だ。",
    prompt_cn: "根据天气预报，明天会下雨＿＿＿。",
    choices: ["そう", "こと", "から"],
    correct_index: 0,
    explanation_jp: "『〜そうだ』は伝聞。他は名詞化・理由で不適。",
    explanation_cn: "「〜そうだ」表示传闻。其他是名词化/理由，不合适。",
  },
];

/** =============================
 *  音（正解 / 不正解）
 * =============================*/
function useSound() {
  const ctxRef = useRef(null);
  function play(frequency = 880, duration = 0.2) {
    if (!ctxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctxRef.current = new AC();
    }
    const ctx = ctxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.22, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.start(t);
    osc.stop(t + duration + 0.01);
  }
  return { play };
}

/** =============================
 *  ユーティリティ
 * =============================*/
function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

function useShuffled(question) {
  return useMemo(() => {
    const indexed = question.choices.map((c, i) => ({ c, i }));
    for (let j = indexed.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [indexed[j], indexed[k]] = [indexed[k], indexed[j]];
    }
    const choices = indexed.map((x) => x.c);
    const correctIndexAfterShuffle = indexed.findIndex(
      (x) => x.i === question.correct_index
    );
    return { choices, correctIndexAfterShuffle };
  }, [question]);
}

/** =============================
 *  PDF出力（新しいウィンドウで印刷ダイアログ → PDF保存）
 * =============================*/
function exportTableToPDF(rows, title = "正誤表") {
  const html = `
  <html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans JP", sans-serif; padding: 16px; }
      h1 { font-size: 18px; margin: 0 0 12px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #ccc; padding: 8px; font-size: 12px; vertical-align: top; }
      th { background: #f5f5f5; }
      .small { font-size: 11px; color: #555; }
    </style>
  </head>
  <body>
    <h1>${title}</h1>
    <table>
      <thead>
        <tr>
          <th>問題文</th>
          <th>選択肢</th>
          <th>正解</th>
          <th>選択</th>
          <th>正誤</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (r) => `
          <tr>
            <td>${escapeHTML(r.prompt)}</td>
            <td class="small">${escapeHTML(r.choices.join(" / "))}</td>
            <td>${escapeHTML(r.correct)}</td>
            <td>${escapeHTML(r.selected ?? "—")}</td>
            <td>${r.isCorrect ? "◯" : "✕"}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
  </body>
  </html>`;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
  // 印刷ダイアログを開く（ユーザーはPDFとして保存できる）
  w.focus();
  w.print();
}

function escapeHTML(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/** =============================
 *  メインアプリ
 * =============================*/
export default function App() {
  const total = QUESTIONS.length;
  const { play } = useSound();

  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [showCN, setShowCN] = useState(false);

  // 結果配列：{ prompt, choices, correct, selected, isCorrect }
  const [results, setResults] = useState([]);
  const [showInterim, setShowInterim] = useState(false);
  const [showFinal, setShowFinal] = useState(false);

  const question = QUESTIONS[qIndex];
  const { choices, correctIndexAfterShuffle } = useShuffled(question);

  const correctText = choices[correctIndexAfterShuffle];
  const isCorrect = submitted && selected === correctIndexAfterShuffle;

  // 選択 → 即判定＆結果push
  function handleChoose(i) {
    if (submitted || showInterim || showFinal) return;
    setSelected(i);
    setSubmitted(true);

    const ok = i === correctIndexAfterShuffle;
    if (ok) {
      play(880, 0.2); // 正解音
    } else {
      play(220, 0.25); // 不正解音
    }

    // push結果（表示順のchoicesで保存）
    setResults((prev) => [
      ...prev,
      {
        prompt: question.prompt_jp,
        choices: [...choices],
        correct: correctText,
        selected: choices[i],
        isCorrect: ok,
      },
    ]);
  }

  // 次へ：5問ごとに中間表示 / 最終表示
  function next() {
    const answered = results.length;

    // まだ全問終わっていない＆5問ごとの区切りなら中間
    if (answered > 0 && answered % 5 === 0 && answered < total) {
      setShowInterim(true);
      return;
    }

    // 全問終了 → 最終結果表示
    if (answered >= total) {
      setShowFinal(true);
      return;
    }

    // 次の問題へ
    const nextIdx = qIndex + 1;
    setQIndex(nextIdx);
    // リセット
    setSelected(null);
    setSubmitted(false);
    setShowCN(false);
  }

  function continueFromInterim() {
    setShowInterim(false);
    // 5問ごとの後は次の問題へ（まだ残っていれば）
    if (results.length < total) {
      setQIndex((x) => x + 1);
      setSelected(null);
      setSubmitted(false);
      setShowCN(false);
    } else {
      setShowFinal(true);
    }
  }

  function restart() {
    setQIndex(0);
    setSelected(null);
    setSubmitted(false);
    setShowCN(false);
    setResults([]);
    setShowInterim(false);
    setShowFinal(false);
  }

  // 進捗（シーケンスバー）
  const progressPercent = Math.round((results.length / total) * 100);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <header className="mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">日本語文法クイズ</h1>
            <div className="text-sm text-slate-600">
              進捗: <span className="font-semibold">{results.length}</span> / {total}
            </div>
          </div>
          {/* シーケンスバー */}
          <div className="mt-3 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </header>

        {/* 中間テーブル */}
        {showInterim && (
          <InterimOrFinalPanel
            title={`途中経過（${results.length}問中 ${results.length}問回答済み）`}
            rows={results}
            onContinue={continueFromInterim}
          />
        )}

        {/* 最終テーブル */}
        {showFinal && (
          <FinalPanel
            rows={results}
            onRestart={restart}
          />
        )}

        {/* 通常の出題カード */}
        {!showInterim && !showFinal && (
          <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 p-6">
            <div className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
              問題 {qIndex + 1} / {total}
            </div>

            <div className="flex items-start justify-between gap-4">
              <p className="mb-4 text-lg leading-relaxed">{question.prompt_jp}</p>
              <button
                type="button"
                onClick={() => setShowCN((v) => !v)}
                className="shrink-0 inline-flex items-center rounded-xl bg-slate-900 px-3 py-1.5 text-white text-xs font-medium shadow hover:bg-black"
              >
                {showCN ? "日本語のみ" : "中国語を表示"}
              </button>
            </div>

            {showCN && (
              <p className="mb-4 text-slate-700">
                <span className="text-xs mr-2 inline-block rounded bg-slate-100 px-2 py-0.5">中文</span>
                {question.prompt_cn}
              </p>
            )}

            {/* 選択肢 */}
            <div className="space-y-3">
              {choices.map((choice, i) => {
                const intent = submitted
                  ? i === correctIndexAfterShuffle
                    ? "correct"
                    : selected === i
                    ? "wrong"
                    : "neutral"
                  : "neutral";
                return (
                  <ChoiceItem
                    key={i}
                    id={`choice-${i}`}
                    label={choice}
                    checked={selected === i}
                    onChange={() => handleChoose(i)}
                    disabled={submitted}
                    intent={intent}
                  />
                );
              })}
            </div>

            {/* 解説 */}
            {submitted && (
              <div
                className={classNames(
                  "mt-6 rounded-2xl px-4 py-3 text-sm ring-1",
                  isCorrect
                    ? "bg-emerald-50 text-emerald-900 ring-emerald-200"
                    : "bg-rose-50 text-rose-900 ring-rose-200"
                )}
              >
                <p className="font-semibold mb-1">
                  {isCorrect ? "正解です！" : "不正解です。"}
                </p>
                <p className="leading-relaxed mb-1">{question.explanation_jp}</p>
                {showCN && (
                  <p className="leading-relaxed text-slate-700">
                    <span className="text-xs mr-2 inline-block rounded bg-slate-100 px-2 py-0.5">中文</span>
                    {question.explanation_cn}
                  </p>
                )}
              </div>
            )}

            {/* 次へ */}
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={next}
                className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-2.5 text-white font-medium shadow-sm hover:bg-indigo-700 disabled:opacity-40"
                disabled={!submitted}
              >
                次へ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** =============================
 *  サブコンポーネント
 * =============================*/
function ChoiceItem({ id, label, checked, disabled, onChange, intent }) {
  const intentClasses =
    intent === "correct"
      ? "ring-2 ring-emerald-400 bg-emerald-50 text-emerald-800"
      : intent === "wrong"
      ? "ring-2 ring-rose-400 bg-rose-50 text-rose-800"
      : "hover:ring-1 hover:ring-slate-300";
  return (
    <label
      htmlFor={id}
      className={`flex items-center gap-3 w-full cursor-pointer rounded-2xl border border-slate-200 px-4 py-3 transition ${intentClasses}`}
    >
      <input
        id={id}
        name="choice"
        type="radio"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 accent-indigo-600"
      />
      <span className="text-slate-800 text-base leading-tight">{label}</span>
    </label>
  );
}

function InterimOrFinalPanel({ title, rows, onContinue }) {
  return (
    <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 p-6">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <ResultsTable rows={rows} />
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => exportTableToPDF(rows, "途中経過 正誤表")}
          className="inline-flex items-center rounded-2xl bg-white px-4 py-2 text-sm font-medium ring-1 ring-slate-300 hover:bg-slate-50"
        >
          PDFで出力
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center rounded-2xl bg-slate-900 px-5 py-2.5 text-white font-medium shadow-sm hover:bg-black"
        >
          続き
        </button>
      </div>
    </div>
  );
}

function FinalPanel({ rows, onRestart }) {
  const total = rows.length;
  const correctCount = rows.filter((r) => r.isCorrect).length;
  return (
    <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 p-6">
      <h2 className="text-lg font-semibold mb-1">最終結果</h2>
      <p className="text-slate-700 mb-4">
        おつかれさま！ 全{total}問中 <span className="font-semibold">{correctCount}</span> 問正解でした。
        とてもよく頑張りました。継続力、最高です！✨
      </p>
      <ResultsTable rows={rows} />
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => exportTableToPDF(rows, "最終 正誤表")}
          className="inline-flex items-center rounded-2xl bg-white px-4 py-2 text-sm font-medium ring-1 ring-slate-300 hover:bg-slate-50"
        >
          PDFで出力
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center rounded-2xl bg-indigo-600 px-5 py-2.5 text-white font-medium shadow-sm hover:bg-indigo-700"
        >
          もう一度
        </button>
      </div>
    </div>
  );
}

function ResultsTable({ rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-slate-200 text-sm">
        <thead className="bg-slate-100">
          <tr>
            <Th>問題文</Th>
            <Th>選択肢</Th>
            <Th>正解</Th>
            <Th>選択</Th>
            <Th>正誤</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} className="border-t border-slate-200">
              <Td className="align-top">{r.prompt}</Td>
              <Td className="align-top text-slate-600">
                {r.choices.join(" / ")}
              </Td>
              <Td className="align-top">{r.correct}</Td>
              <Td className="align-top">{r.selected ?? "—"}</Td>
              <Td className="align-top">{r.isCorrect ? "◯" : "✕"}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="text-left px-3 py-2 border-l first:border-l-0 border-slate-200">
      {children}
    </th>
  );
}
function Td({ children, className }) {
  return (
    <td className={classNames("px-3 py-2", className)}>
      {children}
    </td>
  );
}
