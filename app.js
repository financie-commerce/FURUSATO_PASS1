const screen = document.querySelector("#screen");
const toast = document.querySelector("#toast");
const modalRoot = document.querySelector("#modalRoot");
const navItems = [...document.querySelectorAll(".nav-item")];
const noticeButton = document.querySelector(".notice-button");
let route = "home";
let story = "concept";
let registered = false;
let tokenBalance = 128;
let lifetimePoints = 2480;
let checkinPoints = 820;
let limitedPoints = 1420;
let tradeMode = "exchange";
let tradeAmount = 1000;
let noticeTab = "personal";
let personalUnread = 3;
let toastTimer;

const personalNotices = [
  { type: "特典", title: "水辺文化祭の先行受付が始まりました", body: "現在の称号で利用できる特典です。9月30日まで申し込めます。", time: "今日" },
  { type: "称号", title: "水縁ガイドまであと520ptです", body: "地域イベントへの参加や来訪で、生涯ポイントが積み上がります。", time: "今日" },
  { type: "予定", title: "川辺清掃は明日開催です", body: "集合は8:00、水縁河川公園の案内所前です。", time: "昨日" },
];

const icons = {
  home: '<path d="M3 11 12 3l9 8"/><path d="M5 10v11h14V10"/><path d="M9 21v-7h6v7"/>',
  discover: '<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/><path d="m9 13 2-5 2 5-4-2h4"/>',
  member: '<rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="8" cy="11" r="2"/><path d="M5.5 16a3 3 0 0 1 5 0"/><path d="M13 10h5"/><path d="M13 14h4"/>',
  store: '<path d="M5 10h14l-1-5H6l-1 5Z"/><path d="M6 10v10h12V10"/><path d="M9 20v-5h6v5"/>',
  profile: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>',
};

const svg = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;
navItems.forEach((item) => { item.querySelector("span").innerHTML = svg(item.dataset.icon); });

const stories = {
  concept: [
    ["01 / REGISTER", "第2のふるさとを持つ", "関心のある地域へ簡単に登録し、公式情報と関わりの入口をひとつに。"],
    ["02 / DEEPEN", "行動を関係へ変える", "来訪・参加・担い手活動を記録し、継続的な関係性を可視化。"],
    ["03 / RETAIN", "持ち続けたい関係へ", "保有者だけの体験を届け、地域との関係が続く理由を育てる。"],
  ],
  system: [
    ["PUBLIC", "国の登録基盤", "ベーシック／プレミアム登録と本人確認を担う共通プラットフォーム。"],
    ["LOCAL", "水縁市の活動基盤", "イベント、担い手募集、来訪記録を既存サービスとつなぐ。"],
    ["PRIVATE", "FiNANCiE経済圏", "購買還元・トークン保有・民間特典を行政資格と分けて運用。"],
  ],
  pilot: [
    ["KPI 01", "関係の深さ", "90日再訪率、活動参加回数、プレミアム候補への転換率。"],
    ["KPI 02", "地域経済", "参加店送客数、購入額、有料体験利用、限定ポイント利用率。"],
    ["KPI 03", "関係の継続性", "トークン交換率、継続保有率、返却率から地域体験の魅力を検証。"],
  ],
};

function renderStory() {
  document.querySelector("#storyPanel").innerHTML = stories[story].map(([small,title,text]) => `<article><small>${small}</small><h2>${title}</h2><p>${text}</p></article>`).join("");
}

