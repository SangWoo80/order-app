# Render 배포 문제 해결 가이드

## 오류: Cannot find module '/opt/render/project/src/server/index.js'

이 오류는 Render가 잘못된 경로에서 서버 파일을 찾으려고 할 때 발생합니다.

### 원인
- Root Directory가 제대로 설정되지 않음
- Start Command가 잘못 설정됨
- Render가 자동으로 잘못된 경로를 찾음

### 해결 방법

#### 방법 1: Render Dashboard에서 설정 확인 및 수정

1. **Render Dashboard 접속**
   - https://dashboard.render.com
   - 백엔드 서비스 페이지로 이동

2. **Settings 탭 클릭**

3. **다음 설정 확인 및 수정:**

   **Root Directory:**
   - 값: `server` (반드시 입력)
   - ⚠️ 빈 값이면 안 됩니다!

   **Build Command:**
   - 값: `npm install`
   - 또는: `cd server && npm install` (Root Directory가 설정되지 않은 경우)

   **Start Command:**
   - 값: `npm start`
   - 또는 직접 경로 지정: `node src/server.js`
   - ⚠️ `npm start`는 `package.json`의 `start` 스크립트를 실행합니다

4. **"Save Changes" 클릭**
   - 변경 사항 저장 후 자동으로 재배포됩니다

#### 방법 2: Start Command를 직접 경로로 지정

Root Directory가 `server`로 설정되어 있다면:
- **Start Command**: `node src/server.js`

Root Directory가 설정되지 않았다면:
- **Start Command**: `cd server && node src/server.js`

#### 방법 3: package.json 확인

`server/package.json` 파일에 다음이 있는지 확인:

```json
{
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js"
  }
}
```

### 올바른 설정 예시

**Render Dashboard 설정:**

```
Name: coffee-order-api
Region: (데이터베이스와 같은 지역)
Branch: main
Root Directory: server          ← 중요!
Runtime: Node
Build Command: npm install
Start Command: npm start        ← 또는 node src/server.js
Plan: Free
```

### 확인 방법

1. **Logs 탭 확인**
   - 배포 로그에서 실제 실행 경로 확인
   - 오류 메시지 확인

2. **Shell 탭에서 확인**
   - Shell 탭 열기
   - `pwd` 명령어로 현재 디렉토리 확인
   - `ls -la` 명령어로 파일 목록 확인
   - `ls -la src/` 명령어로 src 폴더 확인

### 추가 문제 해결

#### 문제: "npm: command not found"
- **해결**: Runtime을 `Node`로 설정했는지 확인

#### 문제: "Cannot find module 'express'"
- **해결**: Build Command가 `npm install`로 설정되었는지 확인
- Logs에서 `npm install`이 실행되었는지 확인

#### 문제: "Port already in use"
- **해결**: Render가 자동으로 PORT 환경 변수를 설정하므로, 코드에서 `process.env.PORT`를 사용해야 합니다
- 현재 코드는 이미 `process.env.PORT || 3000`을 사용하고 있으므로 문제없습니다

---

## 기타 일반적인 오류

### 데이터베이스 연결 오류

**오류 메시지:**
- `Connection refused`
- `ECONNREFUSED`
- `password authentication failed`

**해결 방법:**
1. Environment Variables에서 `DATABASE_URL` 확인
2. Internal Database URL 사용 (External이 아님)
3. 데이터베이스와 서버가 같은 지역에 있는지 확인

### 빌드 실패

**오류 메시지:**
- `npm ERR!`
- `Module not found`

**해결 방법:**
1. Build Command 확인: `npm install`
2. package.json이 올바른 위치에 있는지 확인
3. Logs에서 상세 오류 메시지 확인

---

## 체크리스트

배포 전 확인사항:

- [ ] Root Directory가 `server`로 설정되어 있음
- [ ] Build Command가 `npm install`로 설정되어 있음
- [ ] Start Command가 `npm start` 또는 `node src/server.js`로 설정되어 있음
- [ ] Runtime이 `Node`로 설정되어 있음
- [ ] Environment Variables에 `DATABASE_URL`이 설정되어 있음
- [ ] GitHub 저장소가 올바르게 연결되어 있음
- [ ] Branch가 올바른 브랜치(main)로 설정되어 있음

