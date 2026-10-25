const C = window.CONFIG;
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const WEEK = ['일', '월', '화', '수', '목', '금', '토'];
const DAY = 864e5;

const wedding = new Date(C.date);
// 보는 사람 기기 시간대와 무관하게 한국 시간으로 표시
const k = new Date(wedding.getTime() + 9 * 36e5);
const Y = k.getUTCFullYear(), M = k.getUTCMonth(), D = k.getUTCDate(), H = k.getUTCHours(), MIN = k.getUTCMinutes();
const pad = (n) => String(n).padStart(2, '0');
const hourText = `${H < 12 ? '오전' : '오후'} ${H % 12 || 12}시${MIN ? ` ${MIN}분` : ''}`;
const dateText = `${Y}. ${pad(M + 1)}. ${pad(D)}. ${WEEK[k.getUTCDay()]}요일 ${hourText}`;

let toastTimer;
function toast(msg) {
  $('toast').textContent = msg;
  $('toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.remove('show'), 1800);
}
async function copy(text, msg) {
  try { await navigator.clipboard.writeText(text); toast(msg); }
  catch { prompt('복사해서 사용하세요', text); }
}

// ---------- 정적 내용 ----------
const { groom: g, bride: b, venue: v } = C;
document.title = `${g.name} ♥ ${b.name} 결혼합니다`;
$('mainPhoto').src = C.mainPhoto;
// 한 줄씩 차례로 써지도록: 글자 수에 비례한 속도, 앞 줄이 거의 끝날 때 다음 줄 시작
{
  let at = 0.7;
  $('heroTitle').innerHTML = C.heroTitle.split('\n').map((line) => {
    const dur = 0.4 + line.length * 0.28;
    const html = `<span style="animation-delay:${at}s;animation-duration:${dur}s">${esc(line)}</span>`;
    at += dur * 0.85;
    return html;
  }).join('');
  document.querySelector('.hero-caption').style.animationDelay = `${at + 0.3}s`;
}
$('heroCaption').textContent = C.heroCaption;
{
  const en = (o) => k.toLocaleString('en-US', { timeZone: 'UTC', ...o });
  const ord = [11, 12, 13].includes(D % 100) ? 'th' : ['th', 'st', 'nd', 'rd'][D % 10] ?? 'th';
  $('heroEnDate').textContent = `- ${en({ weekday: 'short' })}, ${en({ month: 'short' })} ${D}${ord}, ${Y} -`;
}
$('heroNames').innerHTML = `${esc(g.name)}<span class="amp">&amp;</span>${esc(b.name)}`;
$('heroDate').textContent = dateText;
$('heroVenue').textContent = `${v.name} · ${v.hall}`;
$('inviteTitle').textContent = C.invitation.title;
$('inviteBody').textContent = C.invitation.body;
$('parents').innerHTML = [g, b].map((p) =>
  `<div>${esc(p.father)} · ${esc(p.mother)}<small>의 ${esc(p.relation)}</small>${esc(p.name)}</div>`).join('');

$('venueName').innerHTML = `${esc(v.name)}${v.tel ? ` <a class="tel" href="tel:${esc(v.tel)}" aria-label="예식장에 전화">☎</a>` : ''}`;
$('venueAddr').textContent = `${v.hall}\n${v.address}`;
const to = encodeURIComponent(v.name);
const kakaoRoute = `https://map.kakao.com/link/to/${to},${v.lat},${v.lng}`;
$('navs').innerHTML = [
  ['카카오맵', kakaoRoute],
  ['네이버지도', `https://map.naver.com/p/search/${to}`],
].map(([t, href]) => `<a href="${href}" target="_blank" rel="noopener">${t}</a>`).join('');
$('transport').innerHTML = v.transport.map((t) =>
  `<div><h3>${esc(t.title)}</h3>${t.lines.map((l) => `<p>${esc(l)}</p>`).join('')}</div>`).join('');

// 카카오맵: 스크롤을 방해하지 않게 고정 지도로 띄우고, 누르면 카카오맵 길찾기로 이동
if (C.kakaoKey) {
  const s = document.createElement('script');
  s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(C.kakaoKey)}&autoload=false`;
  s.onload = () => kakao.maps.load(() => {
    const pos = new kakao.maps.LatLng(v.lat, v.lng);
    const map = new kakao.maps.Map($('map'), { center: pos, level: 3, draggable: false, scrollwheel: false, disableDoubleClickZoom: true });
    new kakao.maps.Marker({ map, position: pos });
    kakao.maps.event.addListener(map, 'click', () => window.open(kakaoRoute, '_blank'));
  });
  s.onerror = () => ($('map').hidden = true);
  document.head.append(s);
} else {
  $('map').hidden = true;
}

$('footNames').innerHTML = `${esc(g.name)}<i></i>${esc(b.name)}`;
$('footDate').textContent = `${Y} . ${pad(M + 1)} . ${pad(D)}`;

// ---------- 달력 ----------
const dday = () => Math.ceil((wedding - Date.now()) / DAY);
$('calTitle').textContent = `${Y}년 ${M + 1}월 ${D}일 ${WEEK[k.getUTCDay()]}요일`;
{
  const first = new Date(Date.UTC(Y, M, 1)).getUTCDay();
  const last = new Date(Date.UTC(Y, M + 1, 0)).getUTCDate();
  const cells = [...Array(first).fill(''), ...Array.from({ length: last }, (_, i) => i + 1)];
  let html = `<tr>${WEEK.map((w) => `<th>${w}</th>`).join('')}</tr>`;
  for (let i = 0; i < cells.length; i += 7) {
    html += '<tr>' + cells.slice(i, i + 7).map((d, j) =>
      `<td class="${d === D ? 'day' : j === 0 ? 'sun' : ''}"><span>${d}</span></td>`).join('') + '</tr>';
  }
  $('calendar').innerHTML = html;
  const n = dday();
  $('calFoot').textContent = `${n > 0 ? `D-${n}` : n === 0 ? 'D-DAY' : `D+${-n}`}  ${hourText} 예식`;
}

// ---------- 카운트다운 ----------
$('countdown').innerHTML = ['Days', 'Hours', 'Min', 'Sec'].map((l, i) =>
  `${i ? '<i>:</i>' : ''}<div><b></b><small>${l}</small></div>`).join('');
const digits = $('countdown').querySelectorAll('b');
function tick() {
  const ms = Math.max(0, wedding - Date.now());
  const parts = [Math.floor(ms / DAY), Math.floor(ms / 36e5) % 24, Math.floor(ms / 6e4) % 60, Math.floor(ms / 1e3) % 60];
  parts.forEach((n, i) => {
    const text = i ? pad(n) : String(n);
    if (digits[i].textContent === text) return;
    digits[i].textContent = text;
    digits[i].classList.remove('roll');
    void digits[i].offsetWidth; // 애니메이션 재시작
    digits[i].classList.add('roll');
  });
  const n = dday();
  $('countdownText').innerHTML = n > 0
    ? `${esc(g.name)} <span class="heart">♥</span> ${esc(b.name)}의 결혼식이 ${n}일 남았습니다`
    : `${esc(g.name)} <span class="heart">♥</span> ${esc(b.name)}의 결혼식${n === 0 ? ' 당일입니다' : '에 함께해 주셔서 감사합니다'}`;
}
tick();
setInterval(tick, 1000);

// ---------- 갤러리 + 라이트박스 ----------
$('gallery').innerHTML = C.gallery.map((src, i) =>
  `<button data-i="${i}" aria-label="사진 ${i + 1} 크게 보기"><img src="${esc(src)}" alt="" loading="lazy"></button>`).join('');
$('strip').innerHTML = C.gallery.map((src) => `<img src="${esc(src)}" alt="" loading="lazy">`).join('');
const strip = $('strip');
const slide = () => Math.round(strip.scrollLeft / strip.clientWidth);
const go = (i) => strip.scrollTo({ left: strip.clientWidth * i, behavior: 'smooth' });
strip.addEventListener('scroll', () => ($('lbCount').textContent = `${slide() + 1} / ${C.gallery.length}`));
$('gallery').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  $('lightbox').showModal();
  strip.scrollLeft = strip.clientWidth * btn.dataset.i;
  $('lbCount').textContent = `${+btn.dataset.i + 1} / ${C.gallery.length}`;
});
$('lbPrev').onclick = () => go(slide() - 1);
$('lbNext').onclick = () => go(slide() + 1);
$('lightbox').addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') go(slide() - 1);
  if (e.key === 'ArrowRight') go(slide() + 1);
});

// ---------- 연락처 / 계좌 ----------
const sides = [['groom', '신랑측'], ['bride', '신부측']];
$('contacts').innerHTML = sides.map(([s, t]) => `<details><summary>${t} 연락처</summary>${
  C.contacts[s].map((p) => `<div class="person"><div class="who"><small>${esc(p.role)}</small>${esc(p.name)}</div>
    <a class="icon" href="tel:${esc(p.tel)}" aria-label="${esc(p.name)}에게 전화">☎</a>
    <a class="icon" href="sms:${esc(p.tel)}" aria-label="${esc(p.name)}에게 문자">✉</a></div>`).join('')}</details>`).join('');
$('accounts').innerHTML = sides.map(([s, t]) => `<details><summary>${t} 마음 전하실 곳</summary>${
  C.accounts[s].map((p) => `<div class="person"><div class="who"><small>${esc(p.role)} ${esc(p.name)}</small>${esc(p.bank)} ${esc(p.number)}</div>
    <button class="copy" data-copy="${esc(p.bank)} ${esc(p.number.replace(/\D/g, ''))}">복사</button></div>`).join('')}</details>`).join('');
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-copy]');
  if (t) copy(t.dataset.copy, '계좌번호가 복사되었습니다');
});

// ---------- 다이얼로그 공통 ----------
document.addEventListener('click', (e) => {
  const open = e.target.closest('[data-open]');
  if (open) $(open.dataset.open).showModal();
  if (e.target.closest('[data-close]')) e.target.closest('dialog').close();
  if (e.target.tagName === 'DIALOG') e.target.close(); // 배경 클릭
});

// ---------- 공유 ----------
$('copyLinkBtn').onclick = () => copy(location.href, '주소가 복사되었습니다');
$('kakaoBtn').onclick = () => {
  if (!window.Kakao?.isInitialized()) return copy(location.href, '주소가 복사되었습니다');
  const link = { mobileWebUrl: location.href, webUrl: location.href };
  Kakao.Share.sendDefault({
    objectType: 'feed',
    content: { title: C.share.title, description: C.share.description, imageUrl: C.share.image, imageWidth: 800, imageHeight: 1200, link },
    buttons: [{ title: '청첩장 보기', link }],
  });
};
if (C.kakaoKey) {
  const s = document.createElement('script');
  s.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
  s.onload = () => Kakao.init(C.kakaoKey);
  document.head.append(s);
}

// ---------- 스크롤 등장 + 타자기 문구 ----------
function typeQuote() {
  const text = `“${C.quote}”`;
  let i = 0;
  const t = setInterval(() => {
    $('quote').textContent = text.slice(0, ++i);
    if (i >= text.length) clearInterval(t);
  }, 70);
}
const io = new IntersectionObserver((entries) => entries.forEach((en) => {
  if (!en.isIntersecting) return;
  en.target.classList.add('in');
  if (en.target.tagName === 'FOOTER') typeQuote();
  io.unobserve(en.target);
}), { threshold: 0.15 });
document.querySelectorAll('.reveal, .gallery button').forEach((el) => io.observe(el));

// 하트가 떠오르는 효과
function floatHearts() {
  const r = $('likeBtn').getBoundingClientRect();
  for (let i = 0; i < 6; i++) {
    const h = document.createElement('span');
    h.className = 'float-heart';
    h.textContent = '♥';
    h.style.left = `${r.left + r.width / 2}px`;
    h.style.setProperty('--dx', `${(Math.random() - 0.5) * 60}px`);
    h.style.top = `${r.top}px`;
    h.style.animationDelay = `${i * 80}ms`;
    h.addEventListener('animationend', () => h.remove());
    document.body.append(h);
  }
}

// ---------- Firebase: 방명록 / RSVP / 하트 ----------
if (!C.firebase) {
  document.querySelectorAll('[data-needs="firebase"]').forEach((el) => (el.hidden = true));
  $('guestForm').onsubmit = () => toast('방명록을 쓰려면 Firebase 설정이 필요합니다 (README 참고)');
} else {
  const FB = 'https://www.gstatic.com/firebasejs/10.12.2/';
  const [{ initializeApp }, fs] = await Promise.all([import(FB + 'firebase-app.js'), import(FB + 'firebase-firestore.js')]);
  const { getFirestore, collection, doc, addDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, setDoc, increment } = fs;
  const db = getFirestore(initializeApp(C.firebase));
  const root = doc(db, 'invitations', C.id);

  // 방명록 (실시간): 최근 3개는 본문에, 전체는 '전체보기' 창에
  const SHOW = 3;
  const card = (e) => {
    const d = e.createdAt?.toDate() ?? new Date();
    return `<li><div class="head">${esc(e.name)}<span class="date">${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}</span>
      <button class="del" data-del="${e.id}" aria-label="삭제">✕</button></div><p>${esc(e.message)}</p></li>`;
  };
  onSnapshot(query(collection(root, 'guestbook'), orderBy('createdAt', 'desc')), (snap) => {
    const entries = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    $('guestbook').innerHTML = entries.length ? entries.slice(0, SHOW).map(card).join('') : '<li class="empty">첫 축하 글을 남겨주세요</li>';
    $('guestbookAll').innerHTML = entries.map(card).join('');
    $('allBtn').hidden = entries.length <= SHOW;
  });
  $('guestForm').onsubmit = async (e) => {
    const f = new FormData(e.target);
    try {
      await addDoc(collection(root, 'guestbook'), {
        name: f.get('name').trim(), message: f.get('message').trim(), createdAt: serverTimestamp(),
      });
      e.target.reset();
      toast('축하 글이 등록되었습니다');
    } catch { toast('등록에 실패했습니다. 다시 시도해 주세요'); }
  };
  $('guestbook').onclick = $('guestbookAll').onclick = async (e) => {
    const b = e.target.closest('[data-del]');
    if (!b) return;
    const pw = prompt('관리자 비밀번호');
    if (!pw) return;
    const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw)))]
      .map((x) => x.toString(16).padStart(2, '0')).join('');
    if (!C.adminPasswordHash || hash !== C.adminPasswordHash) return toast('비밀번호가 올바르지 않습니다');
    await deleteDoc(doc(root, 'guestbook', b.dataset.del));
    toast('삭제되었습니다');
  };

  // RSVP (쓰기 전용, 결과는 Firebase 콘솔에서 확인)
  $('rsvpForm').onsubmit = async (e) => {
    const f = new FormData(e.target);
    try {
      await addDoc(collection(root, 'rsvp'), {
        side: f.get('side'), attend: f.get('attend'), name: f.get('name').trim(),
        count: Number(f.get('count')) || 1, createdAt: serverTimestamp(),
      });
      e.target.reset();
      toast('참석 의사가 전달되었습니다');
    } catch { toast('전달에 실패했습니다. 다시 시도해 주세요'); }
  };

  // 하트
  let liked = false;
  try { liked = localStorage.getItem(`liked:${C.id}`) === '1'; } catch {}
  $('likeBtn').classList.toggle('on', liked);
  onSnapshot(root, (s) => ($('likeCount').textContent = s.data()?.likes ?? 0));
  $('likeBtn').onclick = async () => {
    floatHearts();
    if (liked) return toast('이미 마음을 전하셨어요 ♥');
    liked = true;
    $('likeBtn').classList.add('on');
    try { localStorage.setItem(`liked:${C.id}`, '1'); } catch {}
    await setDoc(root, { likes: increment(1) }, { merge: true });
  };
}