const sectionHead = (label,title,action="") => `<div class="section-head"><div><p class="eyebrow">${label}</p><h2>${title}</h2></div>${action}</div>`;
const format = (value) => new Intl.NumberFormat("ja-JP").format(value);
const holderStages = [
  { threshold: 500, name: "Co-Creator" },
  { threshold: 200, name: "Partner" },
  { threshold: 50, name: "Supporter" },
  { threshold: 0, name: "Member" },
];
const holderBenefits = [
  { threshold: 500, name: "地域プロジェクト提案会" },
  { threshold: 200, name: "水辺文化祭・企画会議" },
  { threshold: 50, name: "活動の先行案内" },
];
const getHolderStage = (balance) => holderStages.find((stage) => balance >= stage.threshold);
const getLostBenefits = (before, after) => holderBenefits.filter((benefit) => before >= benefit.threshold && after < benefit.threshold);
const scoreTitles = [
  { threshold: 10000, name: "水縁パートナー", benefit: "地域施設の年間パス" },
  { threshold: 6000, name: "水縁アンバサダー", benefit: "市内体験の季節クーポン" },
  { threshold: 3000, name: "水縁ガイド", benefit: "水辺市場ドリンククーポン" },
  { threshold: 1000, name: "水縁フレンド", benefit: "川辺ラウンジ月1回利用" },
  { threshold: 0, name: "水縁ビギナー", benefit: "住民向け情報の配信" },
];
const getScoreTitle = (points) => scoreTitles.find((title) => points >= title.threshold);
const getNextScoreTitle = (points) => [...scoreTitles].reverse().find((title) => title.threshold > points);
const getScoreProgress = (points) => {
  const current = getScoreTitle(points);
  const next = getNextScoreTitle(points);
  return next ? Math.round(((points - current.threshold) / (next.threshold - current.threshold)) * 100) : 100;
};
function pushPersonalNotice(type, title, body) {
  personalNotices.unshift({ type, title, body, time: "たった今" });
  personalUnread += 1;
  syncNoticeBadge();
}
function syncNoticeBadge() {
  const badge = noticeButton.querySelector(".notice-badge");
  badge.hidden = personalUnread === 0;
  badge.textContent = personalUnread > 9 ? "9+" : personalUnread;
  badge.setAttribute("aria-label", `未読${personalUnread}件`);
}

function home() {
  return `<section class="hero"><span class="status-chip">● ベーシック登録済み</span><small>水縁市公認・ふるさと住民</small><h1>もうひとつの住民として、まちの力になる。</h1><p>訪れる、手伝う、買う。一人ひとりの関わりを記録し、水縁市との関係を育てます。</p><div class="hero-actions"><button type="button" data-route="discover">今日できること</button><button class="ghost" type="button" data-route="memberCard">会員証を見る</button></div></section>
  <section>${sectionHead("MIZUBE NEWS","地域の最新ニュース",'<button class="text-button" type="button" data-route="notices">すべて見る</button>')}<button class="featured-news" type="button" data-route="notices"><div class="featured-news-image"></div><div><small>水縁市公式・今日</small><h2>水辺市場に、新しいつくり手が加わります</h2><p>秋の開催に向けて、地域の食と手仕事を届ける出店者をご紹介します。</p><strong>活動報告を読む →</strong></div></button></section>
  <section>${sectionHead("YOUR BENEFITS","今使える特典")}<div class="home-benefits"><button type="button" data-action="benefit"><span>先行</span><div><h3>水辺文化祭の先行受付</h3><p>ふるさと住民限定・9月末まで</p></div></button><button type="button" data-action="benefit"><span>体験</span><div><h3>川辺ラウンジ利用</h3><p>会員証の提示で利用できます</p></div></button></div></section>
  <section>${sectionHead("TODAY'S ACTION","今日からできる関わり",'<button class="text-button" type="button" data-route="discover">すべて見る</button>')}<div class="action-grid"><button type="button" data-action="checkin"><span class="action-icon">◎</span>水辺市場を訪れる<small>生涯ポイント対象</small></button><button type="button" data-action="volunteer"><span class="action-icon">手</span>川辺を一緒に守る<small>生涯ポイント対象</small></button><button type="button" data-route="store"><span class="action-icon">買</span>地域の品を選ぶ<small>限定ポイント還元</small></button></div></section>`;
}

function registerPage() {
  return `<section class="page-lead"><p class="eyebrow">FURUSATO RESIDENT</p><h1>水縁市を、もうひとつのふるさとに。</h1><p>登録は地域との関係の入口。活動を重ねることで、担い手としての関わりへ進めます。</p></section>
  <article class="register-card"><div class="row-between"><div><p class="eyebrow">BASIC</p><h2>ベーシック登録</h2></div><span class="phase-label">${registered ? "登録済み" : "すぐに登録"}</span></div><p>水縁市に関心がある方なら、地域外からでも登録できます。</p><div class="register-features"><span>関心に合わせた公式情報</span><span>イベント・活動募集の案内</span><span>デジタル登録証</span></div><button class="wide-button" type="button" data-action="register">${registered ? "登録証を表示する" : "水縁市に登録する"}</button></article>
  <article class="register-card is-premium"><div class="row-between"><div><p class="eyebrow">PREMIUM</p><h2>プレミアム登録</h2></div><span class="phase-label">活動 2 / 3回</span></div><p>自治体が指定する担い手活動を重ねた方が申請できる上位登録です。購入額やトークン数では判定しません。</p><div class="register-features"><span>担い手活動のサポート</span><span>公共施設等の利用支援</span><span>年1回、活動実績を確認</span></div><button class="wide-button" type="button" disabled>あと1回の対象活動で申請候補</button></article>`;
}

