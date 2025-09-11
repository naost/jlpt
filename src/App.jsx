import React, { useMemo, useRef, useState } from "react";

/** =============================
 *  出題データ（ご指定の問題に置き換え）
 * =============================*/
const QUESTIONS = [
  // 1) 推測・推量（4問）
  {
    prompt_jp: "もしかしたら彼(かれ)はもう駅(えき)に着(つ)いた＿＿＿。",
    prompt_cn: "也许他已经到车站了＿＿＿。",
    choices: ["かもしれない", "から", "のに"],
    correct_index: 0,
    explanation_jp: "「もしかしたら」には不確実な推量「〜かもしれない」を合わせるのが自然。他は理由・逆接で不適。",
    explanation_cn: "与“もしかしたら”最自然的搭配是表示不确定推测的「〜かもしれない」。其余分别表示理由和转折，不合适。",
  },
  {
    prompt_jp: "会議(かいぎ)は午後(ごご)三時(さんじ)から＿＿＿。",
    prompt_cn: "会议是从下午三点开始＿＿＿？",
    choices: ["でしょうか", "かもしれない", "のに"],
    correct_index: 0,
    explanation_jp: "丁寧に相手へ確認する推量疑問は「〜でしょうか」。",
    explanation_cn: "礼貌地向对方确认时用「〜でしょうか」。",
  },
  {
    prompt_jp: "ひょっとすると山田(やまだ)さんは今(いま)出(で)かけている＿＿＿。",
    prompt_cn: "说不定山田先生现在出门了＿＿＿。",
    choices: ["かもしれない", "らしい", "そうだ"],
    correct_index: 0,
    explanation_jp: "「ひょっとすると」は話し手の可能性判断→「〜かもしれない」。伝聞の「らしい」「そうだ」は文脈不適。",
    explanation_cn: "「ひょっとすると」表示说话人的可能性判断，搭配「〜かもしれない」。传闻用法的「らしい」「そうだ」不合语境。",
  },
  {
    prompt_jp: "きっと彼(かれ)は間(ま)に合(あ)う＿＿＿。",
    prompt_cn: "他一定赶得上＿＿＿。",
    choices: ["でしょう", "ようだ", "のに"],
    correct_index: 0,
    explanation_jp: "確信度の高い推量は「きっと〜でしょう」が自然。「ようだ」は観察にもとづく比喩的推定で合わない。",
    explanation_cn: "较强的推测常用「きっと〜でしょう」。而「ようだ」多为基于观察的似乎，不合适。",
  },

  // 2) 理由・原因（4問）
  {
    prompt_jp: "雨(あめ)が降(ふ)った＿＿＿、試合(しあい)は中止(ちゅうし)になった。",
    prompt_cn: "因为下雨＿＿＿，比赛取消了。",
    choices: ["から", "のに", "より"],
    correct_index: 0,
    explanation_jp: "直接的な理由提示は「〜から」。『のに』は逆接、『より』は比較。",
    explanation_cn: "直接表示理由用「〜から」。「のに」是转折，「より」是比较。",
  },
  {
    prompt_jp: "体調(たいちょう)が悪(わる)かった＿＿＿、欠席(けっせき)しました。",
    prompt_cn: "因为身体不适＿＿＿，请假缺席了。",
    choices: ["ので", "ほど", "なら"],
    correct_index: 0,
    explanation_jp: "丁寧な理由は「〜ので」。『ほど』は程度、『なら』は条件。",
    explanation_cn: "较为礼貌的原因说明用「〜ので」。「ほど」是程度，「なら」是条件。",
  },
  {
    prompt_jp: "事故(じこ)の＿＿＿に電車(でんしゃ)が遅延(ちえん)した。",
    prompt_cn: "由于事故＿＿＿，电车晚点了。",
    choices: ["ため", "ので", "のに"],
    correct_index: 0,
    explanation_jp: "名詞＋「のために」で理由・原因。「ので」「のに」はここでは接続できない形。",
    explanation_cn: "名词＋「のために」表示原因。「ので」「のに」在此结构中不成立。",
  },
  {
    prompt_jp: "道(みち)が混(こ)んでいた＿＿＿、遅(おく)れてしまいました。",
    prompt_cn: "因为路堵＿＿＿，我迟到了。",
    choices: ["ので", "のに", "ほど"],
    correct_index: 0,
    explanation_jp: "客観的な理由説明は「〜ので」が自然。『のに』は逆接、『ほど』は程度。",
    explanation_cn: "客观地说明理由用「〜ので」更自然。「のに」是转折，「ほど」是程度。",
  },

  // 3) 逆接（4問）
  {
    prompt_jp: "お金(かね)がない＿＿＿、旅行(りょこう)に行(い)きたい。",
    prompt_cn: "虽然没钱＿＿＿，还是想去旅行。",
    choices: ["のに", "から", "ために"],
    correct_index: 0,
    explanation_jp: "事実と期待の逆転は「〜のに」。他は理由・目的で不適。",
    explanation_cn: "事实与预期相反用「〜のに」。其余为理由或目的，不合适。",
  },
  {
    prompt_jp: "雨天(うてん)＿＿＿、大会(たいかい)は予定(よてい)どおり実施(じっし)された。",
    prompt_cn: "尽管是雨天＿＿＿，大会仍按计划举行。",
    choices: ["にもかかわらず", "によって", "ために"],
    correct_index: 0,
    explanation_jp: "強い逆接・硬い文体には「にもかかわらず」が最適。",
    explanation_cn: "表示强烈让步且为书面语时，用「にもかかわらず」最合适。",
  },
  {
    prompt_jp: "彼(かれ)は疲(つか)れている＿＿＿、誰(だれ)の頼(たの)みも断(ことわ)らない。",
    prompt_cn: "他明明很累＿＿＿，却谁的请求也不拒绝。",
    choices: ["のに", "ので", "から"],
    correct_index: 0,
    explanation_jp: "逆接は「のに」。『ので』『から』は理由で意味が逆になる。",
    explanation_cn: "转折用「のに」。用「ので」「から」会变成原因说明，与语义相反。",
  },
  {
    prompt_jp: "警告(けいこく)を受(う)けた＿＿＿、彼(かれ)は作業(さぎょう)を続(つづ)けた。",
    prompt_cn: "即使收到了警告＿＿＿，他还是继续工作。",
    choices: ["にもかかわらず", "ので", "から"],
    correct_index: 0,
    explanation_jp: "不利な条件でも行為が続く→強い逆接「にもかかわらず」。",
    explanation_cn: "在不利条件下仍继续行为→用强烈让步的「にもかかわらず」。",
  },

  // 4) 条件（5問）
  {
    prompt_jp: "雨(あめ)が降(ふ)っ＿＿＿、試合(しあい)は中止(ちゅうし)になります。",
    prompt_cn: "如果下雨＿＿＿，比赛就会取消。",
    choices: ["たら", "なら", "ことがある"],
    correct_index: 0,
    explanation_jp: "仮定条件の基本は「〜たら」。",
    explanation_cn: "假定条件基本形式是「〜たら」。",
  },
  {
    prompt_jp: "もっと安(やす)けれ＿＿＿、買(か)います。",
    prompt_cn: "如果再便宜一点＿＿＿，我就买。",
    choices: ["ば", "たら", "と"],
    correct_index: 0,
    explanation_jp: "形容詞の仮定は「安ければ」。",
    explanation_cn: "形容词的假设形用「〜ければ」。",
  },
  {
    prompt_jp: "このボタンを押(お)す＿＿＿、電源(でんげん)が入(はい)ります。",
    prompt_cn: "一按这个按钮＿＿＿，电源就会开启。",
    choices: ["と", "なら", "のに"],
    correct_index: 0,
    explanation_jp: "一般的・自動的結果には確定条件「〜と」。",
    explanation_cn: "表示一般/自动结果用确定条件「〜と」。",
  },
  {
    prompt_jp: "日本(にほん)へ行(い)く＿＿＿、春(はる)がいいですよ。",
    prompt_cn: "如果要去日本＿＿＿，春天最好哦。",
    choices: ["なら", "と", "たら"],
    correct_index: 0,
    explanation_jp: "前提知識にもとづく助言・勧誘は「〜なら」。",
    explanation_cn: "基于对方计划/前提提出建议时用「〜なら」。",
  },
  {
    prompt_jp: "駅(えき)に着(つ)い＿＿＿、電話(でんわ)してください。",
    prompt_cn: "到车站＿＿＿，请给我打电话。",
    choices: ["たら", "なら", "ば"],
    correct_index: 0,
    explanation_jp: "時間の先後関係（到着後の依頼）は「〜たら」が自然。",
    explanation_cn: "表示先后顺序（到达后再联系）用「〜たら」最自然。",
  },

  // 5) 受身・使役（4問）
  {
    prompt_jp: "私(わたし)は先生(せんせい)に褒(ほ)め＿＿＿。",
    prompt_cn: "我被老师表扬了＿＿＿。",
    choices: ["られた", "させた", "ている"],
    correct_index: 0,
    explanation_jp: "動作主からの影響を受ける→受身「〜られた」。",
    explanation_cn: "受到他人动作影响→用被动态「〜られた」。",
  },
  {
    prompt_jp: "母(はは)は子(こ)どもに野菜(やさい)を食(た)べ＿＿＿、テレビを見(み)せた。",
    prompt_cn: "妈妈让孩子把蔬菜吃完＿＿＿，才给看电视。",
    choices: ["させた", "られた", "にした"],
    correct_index: 0,
    explanation_jp: "他者に行為を行わせる→使役「〜させた」。",
    explanation_cn: "让他人去做→使役形「〜させた」。",
  },
  {
    prompt_jp: "部長(ぶちょう)に出張(しゅっちょう)を命(めい)じ＿＿＿。",
    prompt_cn: "我被部长命令去出差＿＿＿。",
    choices: ["られた", "させた", "している"],
    correct_index: 0,
    explanation_jp: "「命じられた」は受身で『命令を受けた』の意味。",
    explanation_cn: "「命じられた」为被动态，表示“被命令”。",
  },
  {
    prompt_jp: "先生(せんせい)は学生(がくせい)に発表(はっぴょう)をさせ＿＿＿。",
    prompt_cn: "老师让学生进行发表＿＿＿。",
    choices: ["た", "られた", "ている"],
    correct_index: 0,
    explanation_jp: "使役の過去形「させた」が唯一自然。",
    explanation_cn: "使役过去式「させた」最自然，其他不当。",
  },

  // 6) 敬語（お/ご〜になる）（4問）
  {
    prompt_jp: "先生(せんせい)は明日(あした)こちらにお越(こ)し＿＿＿ます。",
    prompt_cn: "老师明天要过来这边＿＿＿。",
    choices: ["になり", "する", "られる"],
    correct_index: 0,
    explanation_jp: "尊敬語「お越しになる」。連用形＋「ます」で「お越しになります」。",
    explanation_cn: "尊敬语是「お越しになる」，连用接「ます」构成「お越しになります」。",
  },
  {
    prompt_jp: "部長(ぶちょう)はこの資料(しりょう)をお読(よ)み＿＿＿か。",
    prompt_cn: "部长会读这份资料＿＿＿吗？",
    choices: ["になります", "します", "されます"],
    correct_index: 0,
    explanation_jp: "尊敬語は「お読みになりますか」。『お読みされます』は二重敬語で誤り。",
    explanation_cn: "尊敬形式为「お読みになりますか」。「お読みされます」属双重敬语，错误。",
  },
  {
    prompt_jp: "社長(しゃちょう)は結果(けっか)をご覧(らん)＿＿＿ました。",
    prompt_cn: "社长已经看过结果＿＿＿。",
    choices: ["になり", "する", "いたす"],
    correct_index: 0,
    explanation_jp: "尊敬語「ご覧になる」の過去形→「ご覧になりました」。",
    explanation_cn: "尊敬语「ご覧になる」的过去式是「ご覧になりました」。",
  },
  {
    prompt_jp: "田中(たなか)先生(せんせい)は来週(らいしゅう)この件(けん)についてお話(はな)し＿＿＿。",
    prompt_cn: "田中老师下周会就此事发表讲话＿＿＿。",
    choices: ["になります", "いたします", "させます"],
    correct_index: 0,
    explanation_jp: "尊敬語は「お話しになります」。『いたします』は謙譲で主語が話し手のとき。",
    explanation_cn: "尊敬表达为「お話しになります」。「いたします」是谦让语，仅说话人作为主语时使用。",
  },

  // 7) 時間関係（とき・あいだ・うちに）（4問）
  {
    prompt_jp: "授業(じゅぎょう)が始(はじ)まる＿＿＿、教室(きょうしつ)に入(はい)った。",
    prompt_cn: "在上课开始＿＿＿，我进了教室。",
    choices: ["とき", "あいだ", "うちに"],
    correct_index: 0,
    explanation_jp: "一点の時を表すのは「〜とき」。",
    explanation_cn: "表示某一时间点用「〜とき」。",
  },
  {
    prompt_jp: "休暇(きゅうか)の＿＿＿、ずっと祖父母(そふぼ)の家(いえ)に泊(と)まっていた。",
    prompt_cn: "在假期＿＿＿，我一直住在祖父母家。",
    choices: ["あいだ", "とき", "うちに"],
    correct_index: 0,
    explanation_jp: "期間中ずっと継続→「〜あいだ」。",
    explanation_cn: "在一段期间内持续发生→用「〜あいだ」。",
  },
  {
    prompt_jp: "熱(あつ)い＿＿＿に、このお茶(ちゃ)を飲(の)んでください。",
    prompt_cn: "趁热＿＿＿，请喝这杯茶。",
    choices: ["うち", "とき", "あいだ"],
    correct_index: 0,
    explanation_jp: "状態が変わる前に行う→「熱いうちに」。",
    explanation_cn: "在状态改变之前做→用「〜うちに」。",
  },
  {
    prompt_jp: "若(わか)い＿＿＿に、いろいろ挑戦(ちょうせん)したほうがいい。",
    prompt_cn: "趁年轻＿＿＿，多尝试一些比较好。",
    choices: ["うち", "あいだ", "とき"],
    correct_index: 0,
    explanation_jp: "機会がある間にしておく→「若いうちに」。",
    explanation_cn: "趁着还有机会→用「若いうちに」。",
  },

  // 8) 比較（より・ほど・くらい）（4問）
  {
    prompt_jp: "東京(とうきょう)は大阪(おおさか)＿＿＿人(ひと)が多(おお)い。",
    prompt_cn: "东京比大阪＿＿＿人多。",
    choices: ["より", "まで", "でも"],
    correct_index: 0,
    explanation_jp: "比較基本型「A は B より〜」。",
    explanation_cn: "比较基本形式为「A は B より〜」。",
  },
  {
    prompt_jp: "今年(ことし)の冬(ふゆ)は去年(きょねん)＿＿＿寒(さむ)くない。",
    prompt_cn: "今年冬天不如去年那么冷＿＿＿。",
    choices: ["ほど", "より", "くらい"],
    correct_index: 0,
    explanation_jp: "否定形と相性がよいのは「〜ほど〜ない」。",
    explanation_cn: "与否定形式搭配最自然的是「〜ほど〜ない」。",
  },
  {
    prompt_jp: "一日(いちにち)に三(さん)回(かい)＿＿＿水(みず)を飲(の)む。",
    prompt_cn: "一天喝水大约三次＿＿＿。",
    choices: ["くらい", "より", "まで"],
    correct_index: 0,
    explanation_jp: "おおよその数量には「〜くらい」。",
    explanation_cn: "表示大约数量用「〜くらい」。",
  },
  {
    prompt_jp: "私(わたし)は弟(おとうと)＿＿＿背(せ)が高(たか)くない。",
    prompt_cn: "我的个子没有弟弟那么高＿＿＿。",
    choices: ["ほど", "より", "くらい"],
    correct_index: 0,
    explanation_jp: "否定比較は「A は B ほど〜ない」。",
    explanation_cn: "否定比较用「A は B ほど〜ない」。",
  },

  // 9) 目的（ために・ように）（4問）
  {
    prompt_jp: "健康(けんこう)の＿＿＿に毎日(まいにち)歩(ある)いている。",
    prompt_cn: "为了健康＿＿＿，我每天散步。",
    choices: ["ため", "よう", "ので"],
    correct_index: 0,
    explanation_jp: "名詞＋「のために」で目的。「よう」はこの形では不可。",
    explanation_cn: "名词＋「のために」表示目的；「よう」在此结构不成立。",
  },
  {
    prompt_jp: "日本語(にほんご)が話(はな)せる＿＿＿、毎日(まいにち)練習(れんしゅう)している。",
    prompt_cn: "为了能说日语＿＿＿，我每天练习。",
    choices: ["ように", "ために", "ので"],
    correct_index: 0,
    explanation_jp: "可能形・否定形の目標は「〜ように」。",
    explanation_cn: "与可能形/否定形连用表达目标时用「〜ように」。",
  },
  {
    prompt_jp: "忘(わす)れない＿＿＿、メモを取(と)った。",
    prompt_cn: "为了不忘记＿＿＿，我做了笔记。",
    choices: ["ように", "から", "ので"],
    correct_index: 0,
    explanation_jp: "未然を目的化→「忘れないように」。",
    explanation_cn: "将未然行为目的化→用「忘れないように」。",
  },
  {
    prompt_jp: "仕事(しごと)の＿＿＿に新(あたら)しいパソコンを買(か)った。",
    prompt_cn: "为了工作＿＿＿，我买了新电脑。",
    choices: ["ため", "よう", "から"],
    correct_index: 0,
    explanation_jp: "名詞目的は「〜のために」が唯一自然。",
    explanation_cn: "名词作目的时仅「〜のために」自然。",
  },

  // 10) 経験（ことがある）（4問）
  {
    prompt_jp: "一度(いちど)富士山(ふじさん)に登(のぼ)った＿＿＿がある。",
    prompt_cn: "我曾经爬过一次富士山＿＿＿。",
    choices: ["こと", "よう", "ところ"],
    correct_index: 0,
    explanation_jp: "過去経験は「〜たことがある」。",
    explanation_cn: "过去经验表达用「〜たことがある」。",
  },
  {
    prompt_jp: "この映画(えいが)を見(み)た＿＿＿がある。",
    prompt_cn: "这部电影我看过＿＿＿。",
    choices: ["こと", "もの", "ところ"],
    correct_index: 0,
    explanation_jp: "経験固定句型「〜たことがある」。",
    explanation_cn: "固定表达“有过……经验”用「〜たことがある」。",
  },
  {
    prompt_jp: "海外(かいがい)で暮(く)らした＿＿＿がある。",
    prompt_cn: "我有在海外生活过的经历＿＿＿。",
    choices: ["こと", "のに", "よう"],
    correct_index: 0,
    explanation_jp: "名詞化して経験化→「暮らしたことがある」。",
    explanation_cn: "名词化表示经验→「暮らしたことがある」。",
  },
  {
    prompt_jp: "彼(かれ)と話(はな)した＿＿＿がある。",
    prompt_cn: "我和他聊过天＿＿＿。",
    choices: ["こと", "よう", "ため"],
    correct_index: 0,
    explanation_jp: "経験を述べる定型は「〜たことがある」。",
    explanation_cn: "表达过往经历的定型是「〜たことがある」。",
  },

  // 11) 変化（ようになる・ことになる）（4問）
  {
    prompt_jp: "日本語(にほんご)が話(はな)せるように＿＿＿。",
    prompt_cn: "变得能说日语了＿＿＿。",
    choices: ["なった", "する", "している"],
    correct_index: 0,
    explanation_jp: "能力・習慣の変化→「〜ようになる」。",
    explanation_cn: "能力/习惯发生变化→用「〜ようになる」。",
  },
  {
    prompt_jp: "会議(かいぎ)は来週(らいしゅう)からオンラインで行(おこな)う＿＿＿になった。",
    prompt_cn: "会议决定从下周起改为线上进行＿＿＿。",
    choices: ["こと", "よう", "ため"],
    correct_index: 0,
    explanation_jp: "規則・決定による変化は「〜ことになった」。",
    explanation_cn: "由规定/决定导致的变化用「〜ことになった」。",
  },
  {
    prompt_jp: "最近(さいきん)、早(はや)く起(お)きるように＿＿＿。",
    prompt_cn: "最近我开始变得早起了＿＿＿。",
    choices: ["なった", "する", "した"],
    correct_index: 0,
    explanation_jp: "習慣が身につく→「〜ようになった」。",
    explanation_cn: "习惯形成→用「〜ようになった」。",
  },
  {
    prompt_jp: "出張(しゅっちょう)の⽇程(にってい)は会社(かいしゃ)が決(き)める＿＿＿になっている。",
    prompt_cn: "出差日程由公司决定＿＿＿（规定如此）。",
    choices: ["こと", "よう", "ため"],
    correct_index: 0,
    explanation_jp: "規定・習慣としての取り決め→「〜ことになっている」。",
    explanation_cn: "作为规定/惯例的约定→用「〜ことになっている」。",
  },

  // 12) 伝聞・様態（そうだ・らしい・ようだ）（5問）
  {
    prompt_jp: "空(そら)が暗(くら)くなってきた。雨(あめ)が降(ふ)り＿＿＿。",
    prompt_cn: "天色变暗了。好像要下雨＿＿＿。",
    choices: ["そうだ", "らしい", "ようだ"],
    correct_index: 0,
    explanation_jp: "動詞の連用形＋「そうだ」は様態（見ための判断）を表す。",
    explanation_cn: "动词连用形＋「そうだ」表示样态（根据外观判断）。",
  },
  {
    prompt_jp: "田中(たなか)さんは風邪(かぜ)をひいている＿＿＿と聞(き)いた。",
    prompt_cn: "听说田中先生感冒了＿＿＿。",
    choices: ["らしい", "そうだ", "ようだ"],
    correct_index: 0,
    explanation_jp: "伝聞情報＋「と聞いた」には推定の「らしい」が自然。",
    explanation_cn: "有“听说”之类传闻信息时，「らしい」更自然。",
  },
  {
    prompt_jp: "遠(とお)くから音楽(おんがく)が聞(き)こえる＿＿＿。",
    prompt_cn: "好像能听到远处传来的音乐＿＿＿。",
    choices: ["ようだ", "らしい", "そうだ"],
    correct_index: 0,
    explanation_jp: "五感にもとづく客観的な様子の判断→「〜ようだ」。",
    explanation_cn: "基于感官的客观判断→用「〜ようだ」。",
  },
  {
    prompt_jp: "あの店(みせ)は評判(ひょうばん)がよく、いつもおいし＿＿＿ケーキが並(なら)んでいる。",
    prompt_cn: "那家店口碑很好，总是摆着看起来好吃的蛋糕＿＿＿。",
    choices: ["そうな", "らしい", "ようだ"],
    correct_index: 0,
    explanation_jp: "名詞を修飾する様態は「おいしそうなN」。他は形が合わない。",
    explanation_cn: "修饰名词的样态用「おいしそうな＋名词」。其他形式不匹配。",
  },
  {
    prompt_jp: "ニュース(にゅーす)に よ(よ)る と、来年(らいねん)税金(ぜいきん)が上(あ)がる＿＿＿。",
    prompt_cn: "据新闻报道，明年税金要上涨＿＿＿。",
    choices: ["そうだ", "ようだ", "のに"],
    correct_index: 0,
    explanation_jp: "情報源提示「〜によると」→伝聞の「〜そうだ」。",
    explanation_cn: "出现信息来源「〜によると」时，用传闻的「〜そうだ」。",
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
