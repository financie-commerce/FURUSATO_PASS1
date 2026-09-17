const screen = document.querySelector("#screen");
const toast = document.querySelector("#toast");
const navItems = [...document.querySelectorAll(".nav-item")];
let route = "home";
let story = "concept";
let registered = false;
let tokenPurchased = false;
let toastTimer;

const icons = {
  home: '<path d="M3 11 12 3l9 8"/><path d="M5 10v11h14V10"/><path d="M9 21v-7h6v7"/>',
  discover: '<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/><path d="m9 13 2-5 2 5-4-2h4"/>',
  token: '<circle cx="12" cy="12" r="8"/><path d="M9 9h6l-1 3H9l1 3h5"/>',
  store: '<path d="M5 10h14l-1-5H6l-1 5Z"/><path d="M6 10v10h12V10"/><path d="M9 20v-5h6v5"/>',
  profile: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>',
};

const svg = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;
navItems.forEach((item) => { item.querySelector("span").innerHTML = svg(item.dataset.icon); });

const stories = {
  concept: [
    ["01 / REGISTER", "第2のふるさとを持つ", "関心のある地域へ簡単に登録し、公式情報と関わりの入口をひとつに。"],
    ["02 / DEEPEN", "行動を関係へ変える", "来訪・参加・担い手活動を記録し、継続的な関係性を可視化。"],
    ["03 / CIRCULATE", "貢献者を先に報いる", "地域で購入した人へ限定ポイントを還元し、先行トークン取得へ。"],
  ],
  system: [
    ["PUBLIC", "国の登録基盤", "ベーシック／プレミアム登録と本人確認を担う共通プラットフォーム。"],
    ["LOCAL", "水縁市の活動基盤", "イベント、担い手募集、来訪記録を既存サービスとつなぐ。"],
    ["PRIVATE", "FiNANCiE経済圏", "購買還元・トークン保有・民間特典を行政資格と分けて運用。"],
  ],
  pilot: [
    ["KPI 01", "関係の深さ", "90日再訪率、活動参加回数、プレミアム候補への転換率。"],
    ["KPI 02", "地域経済", "参加店送客数、購入額、有料体験利用、限定ポイント利用率。"],
    ["KPI 03", "継続性", "トークン取得率、継続保有率、活動と購買の複合参加率。"],
  ],
};

function renderStory() {
  document.querySelector("#storyPanel").innerHTML = stories[story].map(([small,title,text]) => `<article><small>${small}</small><h2>${title}</h2><p>${text}</p></article>`).join("");
}

const sectionHead = (label,title,action="") => `<div class="section-head"><div><p class="eyebrow">${label}</p><h2>${title}</h2></div>${action}</div>`;

function tokenSummary() {
  return `<section class="token-summary">
    <div class="row-between"><div><p class="eyebrow">水縁コミュニティトークン</p><div class="token-balance">${tokenPurchased ? "148" : "128"}<small>MZB TOKEN</small></div></div><span class="phase-label">貢献者先行期間</span></div>
    <div class="point-strip"><span>水縁市限定FiNANCiEポイント</span><strong>${tokenPurchased ? "420" : "1,420"} pt</strong></div>
    <div class="progress-copy"><span>次の保有者特典まで ${tokenPurchased ? "52" : "72"}トークン</span><strong>${tokenPurchased ? "74" : "64"}%</strong></div><div class="bar"><span style="--value:${tokenPurchased ? "74" : "64"}%"></span></div>
    <div class="token-actions"><button class="primary" type="button" data-action="open-token">トークンを購入</button><button class="secondary" type="button" data-action="sell">売却する</button></div>
  </section>`;
}

function home() {
  return `<section class="hero"><span class="status-chip">● ベーシック登録済み</span><small>水縁市公認・ふるさと住民</small><h1>もうひとつの住民として、まちの力になる。</h1><p>訪れる、手伝う、買う。一人ひとりの関わりを記録し、水縁市との関係を育てます。</p><div class="hero-actions"><button type="button" data-route="discover">今日できること</button><button class="ghost" type="button" data-route="register">登録証を見る</button></div></section>
  ${tokenSummary()}
  <section class="score-card"><div class="row-between"><div><p class="eyebrow">消費しない・活動マイレージ</p><h2>2,480<small>応援スコア</small></h2></div><span class="phase-label">活動 2 / 3回</span></div><p>来訪や担い手活動の記録です。あと1回の対象活動で、プレミアム登録の申請候補になります。</p></section>
  <section>${sectionHead("TODAY'S ACTION","今日からできる関わり",'<button class="text-button" type="button" data-route="discover">すべて見る</button>')}<div class="action-grid"><button type="button" data-action="checkin"><span class="action-icon">◎</span>水辺市場に来訪<small>+30 SCORE</small></button><button type="button" data-action="volunteer"><span class="action-icon">手</span>川辺の清掃活動<small>対象活動</small></button><button type="button" data-route="store"><span class="action-icon">買</span>地域でお買い物<small>限定pt還元</small></button></div></section>`;
}