function memberCardPage() {
  return `<section class="member-screen"><div class="member-title"><p class="eyebrow">DIGITAL RESIDENT CARD</p><h1>水縁市 会員証</h1><p>施設やイベントで、この画面をご提示ください。</p></div><section class="resident-card member-large"><small>MIZUBE FURUSATO RESIDENT</small><h2>水縁市 ベーシック住民証</h2><p>登録番号：MZB-2026-00842</p><div class="member-code" aria-label="会員証コード">${"<i></i>".repeat(12)}</div><strong>大西 太郎 さん</strong></section><button class="wide-button" type="button" data-route="register">登録区分と条件を見る</button></section>`;
}

function tokenPage() {
  return `<section class="page-lead token-lead"><p class="eyebrow">MIZUBE TOKEN</p><h1>水縁トークン</h1><p>水縁市とのつながりを表す、持って楽しむデジタルグッズです。</p></section>
  <section class="token-holding"><div><span>保有数</span><strong>${format(tokenBalance)}</strong><small>${getHolderStage(tokenBalance).name} ステージ</small></div><button class="info-button" type="button" data-info="token">トークンとは？</button></section>
  <div class="exchange-choice"><button type="button" data-trade="exchange"><span>交換</span><strong>限定ポイントから増やす</strong></button><button type="button" data-trade="return"><span>返却</span><strong>保有を終えてFiNANCiEへ</strong></button></div>
  <section>${sectionHead("HOLDER BENEFITS","保有数に応じた体験")}<div class="benefit-list"><article><span>50</span><div><h3>活動の先行案内</h3><p>担い手募集を一般公開前にお知らせ</p></div><strong>利用中</strong></article><article><span>200</span><div><h3>水辺文化祭・企画会議</h3><p>オンライン企画会議への参加枠</p></div><strong>あと${Math.max(0,200-tokenBalance)}</strong></article><article><span>500</span><div><h3>地域プロジェクト提案会</h3><p>事業者・市職員との共創セッション</p></div><strong>あと${Math.max(0,500-tokenBalance)}</strong></article></div></section>
  <p class="disclaimer">トークンは商品・サービスの支払いには使用せず、消費されません。表示内容は実証検討用のサンプルです。</p>`;
}

