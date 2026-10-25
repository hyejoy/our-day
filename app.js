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
$('heroNames').innerHTML = `${esc(g.name)}<span class="amp">&amp;</span>${esc(b.name)}`;
$('heroDate').textContent = dateText;
$('heroVenue').textContent = `${v.name} · ${v.hall}`;
$('inviteTitle').textContent = C.invitation.title;
$('inviteBody').textContent = C.invitation.body;
$('parents').innerHTML = [g, b].map((p) =>
  `<div>${esc(p.father)} · ${esc(p.mother)}<small>의 ${esc(p.relation)}</small>${esc(p.name)}</div>`).join('');

$('venueName').textContent = v.name;
$('venueAddr').textContent = `${v.address} · ${v.hall}`;
$('mapBtn').href = v.mapUrl;
$('venueNotes').innerHTML = v.notes.map((n) => `<li>${esc(n)}</li>`).join('');

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
function tick() {
  const ms = Math.max(0, wedding - Date.now());
  const parts = [[Math.floor(ms / DAY), 'Days'], [Math.floor(ms / 36e5) % 24, 'Hours'],
    [Math.floor(ms / 6e4) % 60, 'Min'], [Math.floor(ms / 1e3) % 60, 'Sec']];
  $('countdown').innerHTML = parts.map(([n, l], i) =>
    `${i ? '<i>:</i>' : ''}<div>${i ? pad(n) : n}<small>${l}</small></div>`).join('');
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
$('gallery').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  $('lightbox').showModal();
  $('strip').scrollLeft = $('strip').clientWidth * btn.dataset.i;
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
  let i = 0;
  const t = setInterval(() => {
    $('quote').textContent = C.quote.slice(0, ++i);
    if (i >= C.quote.length) clearInterval(t);
  }, 70);
}
const io = new IntersectionObserver((entries) => entries.forEach((en) => {
  if (!en.isIntersecting) return;
  en.target.classList.add('in');
  if (en.target.tagName === 'FOOTER') typeQuote();
  io.unobserve(en.target);
}), { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// ---------- Firebase: 방명록 / RSVP / 하트 ----------
if (!C.firebase) {
  document.querySelectorAll('[data-needs="firebase"]').forEach((el) => (el.hidden = true));
} else {
  const FB = 'https://www.gstatic.com/firebasejs/10.12.2/';
  const [{ initializeApp }, fs] = await Promise.all([import(FB + 'firebase-app.js'), import(FB + 'firebase-firestore.js')]);
  const { getFirestore, collection, doc, addDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, setDoc, increment } = fs;
  const db = getFirestore(initializeApp(C.firebase));
  const root = doc(db, 'invitations', C.id);

  // 방명록 (실시간)
  const PER = 4;
  let entries = [], page = 0;
  function renderGuestbook() {
    const pages = Math.max(1, Math.ceil(entries.length / PER));
    page = Math.min(page, pages - 1);
    $('guestbook').innerHTML = entries.length ? entries.slice(page * PER, page * PER + PER).map((e) => {
      const d = e.createdAt?.toDate() ?? new Date();
      return `<li><div class="head">${esc(e.name)}<span class="date">${String(d.getFullYear()).slice(2)}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}</span>
        <button class="del" data-del="${e.id}" aria-label="삭제">✕</button></div><p>${esc(e.message)}</p></li>`;
    }).join('') : '<li class="empty">첫 축하 글을 남겨주세요</li>';
    $('pager').innerHTML = pages > 1
      ? `<button data-page="-1" ${page ? '' : 'disabled'}>&lt;</button>${page + 1} / ${pages}<button data-page="1" ${page < pages - 1 ? '' : 'disabled'}>&gt;</button>`
      : '';
  }
  onSnapshot(query(collection(root, 'guestbook'), orderBy('createdAt', 'desc')), (snap) => {
    entries = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderGuestbook();
  });
  $('pager').onclick = (e) => {
    const b = e.target.closest('[data-page]');
    if (b) { page += +b.dataset.page; renderGuestbook(); }
  };
  $('guestForm').onsubmit = async (e) => {
    const f = new FormData(e.target);
    try {
      await addDoc(collection(root, 'guestbook'), {
        name: f.get('name').trim(), message: f.get('message').trim(), createdAt: serverTimestamp(),
      });
      e.target.reset();
      page = 0;
      toast('축하 글이 등록되었습니다');
    } catch { toast('등록에 실패했습니다. 다시 시도해 주세요'); }
  };
  $('guestbook').onclick = async (e) => {
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
    if (liked) return toast('이미 마음을 전하셨어요 ♥');
    liked = true;
    $('likeBtn').classList.add('on');
    try { localStorage.setItem(`liked:${C.id}`, '1'); } catch {}
    await setDoc(root, { likes: increment(1) }, { merge: true });
  };
}
