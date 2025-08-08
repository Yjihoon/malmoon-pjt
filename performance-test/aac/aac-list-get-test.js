import http from 'k6/http';
import { check } from 'k6';

// 테스트 옵션 설정 (시나리오 정의)
export const options = {
  vus: 10,               // 가상 사용자 수(Virtual Users) → 동시에 50명이 접속한다고 가정
  duration: '10s',       // 테스트 지속 시간 → 20초 동안 계속 요청을 반복
};

// 테스트 사용자 계정 정보
const email = 'test@test.com';
const password = 'qwer1234';

// 테스트 본문 정의
export default function () {
  // 1. 로그인 요청
  const loginPayload = JSON.stringify({ email, password });

  const loginHeaders = {
    'Content-Type': 'application/json',
  };

  const loginRes = http.post('http://localhost:8080/api/v1/auth/login', loginPayload, {
    headers: loginHeaders,
  });

  // 2. 응답 확인 및 accessToken 추출
  check(loginRes, {
    '로그인 성공': (res) => res.status === 200,
    'accessToken 존재': (res) => JSON.parse(res.body).accessToken !== undefined,
  });

  const accessToken = JSON.parse(loginRes.body).accessToken;

  // 3. 보호된 API 호출 (예: AAC 목록 조회)
  const protectedHeaders = {
    Authorization: `Bearer ${accessToken}`,
  };

const situation = encodeURIComponent('학교');
const action = encodeURIComponent('먹다');
const query = `?page=0&size=10&situation=${situation}&action=${action}`;

  const res = http.get(`http://localhost:8080/api/v1/aacs${query}`, {
    headers: protectedHeaders,
  });

  // 응답 결과 확인 (check는 k6에서 제공하는 assertion 유틸)
check(res, {
  'AAC 목록 200 응답': (r) => {
    console.log('응답 상태:', r.status);
    return r.status === 200;
  },
});

}