function registerPage() {
  return `<section class="page-lead"><p class="eyebrow">FURUSATO RESIDENT</p><h1>水縁市を、もうひとつのふるさとに。</h1><p>登録は地域との関係の入口。活動を重ねることで、担い手としての関わりへ進めます。</p></section>
  <article class="register-card"><div class="row-between"><div><p class="eyebrow">BASIC</p><h2>ベーシック登録</h2></div><span class="phase-label">${registered ? "登録済み" : "すぐに登録"}</span></div><p>水縁市に関心がある方なら、地域外からでも登録できます。</p><div class="register-features"><span>関心に合わせた公式情報</span><span>イベント・活動募集の案内</span><span>デジタル登録証</span></div><button class="wide-button" type="button" data-action="register">${registered ? "登録証を表示する" : "水縁市に登録する"}</button></article>
  <article class="register-card is-premium"><div class="row-between"><div><p class="eyebrow">PREMIUM</p><h2>プレミアム登録</h2></div><span class="phase-label">活動 2 / 3回</span></div><p>自治体が指定する担い手活動を重ねた方が申請できる上位登録です。購入額やトークン数では判定しません。</p><div class="register-features"><span>担い手活動のサポート</span><span>公共施設等の利用支援</span><span>年1回、活動実績を確認</span></div><button class="wide-button" type="button" disabled>あと1回の対象活動で申請候補</button></article>`;
}

function tokenPage() {
  return `<section class="page-lead"><p class="eyebrow">MIZUBE COMMUNITY TOKEN</p><h1>貢献した人から、先に持てる。</h1><p>水縁市での購入・有料体験で獲得した限定ポイントを使い、先行期間中にトークンを取得できます。</p></section>${tokenSummary()}
  <section>${sectionHead("MARKET PHASE","マーケット公開まで")}<div class="phase-card"><div class="phase-step is-current"><span>1</span><div><small>NOW / 先行期間</small><h3>地域貢献者から購入</h3><p>水縁市限定ポイントを持つ方が先行してトークンを購入できます。</p></div></div><div class="phase-step"><span>2</span><div><small>NEXT</small><h3>登録者向け先行開放</h3><p>ふるさと住民登録者へ購入機会を段階的に広げます。</p></div></div><div class="phase-step"><span>3</span><div><small>OPEN MARKET</small><h3>一般マーケット公開</h3><p>共通または限定FiNANCiEポイントによる売買を開始します。</p></div></div></div></section>
  <section>${sectionHead("HOLDER BENEFITS","保有数に応じた機会")}<div class="benefit-list"><article><span>50</span><div><h3>活動の先行案内</h3><p>担い手募集を一般公開前にお知らせ</p></div><strong>解放済み</strong></article><article><span>200</span><div><h3>水辺文化祭・企画会議</h3><p>オンライン企画会議への参加枠</p></div><strong>あと${tokenPurchased ? "52" : "72"}</strong></article><article><span>500</span><div><h3>地域プロジェクト提案会</h3><p>事業者・市職員との共創セッション</p></div><strong>あと${tokenPurchased ? "352" : "372"}</strong></article></div></section>
  <p class="disclaimer">コミュニティトークンは商品・サービスの支払いには使用せず、消費されません。保有を続けるか、マーケットで売却できます。この画面の数値・条件は実証検討用のサンプルです。</p>`;
}

const places = [
  ["担い手活動","川辺の景観を守る朝の清掃活動","9月21日 8:00・水縁河川公園","対象活動・残り12名","82% center"],
  ["地域イベント","つくる人と暮らす人の水辺市場","毎月第2土曜・駅前広場","来訪で+30スコア","12% center"],
  ["有料体験","清流をめぐる半日パドルツアー","RIVERBASE みなも","限定ポイント5%還元","100% center"],
  ["地域事業者","水縁の台所 みのり食堂","本町商店街・11:00〜20:00","限定ポイント3%還元","2% center"],
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
  return `<section class="page-lead"><p class="eyebrow">LOCAL COMMERCE</p><h1>買うことも、関わること。</h1><p>地域の商品・有料体験の利用で、水縁市限定FiNANCiEポイントが購入者本人へ還元されます。</p></section><div class="store-grid">${products.map((p,i)=>`<article class="store-card"><div class="store-image" style="--position:${p[5]}"></div><div class="store-body"><small>${p[0]}</small><h2>${p[1]}</h2><p>${p[2]}</p><div class="price-row"><strong>¥${p[3].toLocaleString("ja-JP")}</strong><span>${p[4]}</span></div><button class="wide-button" type="button" data-action="buy-${i}" style="margin-top:12px">内容を確認する</button></div></article>`).join("")}</div>`;
}

