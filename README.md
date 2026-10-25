# our-day — 모바일 청첩장 템플릿

빌드 없는 정적 웹페이지입니다. **`config.js` 하나만 수정**하면 내 청첩장이 됩니다.

## 1. 내용 바꾸기
`config.js`의 이름, 날짜, 장소, 연락처, 계좌, 문구를 수정하세요.
사진은 `images/` 폴더에 넣고 경로(`images/main.jpg`)로 바꿉니다.

사진 용량 줄이기 (macOS 기본 명령, 폭 700px / 품질 75%):
```sh
sips --resampleWidth 700 -s format jpeg -s formatOptions 75 원본/*.jpg --out images/
```

## 2. 방명록 · RSVP · 하트 (선택, Firebase 무료)
1. https://console.firebase.google.com 에서 프로젝트 생성 → Firestore Database 생성
2. Firestore > 규칙 탭에 `firestore.rules` 내용을 붙여넣고 게시
3. 프로젝트 설정 > 웹 앱 추가 → 나오는 `firebaseConfig` 객체를 `config.js`의 `firebase:`에 붙여넣기
4. 삭제용 비밀번호 해시: `echo -n '비밀번호' | shasum -a 256` 결과를 `adminPasswordHash`에
5. RSVP 응답은 Firestore 콘솔 `invitations/{id}/rsvp`에서 확인

`firebase`가 `null`이면 세 섹션은 자동으로 숨겨집니다. 한 Firebase 프로젝트를 여러 청첩장이 같이 써도 `id`로 구분됩니다.

## 3. 카카오톡 공유 (선택)
1. https://developers.kakao.com 앱 생성 → JavaScript 키를 `kakaoKey`에
2. ⚠️ 배포 도메인을 **두 곳 모두** 등록: `플랫폼 키 > JavaScript SDK 도메인`, `제품 링크 관리 > 웹 도메인`
3. `share.image`는 배포된 사이트의 절대 URL (세로 800×1200 권장)

키가 없으면 버튼이 링크 복사로 동작합니다.

## 4. 배포 (Netlify 무료)
https://app.netlify.com/drop 에 이 폴더를 드래그하면 끝. 수정 후에는 같은 사이트의 Deploys 탭에 다시 드래그하면 URL이 유지됩니다.

로컬 미리보기: `python3 -m http.server` 후 http://localhost:8000
