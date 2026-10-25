// 청첩장 내용은 이 파일만 수정하면 됩니다. (README.md 참고)
window.CONFIG = {
  // Firestore 데이터 구분용 ID. 청첩장마다 다르게 (영문/숫자/하이픈)
  id: 'minjun-seoyeon',

  groom: { name: '민준', father: '김재현', mother: '박은영', relation: '아들' },
  bride: { name: '서연', father: '이상호', mother: '최정숙', relation: '딸' },

  // 한국 시간 기준 예식 일시
  date: '2027-09-12T14:00:00+09:00',

  venue: {
    name: '서울신라호텔',
    hall: '영빈관',
    address: '서울 중구 동호로 249',
    mapUrl: 'https://map.naver.com/p/search/서울신라호텔',
    notes: [
      '3호선 동국대입구역 5번 출구 도보 7분',
      '주차: 호텔 지하 (예식 시간 무료)',
      '강남역 11번 출구 셔틀버스 운영 (12:30–13:30, 30분 간격)',
    ],
  },

  mainPhoto: 'https://picsum.photos/seed/main/700/900',

  invitation: {
    title: '서로의 계절을\n함께 걷기로 했습니다',
    body: '사랑이라는 이름 아래,\n저희 두 사람이 새로운 시작을 맞이합니다.\n가장 행복한 순간을 소중한 인연들과\n함께 나누고 싶습니다.\n저희의 첫걸음에 함께해 주신다면\n더 없는 기쁨으로 오래도록 간직하겠습니다.',
  },

  // 사진은 700px 폭, JPEG 품질 75% 정도로 줄여서 images/ 에 넣고 경로만 적으세요
  gallery: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `https://picsum.photos/seed/g${n}/700/875`),

  contacts: {
    groom: [
      { role: '신랑', name: '김민준', tel: '010-1234-5678' },
      { role: '신랑 아버지', name: '김재현', tel: '010-0000-0000' },
      { role: '신랑 어머니', name: '박은영', tel: '010-0000-0000' },
    ],
    bride: [
      { role: '신부', name: '이서연', tel: '010-1234-5678' },
      { role: '신부 아버지', name: '이상호', tel: '010-0000-0000' },
      { role: '신부 어머니', name: '최정숙', tel: '010-0000-0000' },
    ],
  },

  accounts: {
    groom: [
      { role: '신랑', name: '김민준', bank: '국민은행', number: '123-456-789012' },
      { role: '신랑 아버지', name: '김재현', bank: '신한은행', number: '110-123-456789' },
    ],
    bride: [
      { role: '신부', name: '이서연', bank: '우리은행', number: '1002-123-456789' },
      { role: '신부 어머니', name: '최정숙', bank: '농협', number: '302-1234-5678-91' },
    ],
  },

  quote: '우리는 가장 평범한 순간들로\n가장 오래 남을 이야기를 만들고 싶습니다',

  // 카카오톡 공유 카드. image 는 배포된 사이트의 절대 URL (세로 800x1200 권장)
  share: {
    title: '민준 ♥ 서연 결혼합니다',
    description: '2027년 9월 12일 일요일 오후 2시, 서울신라호텔 영빈관',
    image: 'https://picsum.photos/seed/main/800/1200',
  },

  // https://developers.kakao.com > 내 애플리케이션 > 앱 키 > JavaScript 키. 비우면 링크 복사로 대체
  kakaoKey: '',

  // Firebase 콘솔 > 프로젝트 설정 > 웹 앱 config 객체. 비우면 방명록/RSVP/하트가 숨겨짐
  firebase: null,

  // 방명록 삭제용 관리자 비밀번호의 SHA-256 값: echo -n '비밀번호' | shasum -a 256
  adminPasswordHash: '',
};
