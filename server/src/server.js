import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { testConnection } from './database/init.js';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors()); // CORS 허용 (프런트엔드와 통신을 위해)
app.use(express.json()); // JSON 요청 본문 파싱
app.use(express.urlencoded({ extended: true })); // URL 인코딩된 요청 본문 파싱

// 디버깅: 모든 요청 로깅
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '커피 주문 앱 API 서버가 실행 중입니다.',
    version: '1.0.0'
  });
});

// Health check 엔드포인트
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API 라우트
app.use('/api', routes);
console.log('API 라우트 등록 완료: /api');

// 404 핸들러 (모든 라우트 이후에만 실행)
app.use((req, res) => {
  console.log(`404 오류: ${req.method} ${req.path} - 라우트를 찾을 수 없습니다.`);
  res.status(404).json({
    success: false,
    error: '요청한 리소스를 찾을 수 없습니다.',
    path: req.path,
    method: req.method
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('서버 오류:', err);
  res.status(500).json({
    success: false,
    error: '서버 내부 오류가 발생했습니다.'
  });
});

// 서버 시작
app.listen(PORT, async () => {
  console.log(`\n========================================`);
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`http://localhost:${PORT}`);
  console.log(`API 엔드포인트: http://localhost:${PORT}/api`);
  console.log(`메뉴 API: http://localhost:${PORT}/api/menus`);
  console.log(`========================================\n`);
  
  // 데이터베이스 연결 테스트
  await testConnection();
  
  // 등록된 라우트 확인
  console.log('\n등록된 라우트:');
  console.log('  GET  /api/menus');
  console.log('  GET  /api/menus/inventory');
  console.log('  PATCH /api/menus/:menuId/inventory');
  console.log('  POST /api/orders');
  console.log('  GET  /api/orders');
  console.log('  GET  /api/orders/:orderId');
  console.log('  PATCH /api/orders/:orderId/status');
  console.log('\n서버가 준비되었습니다!\n');
});

