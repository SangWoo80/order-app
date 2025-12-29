# Render.com 배포 가이드 (간단 버전)

YAML 파일 없이 Render Dashboard에서 직접 설정하는 방법입니다.

---

## 📋 배포 순서 요약

1. **PostgreSQL 데이터베이스 만들기**
2. **백엔드 서버 배포하기**
3. **프론트엔드 배포하기**

---

## 1️⃣ PostgreSQL 데이터베이스 만들기

### Step 1: 데이터베이스 생성

1. https://dashboard.render.com 접속
2. 상단의 **"New +"** 버튼 클릭
3. **"PostgreSQL"** 선택
4. 다음 정보 입력:
   - **Name**: `coffee-order-db`
   - **Database**: `coffee_order_db`
   - **Region**: 가장 가까운 지역 선택 (예: Singapore, Oregon)
   - **PostgreSQL Version**: 최신 버전
   - **Plan**: `Free` 선택
5. **"Create Database"** 버튼 클릭

### Step 2: 데이터베이스 정보 복사

데이터베이스가 생성되면:
1. 데이터베이스 페이지로 이동
2. **"Connections"** 섹션에서 **"Internal Database URL"** 찾기
3. 전체 URL을 복사해 메모장에 저장
   - 예: `postgresql://user:password@host:port/database`

**이 URL은 다음 단계에서 사용합니다!**

---

## 2️⃣ 백엔드 서버 배포하기

### Step 1: GitHub 저장소 준비

1. GitHub에 로그인
2. 새 저장소 생성 (예: `coffee-order-app`)
3. 로컬 프로젝트를 GitHub에 푸시:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/coffee-order-app.git
   git push -u origin main
   ```

### Step 2: Render에서 Web Service 생성

1. Render Dashboard에서 **"New +"** 버튼 클릭
2. **"Web Service"** 선택
3. GitHub 저장소 연결:
   - **"Connect GitHub"** 클릭
   - 저장소 선택 화면에서 프로젝트 저장소 선택
   - 권한 승인
4. 서비스 설정 입력:
   - **Name**: `coffee-order-api`
   - **Region**: 데이터베이스와 같은 지역 선택
   - **Branch**: `main`
   - **Root Directory**: `server` ⚠️ **중요: server 입력**
   - **Runtime**: `Node` 선택
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free` 선택
5. **"Create Web Service"** 버튼 클릭

### Step 3: 환경 변수 설정

1. 서비스 페이지에서 왼쪽 메뉴 **"Environment"** 클릭
2. **"Add Environment Variable"** 버튼 클릭
3. 다음 환경 변수 추가:

   **첫 번째 변수:**
   - Key: `NODE_ENV`
   - Value: `production`
   - **Add** 클릭

   **두 번째 변수:**
   - Key: `DATABASE_URL`
   - Value: 1단계에서 복사한 **Internal Database URL** 붙여넣기
   - **Add** 클릭

4. 환경 변수 추가 후 자동으로 재배포가 시작됩니다.

### Step 4: 배포 확인

1. 상단의 **"Logs"** 탭 클릭
2. 배포가 완료될 때까지 대기 (약 2-3분)
3. 배포 완료 후 상단에 표시된 URL 확인
   - 예: `https://coffee-order-api.onrender.com`
4. 브라우저에서 다음 URL 접속하여 확인:
   - `https://coffee-order-api.onrender.com/health`
   - 정상이면 `{"success":true,"status":"healthy"}` 메시지 표시

### Step 5: 데이터베이스 초기화

1. 서비스 페이지에서 왼쪽 메뉴 **"Shell"** 클릭
2. Shell 창이 열리면 다음 명령어 입력:
   ```bash
   npm run db:setup
   ```
3. Enter 키 누르기
4. "데이터베이스 초기화가 완료되었습니다." 메시지 확인

---

## 3️⃣ 프론트엔드 배포하기

### Step 1: 백엔드 URL 확인

1. 백엔드 서비스 페이지로 이동
2. 상단에 표시된 URL 확인
   - 예: `https://coffee-order-api.onrender.com`
3. 이 URL을 복사해 메모장에 저장

### Step 2: Render에서 Static Site 생성

1. Render Dashboard에서 **"New +"** 버튼 클릭
2. **"Static Site"** 선택
3. GitHub 저장소 연결:
   - **"Connect GitHub"** 클릭
   - **같은 저장소** 선택 (백엔드와 동일)
   - 권한 승인
4. 서비스 설정 입력:
   - **Name**: `coffee-order-app`
   - **Branch**: `main`
   - **Root Directory**: `ui` ⚠️ **중요: ui 입력**
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Environment**: `Node` 선택
   - **Plan**: `Free` 선택
5. **"Create Static Site"** 버튼 클릭

### Step 3: 환경 변수 설정

1. 서비스 페이지에서 왼쪽 메뉴 **"Environment"** 클릭
2. **"Add Environment Variable"** 버튼 클릭
3. 환경 변수 추가:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://coffee-order-api.onrender.com/api`
     - ⚠️ **중요**: `coffee-order-api` 부분을 실제 백엔드 서비스 이름으로 변경!
   - **Add** 클릭

### Step 4: 배포 확인

1. 상단의 **"Logs"** 탭 클릭
2. 빌드가 완료될 때까지 대기 (약 3-5분)
3. 배포 완료 후 상단에 표시된 URL 확인
   - 예: `https://coffee-order-app.onrender.com`
4. 브라우저에서 접속하여 확인:
   - 메뉴가 정상적으로 표시되는지 확인
   - 주문 기능이 작동하는지 확인

---

## ✅ 배포 완료 체크리스트

### 데이터베이스
- [ ] 데이터베이스가 생성되었는지 확인
- [ ] Internal Database URL을 복사했는지 확인

### 백엔드
- [ ] 서비스가 정상적으로 배포되었는지 확인
- [ ] `/health` 엔드포인트가 정상 응답하는지 확인
- [ ] 데이터베이스 초기화가 완료되었는지 확인
- [ ] URL을 복사했는지 확인

### 프론트엔드
- [ ] 서비스가 정상적으로 배포되었는지 확인
- [ ] 빌드가 성공적으로 완료되었는지 확인
- [ ] 환경 변수가 올바르게 설정되었는지 확인
- [ ] 브라우저에서 앱이 정상 작동하는지 확인

---

## 🔧 문제 해결

### 백엔드가 시작되지 않을 때
1. **Logs** 탭에서 오류 메시지 확인
2. 환경 변수 `DATABASE_URL`이 올바르게 설정되었는지 확인
3. Root Directory가 `server`로 설정되었는지 확인

### 프론트엔드에서 API 호출 실패
1. 환경 변수 `VITE_API_BASE_URL`이 올바르게 설정되었는지 확인
2. 백엔드 URL이 정확한지 확인 (끝에 `/api` 포함)
3. 백엔드 서비스가 실행 중인지 확인

### 데이터베이스 연결 실패
1. `DATABASE_URL`이 Internal Database URL인지 확인
2. 데이터베이스와 서버가 같은 지역에 있는지 확인

---

## 💡 참고사항

### 무료 플랜 제한
- ⚠️ 서비스가 15분간 사용되지 않으면 "sleep" 상태가 됩니다
- ⚠️ 첫 요청 시 약 30초의 대기 시간이 필요합니다
- ⚠️ 데이터베이스는 90일간 비활성 시 삭제될 수 있습니다

### 팁
- 환경 변수는 Render Dashboard에서만 관리하세요
- 민감한 정보는 절대 코드에 하드코딩하지 마세요
- 문제가 발생하면 **Logs** 탭에서 오류 메시지를 확인하세요

