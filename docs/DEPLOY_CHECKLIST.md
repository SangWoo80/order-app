# Render.com 배포 체크리스트

## 배포 전 준비사항

### ✅ 코드 준비
- [ ] 모든 코드가 GitHub에 푸시되어 있는지 확인
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] 민감한 정보가 코드에 하드코딩되지 않았는지 확인

### ✅ 데이터베이스 설정
- [ ] `server/src/config/database.js`가 `DATABASE_URL`을 지원하는지 확인
- [ ] 로컬에서 데이터베이스 연결이 정상 작동하는지 확인

### ✅ 프론트엔드 설정
- [ ] `ui/src/api/api.js`가 환경 변수 `VITE_API_BASE_URL`을 사용하는지 확인
- [ ] 로컬에서 빌드가 성공하는지 확인 (`npm run build`)

---

## 1단계: PostgreSQL 데이터베이스 배포

### Render Dashboard 설정
- [ ] Render Dashboard 접속: https://dashboard.render.com
- [ ] "New +" → "PostgreSQL" 선택
- [ ] 데이터베이스 이름 설정: `coffee-order-db`
- [ ] 지역 선택 (가장 가까운 지역)
- [ ] 플랜 선택 (Free tier)
- [ ] "Create Database" 클릭

### 데이터베이스 정보 저장
- [ ] Internal Database URL 복사 및 저장
- [ ] External Database URL 복사 및 저장 (필요시)
- [ ] Host, Port, Database, User, Password 정보 확인

### 데이터베이스 초기화
- [ ] 서버 배포 후 Shell에서 `npm run db:setup` 실행
- [ ] 또는 로컬에서 External URL로 초기화

---

## 2단계: 백엔드 서버 배포

### Render Dashboard 설정
- [ ] "New +" → "Web Service" 선택
- [ ] GitHub 저장소 연결
- [ ] 서비스 이름: `coffee-order-api`
- [ ] Root Directory: `server` (또는 빈 값)
- [ ] Branch: `main` (또는 배포할 브랜치)
- [ ] Runtime: `Node`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] 플랜 선택 (Free tier)

### 환경 변수 설정
다음 환경 변수들을 추가:

- [ ] `NODE_ENV=production`
- [ ] `PORT=10000` (또는 Render가 자동 설정)
- [ ] 데이터베이스 연결 정보:
  - 방법 1: `DATABASE_URL` (Internal Database URL)
  - 방법 2: 개별 변수
    - `DB_HOST`
    - `DB_PORT=5432`
    - `DB_NAME`
    - `DB_USER`
    - `DB_PASSWORD`

### 배포 확인
- [ ] 서비스가 성공적으로 배포되었는지 확인
- [ ] Logs 탭에서 오류가 없는지 확인
- [ ] Health check: `https://coffee-order-api.onrender.com/health`
- [ ] API 테스트: `https://coffee-order-api.onrender.com/api/menus`

### 데이터베이스 초기화
- [ ] Shell 탭에서 `npm run db:setup` 실행
- [ ] 초기 데이터가 정상적으로 삽입되었는지 확인

---

## 3단계: 프론트엔드 배포

### Render Dashboard 설정
- [ ] "New +" → "Static Site" 선택
- [ ] GitHub 저장소 연결
- [ ] 서비스 이름: `coffee-order-app`
- [ ] Root Directory: `ui`
- [ ] Branch: `main` (또는 배포할 브랜치)
- [ ] Build Command: `npm install && npm run build`
- [ ] Publish Directory: `dist`
- [ ] 플랜 선택 (Free tier)

### 환경 변수 설정
- [ ] `VITE_API_BASE_URL=https://coffee-order-api.onrender.com/api`
  - **중요**: 백엔드 서비스의 실제 URL로 변경

### 배포 확인
- [ ] 서비스가 성공적으로 배포되었는지 확인
- [ ] 빌드가 성공적으로 완료되었는지 확인
- [ ] 브라우저에서 앱 접속: `https://coffee-order-app.onrender.com`
- [ ] 메뉴가 정상적으로 로드되는지 확인
- [ ] 주문 기능이 정상적으로 작동하는지 확인

---

## 배포 후 테스트

### 기능 테스트
- [ ] 메뉴 목록이 정상적으로 표시되는지 확인
- [ ] 메뉴 이미지가 정상적으로 표시되는지 확인
- [ ] 장바구니에 메뉴 추가가 정상 작동하는지 확인
- [ ] 주문하기 기능이 정상 작동하는지 확인
- [ ] 관리자 화면에서 주문 목록이 표시되는지 확인
- [ ] 관리자 화면에서 재고 관리가 정상 작동하는지 확인
- [ ] 주문 상태 변경이 정상 작동하는지 확인

### 성능 테스트
- [ ] 첫 로딩 시간 확인 (무료 플랜은 cold start 시간 고려)
- [ ] API 응답 시간 확인
- [ ] 이미지 로딩 시간 확인

---

## 문제 해결

### 백엔드 문제
- [ ] Logs 탭에서 오류 메시지 확인
- [ ] 환경 변수가 올바르게 설정되었는지 확인
- [ ] 데이터베이스 연결 정보 확인
- [ ] 포트 설정 확인 (Render는 자동으로 PORT 설정)

### 프론트엔드 문제
- [ ] 빌드 로그에서 오류 확인
- [ ] `VITE_API_BASE_URL` 환경 변수 확인
- [ ] 브라우저 콘솔에서 API 호출 오류 확인
- [ ] CORS 오류 확인 (백엔드 cors 설정 확인)

### 데이터베이스 문제
- [ ] 데이터베이스가 같은 지역에 있는지 확인
- [ ] Internal Database URL 사용 확인
- [ ] 데이터베이스 초기화가 완료되었는지 확인

---

## 추가 참고사항

### 무료 플랜 제한
- ⚠️ 서비스가 15분간 비활성 시 "sleep" 상태가 됩니다
- ⚠️ 첫 요청 시 약 30초의 cold start 시간이 필요합니다
- ⚠️ 데이터베이스는 90일간 비활성 시 삭제될 수 있습니다

### 프로덕션 권장사항
- [ ] 정기적으로 데이터베이스 백업
- [ ] 환경 변수는 Render Dashboard에서 관리
- [ ] 로그 모니터링 설정
- [ ] 에러 알림 설정 (선택사항)

