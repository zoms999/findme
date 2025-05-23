'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTestStore } from '@/stores/testStore';

export default function QuestionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Zustand 스토어에서 상태와 액션 가져오기
  const {
    allQuestions,
    answers,
    currentPage,
    isLoading,
    error,
    setAttemptId,
    fetchQuestions,
    setAnswer,
    nextPage,
    prevPage,
    submitAnswers,
    getCurrentPageQuestions,
    getTotalPages,
    isCurrentPageComplete,
    resetStore,
  } = useTestStore();

  // 초기화
  useEffect(() => {
    const attemptIdParam = searchParams.get('attemptId');
    
    if (!attemptIdParam) {
      router.push('/start');
      return;
    }

    // UUID 형식 검증
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(attemptIdParam)) {
      router.push('/start');
      return;
    }

    // 스토어 초기화 및 데이터 로드
    resetStore();
    setAttemptId(attemptIdParam);
    fetchQuestions();
  }, [searchParams, router, setAttemptId, fetchQuestions, resetStore]);

  // 현재 페이지의 질문들 가져오기
  const currentQuestions = getCurrentPageQuestions();
  const totalPages = getTotalPages();
  const isLastPage = currentPage >= totalPages - 1;
  const isFirstPage = currentPage === 0;

  // 점수 선택 핸들러
  const handleScoreSelect = (questionId: number, score: number) => {
    setAnswer(questionId, score);
  };

  // 다음 페이지 핸들러
  const handleNext = () => {
    const success = nextPage();
    if (!success && error) {
      alert(error);
    }
  };

  // 이전 페이지 핸들러
  const handlePrev = () => {
    prevPage();
  };

  // 결과 보기 핸들러
  const handleSubmit = async () => {
    if (!isCurrentPageComplete()) {
      alert('현재 페이지의 모든 질문에 답변해주세요.');
      return;
    }

    const confirmSubmit = confirm('모든 답변을 제출하시겠습니까? 제출 후에는 수정할 수 없습니다.');
    if (confirmSubmit) {
      await submitAnswers(router);
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">질문을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error && allQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">오류가 발생했습니다</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => router.push('/start')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              처음으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 질문이 없는 경우
  if (allQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">질문을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            옥타그노시스 검사
          </h1>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <span>질문 {currentPage + 1} / {totalPages}</span>
            <span>•</span>
            <span>총 {allQuestions.length}개 문항</span>
          </div>
        </div>

        {/* 안내 문구 */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
          <p className="text-indigo-800 text-center font-medium">
            평소의 나와 가장 가까울수록 10점에 가깝게,<br />
            평소의 나와 같지 않을수록 1점에 가깝게 체크하세요.
          </p>
        </div>

        {/* 질문 카드 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="space-y-8">
            {currentQuestions.map((question, index) => (
              <div key={question.id} className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  {currentPage * 3 + index + 1}. {question.question_text}
                </h3>
                
                {/* 점수 선택 */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-500 px-2">
                    <span>전혀 아니다</span>
                    <span>매우 그렇다</span>
                  </div>
                  
                  <div className="grid grid-cols-10 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <label
                        key={score}
                        className={`flex flex-col items-center cursor-pointer transition-all duration-200 ${
                          answers[question.id] === score
                            ? 'transform scale-110'
                            : 'hover:transform hover:scale-105'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={score}
                          checked={answers[question.id] === score}
                          onChange={() => handleScoreSelect(question.id, score)}
                          className="sr-only"
                        />
                        <div
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                            answers[question.id] === score
                              ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg'
                              : 'border-gray-300 bg-white text-gray-600 hover:border-indigo-400 hover:bg-indigo-50'
                          }`}
                        >
                          {score}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-red-700 text-sm text-center">{error}</p>
          </div>
        )}

        {/* 네비게이션 버튼 */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={handlePrev}
            disabled={isFirstPage || isLoading}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              isFirstPage || isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-500 hover:bg-gray-600 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            ← 이전
          </button>

          <div className="text-center">
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <div
                  key={`page-${i + 1}-of-${totalPages}`}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    i === currentPage
                      ? 'bg-indigo-600 w-6'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {isLastPage ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                isLoading
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? '제출 중...' : '결과 보기'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={isLoading}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                isLoading
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              다음 →
            </button>
          )}
        </div>

        {/* 진행률 표시 */}
        <div className="mt-6 text-center">
          <div className="text-sm text-gray-600 mb-2">
            답변 완료: {Object.keys(answers).length} / {allQuestions.length}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(Object.keys(answers).length / allQuestions.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 