function profilePage() {
  return `<section class="resident-card"><small>MIZUBE FURUSATO RESIDENT</small><h2>水縁市 ベーシック住民証</h2><p>登録番号：MZB-2026-00842</p><strong>大西 太郎 さん</strong></section><section class="profile-card"><p class="eyebrow">YOUR RELATIONSHIP</p><div class="metrics"><div><span>応援スコア</span><strong>2,480</strong></div><div><span>トークン保有</span><strong>${tokenPurchased ? "148" : "128"}</strong></div><div><span>対象活動</span><strong>2 / 3</strong></div><div><span>水縁市への来訪</span><strong>6回</strong></div></div></section><button class="wide-button" type="button" data-route="register">登録区分と条件を見る</button>`;
}

function noticesPage() {
  return `<section class="page-lead"><p class="eyebrow">WHAT'S NEW</p><h1>水縁市からのお知らせ</h1><p>活動募集、地域事業者の取り組み、先行マーケットの進捗を公式にお届けします。</p></section><div class="notice-list"><article class="notice-card"><small>今日・トークン</small><h2>貢献者先行期間の参加者が300人を超えました</h2><p>一般公開前に地域で購入・体験いただいた方から、トークン保有が広がっています。</p></article><article class="notice-card"><small>2日前・担い手募集</small><h2>川辺の景観を守る清掃活動を募集します</h2><p>プレミアム登録の対象活動です。初参加の方には地域案内人が同行します。</p></article><article class="notice-card"><small>5日前・地域事業者</small><h2>限定ポイント還元店が12店舗に増えました</h2><p>商店街の飲食・工芸店が新たに参加し、地域内での関わり方が広がりました。</p></article></div>`;
}

const renderers = { home, register:registerPage, token:tokenPage, discover:discoverPage, store:storePage, profile:profilePage, notices:noticesPage };

function render() {
  screen.innerHTML = (renderers[route] || home)();
  navItems.forEach((item) => item.classList.toggle("is-active", item.dataset.route === route || (route === "register" && item.dataset.route === "profile")));
  const scrollArea = document.querySelector(".app-scroll");
  scrollArea.scrollTo({ top: 0, behavior: "smooth" });
}

function go(next) { route = next; render(); }
function showToast(message) { clearTimeout(toastTimer); toast.textContent = message; toast.classList.add("is-visible"); toastTimer = setTimeout(()=>toast.classList.remove("is-visible"),2600); }

document.addEventListener("click", (event) => {
  const storyButton = event.target.closest("[data-story]");
  if (storyButton) { story = storyButton.dataset.story; document.querySelectorAll("[data-story]").forEach((b)=>b.classList.toggle("is-active",b===storyButton)); renderStory(); return; }
  const appLink = event.target.closest("[data-app-route]");
  if (appLink) { go(appLink.dataset.appRoute); document.querySelector("#app-demo").scrollIntoView({behavior:"smooth",block:"start"}); return; }
  const routeButton = event.target.closest("[data-route]");
  if (routeButton) { go(routeButton.dataset.route); return; }
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (!action) return;
  if (action === "open-token") {
    if (route !== "token") { go("token"); return; }
    tokenPurchased = true;
    render();
    showToast("1,000限定ptで20トークンを購入しました（デモ）");
    return;
  }
  if (action === "register") { registered = true; render(); showToast("水縁市へのベーシック登録が完了しました（デモ）"); return; }
  if (action === "sell") { showToast("売却確認画面を開きます。トークンは消費されません（デモ）"); return; }
  if (action === "checkin") { showToast("来訪を記録しました。応援スコア +30（デモ）"); return; }
  if (action === "volunteer") { showToast("担い手活動の参加申込へ進みます（デモ）"); return; }
  if (action.startsWith("buy-")) { showToast("購入後、本人限定ポイントが還元されます（デモ）"); return; }
  if (action.startsWith("place-")) { showToast("詳細と参加・来訪方法を表示します（デモ）"); return; }
});

renderStory();
render();