function tradePage() {
  const isExchange = tradeMode === "exchange";
  const receive = isExchange ? Math.floor(tradeAmount / 48.2) : Math.floor(tradeAmount * 45.6);
  const enough = isExchange ? limitedPoints >= tradeAmount : tokenBalance >= tradeAmount;
  const afterBalance = isExchange ? tokenBalance + receive : tokenBalance - tradeAmount;
  const beforeStage = getHolderStage(tokenBalance);
  const afterStage = getHolderStage(Math.max(0, afterBalance));
  const lostBenefits = isExchange ? [] : getLostBenefits(tokenBalance, afterBalance);
  const returnImpact = !isExchange ? `<div class="return-impact ${beforeStage.name !== afterStage.name ? "has-change" : ""}"><p><span>生涯ポイント</span><strong>${format(lifetimePoints)} ptのまま</strong></p><p><span>トークン保有数</span><strong>${format(tokenBalance)} → ${format(afterBalance)}</strong></p><p><span>保有ステージ</span><strong>${beforeStage.name}${beforeStage.name !== afterStage.name ? ` → ${afterStage.name}` : "を維持"}</strong></p>${lostBenefits.length ? `<div class="benefit-warning"><strong>利用できなくなる特典</strong><span>${lostBenefits.map((benefit)=>benefit.name).join("、")}</span></div>` : `<small>今回の返却では、現在の保有者特典は変わりません。</small>`}</div>` : "";
  return `<button class="back-link" type="button" data-route="token">← 水縁トークンへ戻る</button><section class="page-lead"><p class="eyebrow">${isExchange ? "EXCHANGE" : "RETURN"}</p><h1>${isExchange ? "限定ポイントと交換" : "トークンを返却"}</h1><p>${isExchange ? "使う限定ポイントを選ぶと、現在受け取れるトークン数を確認できます。" : "返却する数量を選ぶと、現在の返却条件を確認できます。返却後の管理はFiNANCiEで行います。"}</p></section>
  <div class="trade-tabs"><button class="${isExchange ? "is-active" : ""}" type="button" data-trade="exchange">交換</button><button class="${!isExchange ? "is-active" : ""}" type="button" data-trade="return">返却</button></div>
  <section class="trade-card"><div class="trade-balance"><span>${isExchange ? "利用できる限定ポイント" : "保有しているトークン"}</span><strong>${format(isExchange ? limitedPoints : tokenBalance)}${isExchange ? " pt" : ""}</strong></div><p class="trade-label">${isExchange ? "交換に使うポイント" : "返却するトークン"}</p><div class="amount-options">${(isExchange ? [500,1000,1400] : [10,50,100]).map((amount)=>`<button class="${tradeAmount===amount ? "is-active" : ""}" type="button" data-amount="${amount}">${format(amount)}</button>`).join("")}</div>
  <div class="live-quote"><small>現在の${isExchange ? "交換" : "返却"}条件</small><div><span>${format(tradeAmount)}${isExchange ? " pt" : " トークン"}</span><b>→</b><strong>${format(receive)}${isExchange ? " トークン" : "円"}</strong></div><p>この条件はリアルタイムで変動します</p></div>${returnImpact}
  <div class="quote-alert"><strong>確定前にご確認ください</strong><p>${isExchange ? "需給のバランスにより、最終的に受け取る数量が変わることがあります。" : "返却した分の保有者特典は終了します。返却後の売上金確認・出金はFiNANCiEで行います。"} 次のボタンを押すと${isExchange ? "交換" : "返却"}が確定します。</p></div><button class="wide-button" type="button" data-confirm-trade ${enough ? "" : "disabled"}>この条件で${isExchange ? "交換" : "返却"}を確定</button></section>`;
}

const places = [
  ["担い手活動","川辺の景観を守る朝の清掃活動","9月21日 8:00・水縁河川公園","参加後に生涯ポイント +200pt","82% center"],
  ["地域イベント","つくる人と暮らす人の水辺市場","毎月第2土曜・駅前広場","来訪で生涯ポイント +30pt","12% center"],
  ["有料体験","清流をめぐる半日パドルツアー","RIVERBASE みなも","限定ポイント還元","100% center"],
  ["地域事業者","水縁の台所 みのり食堂","本町商店街・11:00〜20:00","限定ポイント還元","2% center"],
];

function discoverPage() {
  return `<section class="page-lead"><p class="eyebrow">DISCOVER & JOIN</p><h1>観光の、その先へ。</h1><p>訪れるだけの日も、まちを手伝う日も。自分に合う水縁市との関わり方を見つけられます。</p></section><div class="place-list">${places.map((p,i)=>`<button class="place-card" type="button" data-action="place-${i}"><div class="place-image" style="--position:${p[4]}"></div><div class="place-body"><small>${p[0]}</small><h2>${p[1]}</h2><p>${p[2]}</p><strong>${p[3]}</strong></div></button>`).join("")}</div>`;
}

const products = [
  ["みのり食堂","季節の水縁御膳・食事券","地元農家の野菜と川魚を楽しむ限定御膳。",2800,"限定pt 84還元","3% center"],
  ["RIVERBASE みなも","清流パドルツアー","初心者向け講習と道具一式を含む半日体験。",7800,"限定pt 390還元","98% center"],
  ["水辺市場","水縁の恵み便","旬の野菜、茶、加工品を詰め合わせた地域便。",4500,"限定pt 225還元","10% center"],
];

function storePage() {
  return `<section class="page-lead"><p class="eyebrow">LOCAL COMMERCE</p><h1>買うことも、関わること。</h1><p>現金等で購入でき、商品・有料体験に応じて水縁市限定ポイントが購入者本人へ還元されます。</p></section><div class="store-guide"><span>お支払い</span><strong>現金・カードなど</strong><i>+</i><span>限定ポイント</span><strong>使う・貯める</strong></div><div class="store-grid">${products.map((p,i)=>`<article class="store-card"><div class="store-image" style="--position:${p[5]}"></div><div class="store-body"><small>${p[0]}</small><h2>${p[1]}</h2><p>${p[2]}</p><div class="price-row"><strong>¥${format(p[3])}</strong><span>${p[4]}</span></div><button class="wide-button" type="button" data-action="buy-${i}" style="margin-top:12px">内容を確認する</button></div></article>`).join("")}</div>`;
}

