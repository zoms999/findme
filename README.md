# 나를 찾아줘! - 성격 유형 검사 웹 애플리케이션

개인의 성격 유형을 분석하는 종합적인 웹 기반 심리 검사 시스템입니다.

## 🚀 프로젝트 특징

### 핵심 기능
- **45개 문항의 정교한 성격 검사**: 15개 성격 유형별로 3개씩 총 45개 질문
- **실시간 진행률 표시**: 페이지별 진행 상황과 전체 답변 완료율 추적
- **동점 처리 시스템**: 여러 성격 유형이 같은 점수를 받을 경우 모든 유형 표시
- **소셜 공유 기능**: 카카오톡 공유 및 URL 복사 기능
- **반응형 디자인**: 모바일과 데스크톱 모든 환경에서 최적화된 UI/UX

### 기술적 특징
- **완전한 트랜잭션 기반 데이터 처리**: 답변 저장과 결과 계산의 원자성 보장
- **TypeScript 완전 지원**: 컴파일 타임 오류 방지와 개발 생산성 향상
- **Zod 스키마 검증**: 클라이언트-서버 간 데이터 무결성 보장
- **Zustand 상태 관리**: 복잡한 질문 답변 상태의 효율적 관리
- **SWR 데이터 페칭**: 캐싱과 동기화를 통한 최적화된 사용자 경험

## 🛠 기술 스택

### Frontend
- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Zustand** (상태 관리)
- **SWR** (데이터 페칭)
- **Lucide React** (아이콘)

### Backend
- **Next.js API Routes**
- **Prisma ORM**
- **PostgreSQL**
- **Zod** (스키마 검증)

### 외부 서비스
- **Kakao SDK** (소셜 공유)

## 📁 프로젝트 구조

```
src/
├── app/                          # Next.js App Router
│   ├── (test)/                   # 테스트 관련 라우트 그룹
│   │   ├── start/               # 성별/나이 선택 페이지
│   │   ├── questions/           # 질문 페이지
│   │   └── result/[attempt_id]/ # 결과 페이지
│   ├── api/                     # API 엔드포인트
│   │   ├── test/
│   │   │   ├── start/          # 테스트 시작 API
│   │   │   ├── submit/         # 답변 제출 API
│   │   │   └── result/         # 결과 조회 API
│   │   └── questions/          # 질문 조회 API
│   ├── globals.css             # 전역 스타일
│   ├── layout.tsx              # 루트 레이아웃
│   └── page.tsx                # 홈페이지
├── lib/                        # 공통 유틸리티
│   ├── prisma.ts              # Prisma 클라이언트
│   ├── types.ts               # TypeScript 타입 정의
│   └── zod-schemas.ts         # Zod 스키마
├── stores/                     # Zustand 스토어
│   └── testStore.ts           # 테스트 상태 관리
└── generated/                  # Prisma 생성 파일
    └── prisma/
```

## 🗄 데이터베이스 스키마

### 주요 테이블
- **PersonalityTypes**: 15개 성격 유형 정보
- **Questions**: 45개 검사 문항
- **TestAttempts**: 테스트 시도 기록
- **UserAnswers**: 사용자 답변 저장
- **TestResults**: 계산된 성격 유형 결과

### 특징
- **UUID 기반 식별자**: 보안성과 확장성 보장
- **JSON 필드 활용**: 유연한 메타데이터 저장
- **관계형 제약조건**: 데이터 무결성 보장
- **인덱스 최적화**: 빠른 조회 성능

## 🔄 애플리케이션 플로우

1. **홈페이지**: 검사 소개 및 시작 버튼
2. **기본 정보 입력**: 성별/나이 선택
3. **질문 답변**: 15페이지 × 3문항 (총 45개)
4. **결과 제출**: 트랜잭션 기반 데이터 저장
5. **결과 표시**: 성격 유형 분석 결과 및 공유

## 🚀 시작하기

### 필수 요구사항
- Node.js 18+ 
- PostgreSQL 데이터베이스
- npm 또는 yarn

### 설치 및 실행

1. **의존성 설치**
```bash
npm install
```

2. **환경 변수 설정**
```bash
# .env.local 파일 생성
DATABASE_URL="postgresql://username:password@localhost:5432/findme"
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY="your_kakao_app_key"
```

3. **데이터베이스 설정**
```bash
# Prisma 마이그레이션
npx prisma migrate dev

# 시드 데이터 실행 (선택사항)
npx prisma db seed
```

4. **개발 서버 실행**
```bash
npm run dev
```

5. **브라우저에서 확인**
```
http://localhost:3000
```

## 📊 성능 최적화

### 데이터베이스 최적화
- 트랜잭션 기반 일관성 보장
- 인덱스를 통한 빠른 조회
- JSON 필드로 유연한 스키마

### 프론트엔드 최적화
- SWR 캐싱으로 불필요한 재요청 방지
- Zustand로 효율적인 상태 관리
- 컴포넌트 레벨 코드 스플리팅

### 사용자 경험 최적화
- 실시간 진행률 표시
- 페이지별 유효성 검사
- 로딩 상태 및 오류 처리

## 🔒 보안 기능

- **UUID 기반 식별**: 예측 불가능한 ID 체계
- **입력 검증**: Zod 스키마로 모든 입력 데이터 검증
- **SQL 인젝션 방지**: Prisma ORM 사용
- **XSS 방지**: Next.js 내장 보안 기능

## 🧪 테스트

### API 테스트
```bash
# 개발 서버 실행 후
curl -X POST http://localhost:3000/api/test/start \
  -H "Content-Type: application/json" \
  -d '{"gender":"male","age":25}'
```

### 프론트엔드 테스트
브라우저에서 전체 플로우 테스트:
1. 홈페이지 → 기본 정보 입력
2. 45개 질문 순차 답변
3. 결과 페이지 확인
4. 공유 기능 테스트

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/새기능`)
3. 변경사항을 커밋합니다 (`git commit -am '새 기능 추가'`)
4. 브랜치에 푸시합니다 (`git push origin feature/새기능`)
5. Pull Request를 생성합니다

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 👥 만든 사람

- **개발자**: zoms999
- **GitHub**: https://github.com/zoms999/findme

## 🔄 버전 히스토리

### v1.0.0 (2025-01-XX)
- 기본 성격 검사 기능 구현
- 15개 성격 유형 × 3문항 시스템
- 카카오톡 공유 기능
- 반응형 UI/UX 디자인
- PostgreSQL + Prisma 데이터베이스 구조
- TypeScript 완전 지원

---

💡 **개선 사항이나 버그 리포트는 [Issues](https://github.com/zoms999/findme/issues)에 남겨주세요!**
