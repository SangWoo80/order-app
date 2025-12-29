# 커피 주문 앱 백엔드 서버

Express.js를 사용한 커피 주문 앱의 백엔드 API 서버입니다.

## 기술 스택

- Node.js
- Express.js
- PostgreSQL
- pg (PostgreSQL 클라이언트)

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일에 데이터베이스 정보를 입력하세요.

`.env` 파일이 없으면 생성하고 다음 내용을 입력하세요:

```env
# 서버 포트
PORT=3000

# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=5432
DB_NAME=coffee_order_db
DB_USER=postgres
DB_PASSWORD=your_password

# 환경 설정
NODE_ENV=development
```

### 3. 개발 서버 실행

```bash
npm run dev
```

개발 모드에서는 `nodemon`이 자동으로 파일 변경을 감지하고 서버를 재시작합니다.

### 4. 프로덕션 서버 실행

```bash
npm start
```

## API 엔드포인트

서버가 실행되면 다음 엔드포인트를 사용할 수 있습니다:

- `GET /` - 서버 상태 확인
- `GET /health` - 헬스 체크

추가 API 엔드포인트는 개발 중입니다.

## 프로젝트 구조

```
server/
├── src/
│   ├── server.js          # 메인 서버 파일
│   ├── routes/            # API 라우트
│   ├── controllers/       # 컨트롤러
│   ├── models/            # 데이터 모델
│   ├── middleware/        # 미들웨어
│   └── config/            # 설정 파일
├── .env                   # 환경 변수 설정
├── .gitignore
├── package.json
└── README.md
```

## 데이터베이스 설정

### 1. PostgreSQL 데이터베이스 생성

PostgreSQL에 접속하여 데이터베이스를 생성하세요:

```sql
CREATE DATABASE coffee_order_db;
```

### 2. 환경 변수 설정

`.env` 파일에 데이터베이스 연결 정보를 입력하세요. PostgreSQL 설치 시 설정한 사용자명과 비밀번호를 사용하세요.

### 3. 데이터베이스 스키마 생성

다음 명령어를 실행하여 테이블과 초기 데이터를 생성하세요:

```bash
npm run db:setup
```

이 명령어는 다음을 수행합니다:
- 데이터베이스 연결 테스트
- 테이블 생성 (menus, options, orders, order_items, order_item_options)
- 초기 메뉴 및 옵션 데이터 삽입

### 4. 데이터베이스 연결 테스트

다음 명령어로 데이터베이스 연결을 테스트할 수 있습니다:

```bash
npm run db:test
```

## 데이터베이스 스키마

프로젝트는 다음 테이블을 사용합니다:

- **menus**: 커피 메뉴 정보
- **options**: 메뉴 옵션 정보
- **orders**: 주문 정보
- **order_items**: 주문 아이템 상세 정보
- **order_item_options**: 주문 아이템의 선택된 옵션 정보

자세한 스키마 정보는 `src/database/schema.sql` 파일을 참고하세요.