function profilePage() {
  const currentTitle = getScoreTitle(lifetimePoints);
  const nextTitle = getNextScoreTitle(lifetimePoints);
  const progress = getScoreProgress(lifetimePoints);
  return `<section class="profile-intro"><div><p class="eyebrow">MY RELATIONSHIP</p><h1>水縁市とのつながり</h1></div><button type="button" data-route="memberCard">会員証</button></section>
  <section class="wallet-card token-wallet"><div class="wallet-head"><div><small>デジタルグッズ</small><h2>水縁トークン</h2></div><button class="info-button" type="button" data-info="token">トークンとは？</button></div><div class="wallet-value"><strong>${format(tokenBalance)}</strong><span>保有</span></div><button class="wallet-link" type="button" data-route="token">特典・交換・返却を見る →</button></section>
  <section class="wallet-card score-wallet"><div class="wallet-head"><div><small>水縁市との関わり</small><h2>水縁スコア</h2></div><button class="info-button" type="button" data-info="score">スコアとは？</button></div><button class="score-title-summary" type="button" data-route="scoreRewards"><span>現在の称号</span><strong>${currentTitle.name}</strong>${nextTitle ? `<small>次の「${nextTitle.name}」まで ${format(nextTitle.threshold-lifetimePoints)}pt</small><i><b style="width:${progress}%"></b></i>` : "<small>最高称号に到達しました</small>"}</button><div class="point-pair"><div><span>生涯ポイント</span><strong>${format(lifetimePoints)}<small> pt</small></strong><p>使っても減らない関わりの記録</p></div><div><span>限定ポイント</span><strong>${format(limitedPoints)}<small> pt</small></strong><p>ストアとトークン交換に使える</p></div></div><div class="score-breakdown"><p><span>来訪・チェックイン</span><strong>${format(checkinPoints)} pt</strong></p><p><span>イベント・担い手活動</span><strong>960 pt</strong></p><p><span>購入・有料体験</span><strong>700 pt</strong></p></div><div class="score-actions"><button class="score-primary" type="button" data-route="scoreRewards">称号と特典を確認</button><button type="button" data-route="store">限定ptをストアで使う</button><button type="button" data-route="token">トークンと交換</button></div></section>`;
}

function noticesPage() {
  const personal = personalNotices.map((notice) => `<article class="personal-notice"><span>${notice.type.slice(0,1)}</span><div><small>${notice.time}・${notice.type}</small><h2>${notice.title}</h2><p>${notice.body}</p></div></article>`).join("");
  const city = `<div class="notice-list"><article class="notice-card"><small>今日・地域ニュース</small><h2>水辺市場に、新しいつくり手が加わります</h2><p>秋の開催に向けて、地域の食と手仕事を届ける出店者をご紹介します。</p></article><article class="notice-card"><small>2日前・担い手募集</small><h2>川辺の景観を守る清掃活動を募集します</h2><p>プレミアム登録の対象活動です。初参加の方には地域案内人が同行します。</p></article><article class="notice-card"><small>5日前・特典</small><h2>水辺文化祭の先行受付を開始しました</h2><p>対象のふるさと住民は、会員証からお申し込みいただけます。</p></article></div>`;
  return `<section class="page-lead notice-lead"><p class="eyebrow">NOTIFICATIONS</p><h1>お知らせ</h1><p>あなたの行動結果と、水縁市の最新情報を分けて確認できます。</p></section><div class="notice-tabs"><button class="${noticeTab === "personal" ? "is-active" : ""}" type="button" data-notice-tab="personal">あなたへ</button><button class="${noticeTab === "city" ? "is-active" : ""}" type="button" data-notice-tab="city">水縁市から</button></div>${noticeTab === "personal" ? `<div class="personal-notice-list">${personal}</div>` : city}`;
}

