# 프론트엔드 Render 배포 가이드

이 문서는 `ui` 폴더의 프론트엔드를 Render.com에 Static Site로 배포하는 방법을 설명합니다.

---

## 📋 배포 전 확인사항

### ✅ 코드 확인

프론트엔드 코드는 이미 배포 준비가 되어 있습니다:
- ✅ `ui/src/api/api.js`에서 환경 변수 `VITE_API_BASE_URL` 사용
- ✅ 빌드 스크립트 (`npm run build`) 준비됨
- ✅ 이미지 파일들이 `ui/public` 폴더에 있음

**코드 수정 불필요!** 환경 변수만 설정하면 됩니다.

---

## 🚀 배포 과정

### 1단계: 백엔드 URL 확인

프론트엔드를 배포하기 전에 백엔드 서비스의 URL을 확인해야 합니다.

1. Render Dashboard 접속: https://dashboard.render.com
2. 백엔드 서비스 페이지로 이동 (예: `coffee-order-api`)
3. 상단에 표시된 URL 확인
   - 예: `https://coffee-order-api.onrender.com`
4. 이 URL을 메모장에 복사해 두세요
   - 나중에 환경 변수에 사용합니다

---

### 2단계: Render에서 Static Site 생성

1. **Render Dashboard 접속**
   - https://dashboard.render.com
   - 로그인

2. **"New +" 버튼 클릭**
   - 상단 오른쪽의 **"New +"** 버튼 클릭

3. **"Static Site" 선택**
   - 드롭다운 메뉴에서 **"Static Site"** 선택

4. **GitHub 저장소 연결**
   - **"Connect GitHub"** 또는 **"Connect GitLab"** 클릭
   - 저장소 선택 화면에서 **프로젝트 저장소** 선택
   - 권한 승인 (처음이면)

5. **서비스 설정 입력**

   다음 정보를 입력하세요:

   ```
   Name: coffee-order-app
   Branch: main
   Root Directory: ui                    ← 중요!
   Build Command: npm install && npm run build
   Publish Directory: dist
   Environment: Node
   Plan: Free
   ```

   **설명:**
   - **Name**: 서비스 이름 (영어와 하이픈만 사용)
   - **Branch**: 배포할 브랜치 (보통 `main`)
   - **Root Directory**: `ui` 입력 ⚠️ **반드시 입력!**
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist` (Vite 빌드 출력 폴더)
   - **Environment**: `Node` 선택
   - **Plan**: `Free` 선택 (무료 플랜)

6. **"Create Static Site" 버튼 클릭**

---

### 3단계: 환경 변수 설정

서비스가 생성되면 자동으로 빌드가 시작되지만, 먼저 환경 변수를 설정해야 합니다.

1. **서비스 페이지에서 "Environment" 클릭**
   - 왼쪽 메뉴에서 **"Environment"** 탭 클릭

2. **"Add Environment Variable" 버튼 클릭**

3. **환경 변수 추가**

   다음 정보를 입력:

   ```
   Key: VITE_API_BASE_URL
   Value: https://coffee-order-api.onrender.com/api
   ```

   ⚠️ **중요**: 
   - `coffee-order-api` 부분을 **실제 백엔드 서비스 이름**으로 변경하세요!
   - 백엔드 URL 끝에 `/api`를 붙여야 합니다
   - 예: 백엔드가 `https://my-api.onrender.com`이면 → `https://my-api.onrender.com/api`

4. **"Add" 버튼 클릭**

5. **환경 변수 추가 후 자동으로 재배포가 시작됩니다**

---

### 4단계: 배포 확인

1. **"Logs" 탭 확인**
   - 왼쪽 메뉴에서 **"Logs"** 탭 클릭
   - 빌드 진행 상황 확인
   - 빌드가 완료될 때까지 대기 (약 3-5분)

2. **배포 완료 확인**
   - 빌드가 성공적으로 완료되면 상단에 URL이 표시됩니다
   - 예: `https://coffee-order-app.onrender.com`

3. **브라우저에서 테스트**
   - 배포된 URL로 접속
   - 메뉴가 정상적으로 로드되는지 확인
   - 주문 기능이 작동하는지 확인
   - 관리자 화면이 정상 작동하는지 확인

---

## ✅ 배포 체크리스트

배포 전 확인사항:

