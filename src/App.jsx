import React, { useMemo, useState } from "react";

// 出題データ
const QUESTIONS = [
  {
    prompt_jp: "彼は仕事が忙しい＿＿＿、毎日ジムに通っている。",
    choices: ["にもかかわらず", "によって", "において"],
    correct_index: 0,
    explanation_jp:
      "「にもかかわらず」は逆接を表し、「〜なのに」という意味。忙しいのにジムに通うという逆接の関係を示している。",
  },
];

// 選択肢コンポーネント
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

// シャッフル
function useShuffled(question) {
  return React.useMemo(() => {
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

export default function App() {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const question = QUESTIONS[qIndex];
  const { choices, correctIndexAfterShuffle } = useShuffled(question);

  const isCorrect = submitted && selected === correctIndexAfterShuffle;

  // ★ クリック時に即判定する
  function handleChoose(i) {
    if (submitted) return;           // 既に回答済みなら無視
    setSelected(i);
    setSubmitted(true);
    if (i === correctIndexAfterShuffle) setScore((s) => s + 1);
  }

  function resetQuestion() {
    setSelected(null);
    setSubmitted(false);
  }

  function nextQuestion() {
    const next = qIndex + 1;
    if (next < QUESTIONS.length) {
      setQIndex(next);
    } else {
      setQIndex(0);
      setScore(0);
    }
    setSelected(null);
    setSubmitted(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">日本語文法クイズ</h1>
          <div className="text-sm text-slate-600">
            スコア: <span className="font-semibold">{score}</span> / {QUESTIONS.length}
          </div>
        </header>

        <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 p-6">
          <div className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
            問題 {qIndex + 1} / {QUESTIONS.length}
          </div>
          <p className="mb-6 text-lg leading-relaxed">{question.prompt_jp}</p>

          <div className="space-y-3">
            {choices.map((choice, i) => {
              const intent =
                submitted
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
                  onChange={() => handleChoose(i)}   // ★ここで即判定
                  disabled={submitted}                // 回答後は固定
                  intent={intent}
                />
              );
            })}
          </div>

          {submitted && (
            <div
              className={`mt-6 rounded-2xl px-4 py-3 text-sm ring-1 ${
                isCorrect
                  ? "bg-emerald-50 text-emerald-900 ring-emerald-200"
                  : "bg-rose-50 text-rose-900 ring-rose-200"
              }`}
            >
              <p className="font-semibold mb-1">
                {isCorrect ? "正解です！" : "不正解です。"}
              </p>
              <p className="leading-relaxed">{question.explanation_jp}</p>
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={nextQuestion}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-2.5 text-white font-medium shadow-sm hover:bg-black"
            >
              次へ
            </button>
            <button
              type="button"
              onClick={resetQuestion}
              className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-2.5 font-medium ring-1 ring-slate-300 hover:bg-slate-50"
            >
              もう一度
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