function scoreRewardsPage() {
  const current = getScoreTitle(lifetimePoints);
  const next = getNextScoreTitle(lifetimePoints);
  const progress = getScoreProgress(lifetimePoints);
  const orderedTitles = [...scoreTitles].reverse();
  return `<button class="back-link" type="button" data-route="profile">← マイページへ戻る</button><section class="page-lead score-reward-lead"><p class="eyebrow">LIFETIME MILEAGE</p><h1>称号と特典</h1><p>水縁市で過ごした時間や活動の記録です。生涯ポイントは使っても減らず、積み上がり続けます。</p></section><section class="title-hero"><small>現在の称号</small><h2>${current.name}</h2><strong>${format(lifetimePoints)} pt</strong>${next ? `<p>次の「${next.name}」まであと${format(next.threshold-lifetimePoints)}pt</p><div class="title-progress"><span style="width:${progress}%"></span></div>` : "<p>最高称号に到達しました</p>"}</section><section>${sectionHead("EVERYDAY BENEFITS","いま使える称号特典")}<div class="steady-benefits"><article><span>月1回</span><div><h3>川辺ラウンジ利用</h3><p>会員証の提示で利用できます</p></div></article><article><span>いつでも</span><div><h3>公共レンタサイクル割引</h3><p>利用料金から100円引き</p></div></article><article class="is-next"><span>次に解放</span><div><h3>${next?.benefit || "すべて解放済み"}</h3><p>${next ? `${next.name}で利用できます` : "これからも地域との関わりを楽しめます"}</p></div></article></div></section><section>${sectionHead("TITLE MAP","これまでと、これから")}<div class="title-timeline">${orderedTitles.map((title) => `<article class="${lifetimePoints >= title.threshold ? "is-earned" : ""}"><span>${lifetimePoints >= title.threshold ? "✓" : format(title.threshold)}</span><div><h3>${title.name}</h3><p>${title.benefit}</p></div></article>`).join("")}</div></section><p class="benefit-separation"><strong>称号特典</strong>は日常で使える小さな優待。<strong>トークン保有特典</strong>は期間限定の特別な体験として、役割を分けています。</p>`;
}

const renderers = { home, register:registerPage, memberCard:memberCardPage, token:tokenPage, trade:tradePage, discover:discoverPage, store:storePage, profile:profilePage, notices:noticesPage, scoreRewards:scoreRewardsPage };

function render() {
  screen.innerHTML = (renderers[route] || home)();
  const activeRoute = ["register","profile","token","trade","scoreRewards"].includes(route) ? "profile" : route;
  navItems.forEach((item) => item.classList.toggle("is-active", item.dataset.route === activeRoute));
  syncNoticeBadge();
  document.querySelector(".app-scroll").scrollTo({ top: 0, behavior: "smooth" });
}

function go(next) { route = next; render(); }
function showToast(message) { clearTimeout(toastTimer); toast.textContent = message; toast.classList.add("is-visible"); toastTimer = setTimeout(()=>toast.classList.remove("is-visible"),2600); }
function showInfo(type) {
  const isToken = type === "token";
  modalRoot.innerHTML = `<div class="modal-backdrop"><section class="info-modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><button class="modal-close" type="button" data-close-modal aria-label="閉じる">×</button><p class="eyebrow">${isToken ? "MIZUBE TOKEN" : "MIZUBE SCORE"}</p><h2 id="modalTitle">${isToken ? "水縁トークンとは？" : "水縁スコアとは？"}</h2><p>${isToken ? "水縁市が発行するデジタルグッズです。持っている数量に応じて特別な体験やお知らせをお届けします。限定ポイントを使った交換で増やすことも、返却することもできます。需給のバランスで受け取れる数量が変動するのも特徴です。" : "あなたが水縁市と過ごした時間や応援を記録するポイントです。生涯ポイントは来訪や活動を含む消費しない記録。限定ポイントは購入や有料体験で受け取り、ストアとトークン交換に使えます。"}</p><button class="wide-button" type="button" data-close-modal>わかりました</button></section></div>`;
}