- [ ] 백엔드 서비스가 정상적으로 배포되어 있는지 확인
- [ ] 백엔드 URL을 복사했는지 확인
- [ ] Root Directory가 `ui`로 설정되었는지 확인
- [ ] Build Command가 `npm install && npm run build`로 설정되었는지 확인
- [ ] Publish Directory가 `dist`로 설정되었는지 확인
- [ ] 환경 변수 `VITE_API_BASE_URL`이 올바르게 설정되었는지 확인
- [ ] 빌드가 성공적으로 완료되었는지 확인
- [ ] 브라우저에서 앱이 정상 작동하는지 확인

---

## 🔧 문제 해결

### 빌드 실패

**오류 메시지:**
- `npm ERR!`
- `Module not found`
- `Build failed`

**해결 방법:**
1. **Logs 탭에서 상세 오류 확인**
2. **Root Directory 확인**: `ui`로 설정되어 있는지 확인
3. **Build Command 확인**: `npm install && npm run build`로 설정되어 있는지 확인
4. **package.json 확인**: `ui/package.json` 파일이 올바른지 확인

### API 호출 실패

**오류 메시지:**
- `백엔드 서버에 연결할 수 없습니다`
- `CORS error`
- `404 Not Found`

**해결 방법:**
1. **환경 변수 확인**
   - `VITE_API_BASE_URL`이 올바르게 설정되었는지 확인
   - 백엔드 URL 끝에 `/api`가 포함되어 있는지 확인
   - 예: `https://coffee-order-api.onrender.com/api`

2. **백엔드 서비스 확인**
   - 백엔드 서비스가 실행 중인지 확인
   - 백엔드 URL이 올바른지 확인
   - Health check: `https://coffee-order-api.onrender.com/health`

3. **CORS 설정 확인**
   - 백엔드에서 `cors` 미들웨어가 설정되어 있는지 확인
   - 현재 코드는 이미 설정되어 있음

### 이미지가 표시되지 않음

**해결 방법:**
1. **이미지 파일 확인**
   - `ui/public` 폴더에 이미지 파일이 있는지 확인
   - 파일명이 올바른지 확인

2. **빌드 확인**
   - 빌드가 성공적으로 완료되었는지 확인
   - `dist` 폴더에 이미지가 복사되었는지 확인

---

## 📝 환경 변수 참고사항

### Vite 환경 변수 규칙

- Vite는 `VITE_` 접두사가 붙은 환경 변수만 클라이언트에서 접근 가능합니다
- 환경 변수는 빌드 시점에 코드에 포함됩니다
- 환경 변수를 변경하면 **재배포**가 필요합니다

### 환경 변수 설정 방법

**Render Dashboard에서:**
1. 서비스 페이지 → "Environment" 탭
2. "Add Environment Variable" 클릭
3. Key와 Value 입력
4. "Add" 클릭
5. 자동으로 재배포됨

**로컬 개발 시:**
- `ui/.env` 파일 생성 (Git에 커밋하지 않음)
- 내용: `VITE_API_BASE_URL=http://localhost:3000/api`

---

## 🎯 배포 후 확인사항

### 기능 테스트

- [ ] 메뉴 목록이 정상적으로 표시되는지 확인
- [ ] 메뉴 이미지가 정상적으로 표시되는지 확인
- [ ] 장바구니에 메뉴 추가가 정상 작동하는지 확인
- [ ] 주문하기 기능이 정상 작동하는지 확인
- [ ] 관리자 화면에서 주문 목록이 표시되는지 확인
- [ ] 관리자 화면에서 재고 관리가 정상 작동하는지 확인
- [ ] 주문 상태 변경이 정상 작동하는지 확인

### 성능 확인

- [ ] 첫 로딩 시간 확인 (무료 플랜은 cold start 시간 고려)
- [ ] 이미지 로딩 시간 확인
- [ ] API 응답 시간 확인

---

## 💡 추가 팁

### 무료 플랜 제한사항

- ⚠️ Static Site는 무료 플랜에서도 sleep 상태가 되지 않습니다
- ⚠️ 첫 빌드는 약 3-5분이 소요될 수 있습니다
- ⚠️ 코드 변경 시 자동으로 재배포됩니다

### 프로덕션 권장사항

- 환경 변수는 Render Dashboard에서만 관리
- 민감한 정보는 절대 코드에 하드코딩하지 않기
- 정기적으로 빌드 로그 확인
- 브라우저 콘솔에서 오류 확인

---

## 📚 관련 문서

- [전체 배포 가이드](./DEPLOYMENT_SIMPLE.md)
- [문제 해결 가이드](./RENDER_TROUBLESHOOTING.md)

