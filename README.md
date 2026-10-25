# our-day — 모바일 청첩장 템플릿

빌드 없는 정적 웹페이지입니다. **`config.js` 하나만 수정**하면 내 청첩장이 됩니다.

## 1. 내용 바꾸기
`config.js`의 이름, 날짜, 장소, 연락처, 계좌, 문구를 수정하세요.
사진은 `images/` 폴더에 넣고 경로(`images/main.jpg`)로 바꿉니다.

사진 용량 줄이기 (macOS 기본 명령, 폭 700px / 품질 75%):
```sh
sips --resampleWidth 700 -s format jpeg -s formatOptions 75 원본/*.jpg --out images/
```

> 별도 서버는 필요 없습니다. 방명록은 Firebase(구글 서버리스 DB), 지도는 카카오가 처리하고 이 저장소는 정적 파일만 배포합니다.

## 2. 방명록 · RSVP · 하트 (Firebase 무료 Spark 플랜)
1. https://console.firebase.google.com → **프로젝트 추가** (Google Analytics는 꺼도 됨)
2. 왼쪽 메뉴 **빌드 > Firestore Database > 데이터베이스 만들기** → 위치 `asia-northeast3 (서울)` → **프로덕션 모드**로 시작
3. Firestore **규칙** 탭에 `firestore.rules` 내용을 그대로 붙여넣고 **게시**
4. 프로젝트 개요 옆 ⚙️ **프로젝트 설정 > 일반 > 내 앱 > 웹(`</>`)** 앱 등록 (Hosting 체크 안 함)
5. 화면에 나오는 `firebaseConfig = { apiKey: ..., projectId: ..., ... }` 객체를 `config.js`의 `firebase:`에 붙여넣기
   ```js
   firebase: { apiKey: 'AIza...', authDomain: 'xxx.firebaseapp.com', projectId: 'xxx', storageBucket: '...', messagingSenderId: '...', appId: '...' },
   ```
   (`apiKey`는 공개돼도 되는 값입니다. 데이터 보호는 `firestore.rules`가 담당)
6. 관리자 삭제 비밀번호: `echo -n '비밀번호' | shasum -a 256` 결과를 `adminPasswordHash`에
7. RSVP 응답은 Firestore 콘솔 `invitations/{id}/rsvp`에서 확인

`firebase`가 `null`이면 RSVP·하트는 숨겨지고 방명록은 작성 시 안내 문구만 뜹니다. 한 Firebase 프로젝트를 여러 청첩장이 같이 써도 `id`로 구분됩니다.

## 3. 카카오맵 지도 · 카카오톡 공유 (카카오 JavaScript 키 하나로 둘 다)
1. https://developers.kakao.com → **내 애플리케이션 > 애플리케이션 추가하기**
2. **플랫폼 키 > JavaScript 키**를 `config.js`의 `kakaoKey`에
3. ⚠️ 도메인 **두 곳 모두** 등록 (배포 주소 `https://xxx.netlify.app`, 로컬 확인용 `http://localhost:8000`)
   - `플랫폼 키 > JavaScript SDK 도메인` → 지도와 공유 둘 다 여기가 필요
   - `제품 링크 관리 > 웹 도메인` → 공유 카드의 링크가 열리려면 필요
4. 제품 설정에서 **카카오맵** 사용 설정 **ON** (안 켜면 지도가 빈 화면)
5. `venue.lat`, `venue.lng`에 예식장 좌표 입력 (카카오맵/구글맵에서 장소 우클릭으로 확인)
6. `share.image`는 배포된 사이트의 절대 URL (세로 800×1200 권장)

키가 없으면 지도는 숨겨지고(길찾기 버튼은 그대로), 공유 버튼은 링크 복사로 동작합니다.

## 4. 배포 (Netlify 무료)
**GitHub 연결 (추천)**: https://app.netlify.com → **Add new site > Import an existing project > GitHub** → 이 저장소 선택 → Build command 비움, Publish directory `.` → Deploy.
이후 `git push`만 하면 같은 URL로 자동 재배포됩니다. 사이트 이름은 **Site configuration > Change site name**에서 변경.

**드래그 배포**: https://app.netlify.com/drop 에 폴더를 끌어놓기. 수정 후엔 같은 사이트의 Deploys 탭에 다시 끌어놓으면 URL 유지.

로컬 미리보기: `python3 -m http.server 8000` 후 http://localhost:8000