function showReturnComplete(amount, received, beforeStage, afterStage) {
  modalRoot.innerHTML = `<div class="modal-backdrop"><section class="info-modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><button class="modal-close" type="button" data-close-modal aria-label="閉じる">×</button><p class="eyebrow">RETURN COMPLETE</p><h2 id="modalTitle">${format(amount)}トークンを返却しました</h2><p>現在の条件で返却が完了しました。生涯ポイントと活動履歴はそのまま残ります。${beforeStage.name !== afterStage.name ? `保有ステージは${afterStage.name}へ変更されました。` : "保有ステージは維持されています。"}</p><div class="platform-note"><strong>ここから先はFiNANCiEへ</strong><span>売上金 ${format(received)}円の確認・出金申請はプラットフォーム側で行います。</span></div><button class="wide-button" type="button" data-action="financie-account">FiNANCiEで確認する</button><button class="modal-sub-button" type="button" data-close-modal>水縁市パスに戻る</button></section></div>`;
}

document.addEventListener("click", (event) => {
  if (event.target.matches(".modal-backdrop") || event.target.closest("[data-close-modal]")) { modalRoot.innerHTML = ""; return; }
  const storyButton = event.target.closest("[data-story]");
  if (storyButton) { story = storyButton.dataset.story; document.querySelectorAll("[data-story]").forEach((b)=>b.classList.toggle("is-active",b===storyButton)); renderStory(); return; }
  const appLink = event.target.closest("[data-app-route]");
  if (appLink) { go(appLink.dataset.appRoute); document.querySelector("#app-demo").scrollIntoView({behavior:"smooth",block:"start"}); return; }
  const infoButton = event.target.closest("[data-info]");
  if (infoButton) { showInfo(infoButton.dataset.info); return; }
  const tradeButton = event.target.closest("[data-trade]");
  if (tradeButton) { tradeMode = tradeButton.dataset.trade; tradeAmount = tradeMode === "exchange" ? 1000 : 50; go("trade"); return; }
  const amountButton = event.target.closest("[data-amount]");
  if (amountButton) { tradeAmount = Number(amountButton.dataset.amount); render(); return; }
  const noticeTabButton = event.target.closest("[data-notice-tab]");
  if (noticeTabButton) { noticeTab = noticeTabButton.dataset.noticeTab; if (noticeTab === "personal") personalUnread = 0; render(); return; }
  if (event.target.closest("[data-confirm-trade]")) {
    if (tradeMode === "exchange") { const received = Math.floor(tradeAmount/48.2); limitedPoints -= tradeAmount; tokenBalance += received; pushPersonalNotice("交換", "トークンの交換が完了しました", `${format(tradeAmount)}限定ptで${received}水縁トークンを受け取りました。`); showToast(`${received}トークンとの交換が完了しました（デモ）`); }
    else { const received = Math.floor(tradeAmount*45.6); const beforeStage = getHolderStage(tokenBalance); tokenBalance -= tradeAmount; const afterStage = getHolderStage(tokenBalance); const returned = tradeAmount; pushPersonalNotice("返却", "トークンを返却しました", `${returned}水縁トークンを返却しました。生涯ポイントと活動履歴は残ります。`); go("token"); showReturnComplete(returned, received, beforeStage, afterStage); return; }
    go("token"); return;
  }
  const routeButton = event.target.closest("[data-route]");
  if (routeButton) { if (routeButton.dataset.route === "notices") { noticeTab = "personal"; personalUnread = 0; } go(routeButton.dataset.route); return; }
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (!action) return;
  if (action === "register") { registered = true; pushPersonalNotice("登録", "水縁市への登録が完了しました", "ふるさと住民証を会員証から確認できます。"); render(); showToast("水縁市へのベーシック登録が完了しました（デモ）"); return; }
  if (action === "checkin") { lifetimePoints += 30; checkinPoints += 30; pushPersonalNotice("獲得", "生涯ポイントを獲得しました", "水辺市場への来訪で30ptが積み上がりました。"); showToast("生涯ポイントを30pt獲得しました（デモ）"); return; }
  if (action === "volunteer") { pushPersonalNotice("申込", "担い手活動の申込を受け付けました", "参加後に生涯ポイント200ptを獲得できます。開催前日に改めてお知らせします。"); showToast("担い手活動の参加申込を受け付けました（デモ）"); return; }
  if (action === "benefit") { showToast("特典の利用方法を表示します（デモ）"); return; }
  if (action === "financie-account") { showToast("FiNANCiEアカウントへ移動します（デモ）"); modalRoot.innerHTML = ""; return; }
  if (action.startsWith("buy-")) { showToast("現金等または限定ポイントで購入できます（デモ）"); return; }
  if (action.startsWith("place-")) { showToast("詳細と参加・来訪方法を表示します（デモ）"); }
});

renderStory();
render();
