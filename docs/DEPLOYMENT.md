# Render.com 배포 가이드

이 문서는 커피 주문 앱을 Render.com에 배포하는 방법을 설명합니다.

## 배포 순서

1. **PostgreSQL 데이터베이스 배포**
2. **백엔드 서버 배포**
3. **프론트엔드 배포**

---

## 1단계: PostgreSQL 데이터베이스 배포

### 1.1 Render Dashboard에서 PostgreSQL 생성

1. Render Dashboard (https://dashboard.render.com) 접속
2. **"New +"** 버튼 클릭 → **"PostgreSQL"** 선택
3. 설정 입력:
   - **Name**: `coffee-order-db` (원하는 이름)
   - **Database**: `coffee_order_db` (또는 원하는 이름)
   - **User**: 자동 생성됨
   - **Region**: 가장 가까운 지역 선택
   - **PostgreSQL Version**: 최신 버전 선택
   - **Plan**: Free tier 선택 (또는 원하는 플랜)
4. **"Create Database"** 클릭

### 1.2 데이터베이스 정보 확인

생성 후 다음 정보를 복사해 두세요:
- **Internal Database URL**: 백엔드에서 사용
- **External Database URL**: 로컬에서 연결 시 사용
- **Host, Port, Database, User, Password**: 개별 값들

### 1.3 데이터베이스 초기화 (선택사항)

로컬에서 데이터베이스를 초기화하려면:

1. `.env` 파일에 External Database URL 설정:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

2. 또는 개별 환경 변수 설정:
   ```
   DB_HOST=your-host
   DB_PORT=5432
   DB_NAME=coffee_order_db
   DB_USER=your-user
   DB_PASSWORD=your-password
   ```

3. 데이터베이스 초기화 실행:
   ```bash
   cd server
   npm run db:setup
   ```

---

## 2단계: 백엔드 서버 배포

### 2.1 GitHub 저장소 준비

1. 프로젝트를 GitHub에 푸시 (아직 안 했다면)
   - GitHub에 로그인
   - 새 저장소 생성 (예: `coffee-order-app`)
   - 로컬 프로젝트를 GitHub에 푸시

### 2.2 Render에서 Web Service 생성

1. Render Dashboard에서 **"New +"** 버튼 클릭
2. **"Web Service"** 선택
3. GitHub 저장소 연결
   - "Connect GitHub" 또는 "Connect GitLab" 클릭
   - 저장소 선택 화면에서 프로젝트 저장소 선택
   - 권한 승인
4. 서비스 설정 화면에서 다음 정보 입력:
   - **Name**: `coffee-order-api` (원하는 이름, 영어와 하이픈만 사용)
   - **Region**: 데이터베이스와 같은 지역 선택 (예: Oregon, Singapore 등)
   - **Branch**: `main` (또는 배포할 브랜치 이름)
   - **Root Directory**: `server` 입력 (서버 폴더가 루트가 아닌 경우)
   - **Runtime**: 드롭다운에서 `Node` 선택
   - **Build Command**: `npm install` 입력
   - **Start Command**: `npm start` 입력
   - **Plan**: `Free` 선택 (무료 플랜)
5. **"Create Web Service"** 버튼 클릭

### 2.3 환경 변수 설정

서비스가 생성되면 자동으로 배포가 시작됩니다. 배포 전에 환경 변수를 설정해야 합니다:

1. 서비스 페이지에서 왼쪽 메뉴의 **"Environment"** 클릭
2. **"Add Environment Variable"** 버튼 클릭
3. 다음 중 하나의 방법 선택:

**방법 1: DATABASE_URL 사용 (권장, 더 간단함)**

환경 변수를 하나씩 추가:
- **Key**: `NODE_ENV`
- **Value**: `production`
- **Add** 클릭

- **Key**: `DATABASE_URL`
- **Value**: 1단계에서 복사한 **Internal Database URL** 붙여넣기
  (형식: `postgresql://user:password@host:port/database`)
- **Add** 클릭

**방법 2: 개별 환경 변수 사용**

환경 변수를 하나씩 추가:
- **Key**: `NODE_ENV`, **Value**: `production`
- **Key**: `DB_HOST`, **Value**: 데이터베이스의 Host 값
- **Key**: `DB_PORT`, **Value**: `5432`
- **Key**: `DB_NAME`, **Value**: 데이터베이스의 Database 이름
- **Key**: `DB_USER`, **Value**: 데이터베이스의 User 이름
- **Key**: `DB_PASSWORD`, **Value**: 데이터베이스의 Password 값

**참고**: 
- Render는 자동으로 `PORT` 환경 변수를 제공하므로, `PORT`는 설정하지 않아도 됩니다.
- 환경 변수 추가 후 서비스가 자동으로 재배포됩니다.

### 2.4 데이터베이스 초기화

서버가 배포된 후, 데이터베이스를 초기화해야 합니다:

1. Render Dashboard에서 백엔드 서비스 페이지로 이동
2. 왼쪽 메뉴에서 **"Shell"** 탭 클릭
3. Shell 창이 열리면 다음 명령어 입력 후 Enter:
   ```bash
   npm run db:setup
   ```
4. 초기화가 완료되면 "데이터베이스 초기화가 완료되었습니다." 메시지 확인

**또는** 로컬 컴퓨터에서 초기화하려면:
1. 로컬에서 `server` 폴더로 이동
2. `.env` 파일에 External Database URL 설정:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   ```
3. 터미널에서 실행:
   ```bash
   npm run db:setup
   ```

### 2.5 배포 확인

서비스가 배포되면:
- **URL**: `https://coffee-order-api.onrender.com` (서비스 이름에 따라 다름)
- Health check: `https://coffee-order-api.onrender.com/health`
- API 테스트: `https://coffee-order-api.onrender.com/api/menus`

---

## 3단계: 프론트엔드 배포

### 3.1 백엔드 URL 확인

프론트엔드를 배포하기 전에 백엔드 서비스의 URL을 확인하세요:
- 백엔드 서비스 페이지에서 상단에 표시된 URL 확인
- 예: `https://coffee-order-api.onrender.com`
- 이 URL을 복사해 두세요 (나중에 사용)

### 3.2 Render에서 Static Site 생성

1. Render Dashboard에서 **"New +"** 버튼 클릭
2. **"Static Site"** 선택
3. GitHub 저장소 연결
   - "Connect GitHub" 또는 "Connect GitLab" 클릭
   - **같은 저장소** 선택 (백엔드와 동일한 저장소)
   - 권한 승인
4. 서비스 설정 화면에서 다음 정보 입력:
   - **Name**: `coffee-order-app` (원하는 이름, 영어와 하이픈만 사용)
   - **Branch**: `main` (또는 배포할 브랜치 이름)
   - **Root Directory**: `ui` 입력 (프론트엔드 폴더)
   - **Build Command**: `npm install && npm run build` 입력
   - **Publish Directory**: `dist` 입력 (Vite 기본 빌드 출력 폴더)
   - **Environment**: 드롭다운에서 `Node` 선택
   - **Plan**: `Free` 선택 (무료 플랜)
5. **"Create Static Site"** 버튼 클릭

### 3.3 환경 변수 설정

서비스가 생성되면 환경 변수를 설정해야 합니다:

1. 프론트엔드 서비스 페이지에서 왼쪽 메뉴의 **"Environment"** 클릭
2. **"Add Environment Variable"** 버튼 클릭
3. 환경 변수 추가:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://coffee-order-api.onrender.com/api`
     - ⚠️ **중요**: `coffee-order-api` 부분을 실제 백엔드 서비스 이름으로 변경하세요!
     - 백엔드 서비스 페이지에서 확인한 URL에 `/api`를 붙여서 입력
   - **Add** 클릭

**중요**: 
- Vite는 `VITE_` 접두사가 붙은 환경 변수만 클라이언트에서 접근 가능합니다.
- 환경 변수 추가 후 서비스가 자동으로 재배포됩니다.

### 3.4 배포 확인

배포가 완료되면:
- **URL**: `https://coffee-order-app.onrender.com` (서비스 이름에 따라 다름)
- 브라우저에서 접속하여 앱이 정상 작동하는지 확인

---

## 배포 후 확인 사항

### ✅ 데이터베이스
- [ ] 데이터베이스가 생성되었는지 확인
- [ ] 스키마가 초기화되었는지 확인
- [ ] 초기 데이터가 삽입되었는지 확인

### ✅ 백엔드
- [ ] 서버가 정상적으로 시작되었는지 확인
- [ ] Health check 엔드포인트 (`/health`) 응답 확인
- [ ] API 엔드포인트 (`/api/menus`) 응답 확인
- [ ] 데이터베이스 연결이 정상인지 확인

### ✅ 프론트엔드
- [ ] 빌드가 성공적으로 완료되었는지 확인
- [ ] API 호출이 정상적으로 작동하는지 확인
- [ ] 이미지가 정상적으로 표시되는지 확인
- [ ] 주문 기능이 정상적으로 작동하는지 확인

---

## 문제 해결

### 백엔드가 시작되지 않는 경우
- 로그 확인: Render Dashboard → 서비스 → **Logs** 탭
- 환경 변수가 올바르게 설정되었는지 확인
- 데이터베이스 연결 정보 확인

### 프론트엔드에서 API 호출 실패
- `VITE_API_BASE_URL` 환경 변수가 올바르게 설정되었는지 확인
- 백엔드 서비스가 실행 중인지 확인
- CORS 설정 확인 (백엔드에서 `cors` 미들웨어 사용 중)

### 데이터베이스 연결 실패
- 데이터베이스가 같은 지역에 있는지 확인
- Internal Database URL 사용 확인
- 방화벽 설정 확인 (Render는 자동으로 처리)

---

## 추가 참고사항

### 무료 플랜 제한사항
- Render 무료 플랜은 15분간 요청이 없으면 서비스가 "sleep" 상태가 됩니다
- 첫 요청 시 약 30초 정도의 "cold start" 시간이 필요합니다
- 데이터베이스는 90일간 비활성 시 삭제될 수 있습니다

### 프로덕션 환경 권장사항
- 환경 변수는 Render Dashboard에서 관리
- 민감한 정보는 절대 코드에 하드코딩하지 않기
- 정기적으로 데이터베이스 백업 수행
- 모니터링 및 로그 확인

