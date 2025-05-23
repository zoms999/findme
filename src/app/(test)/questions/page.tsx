'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTestStore } from '@/stores/testStore';
import { Loader2, AlertTriangle, ArrowLeft, ArrowRight, Send, Info } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-lg">질문을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error && allQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-900 bg-opacity-30 border border-red-700 rounded-xl p-8 shadow-lg">
            <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-300 mb-2">오류가 발생했습니다</h2>
            <p className="text-red-400 mb-6">{error}</p>
            <button
              type="button"
              onClick={() => router.push('/start')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="text-purple-400 animate-spin mx-auto mb-2" />
          <p className="text-slate-400">질문을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-10 px-4 text-slate-200">
      <div className="max-w-3xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 mb-2">
            옥타그노시스 성향 분석
          </h1>
          <div className="flex items-center justify-center space-x-3 text-sm text-slate-400">
            <span>질문 {currentPage + 1} / {totalPages}</span>
            <span>•</span>
            <span>총 {allQuestions.length}개 문항</span>
          </div>
        </div>

        {/* 안내 문구 */}
        <div className="bg-slate-800 bg-opacity-70 border border-slate-700 rounded-xl p-5 mb-8 shadow-lg">
          <div className="flex items-center">
            <Info size={24} className="text-purple-400 mr-3 flex-shrink-0" />
            <p className="text-slate-300 text-center md:text-left font-medium">
              평소의 나와 가장 가까울수록 10점에 가깝게,<br />
              평소의 나와 같지 않을수록 1점에 가깝게 체크하세요.
            </p>
          </div>
        </div>

        {/* 질문 카드 */}
        <div className="bg-slate-800 bg-opacity-50 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 mb-8 border border-slate-700">
          <div className="space-y-10">
            {currentQuestions.map((question, index) => (
              <div key={question.id} className="border-b border-slate-700 last:border-b-0 pb-8 last:pb-0">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-100 mb-5 leading-snug">
                  {currentPage * 3 + index + 1}. {question.question_text}
                </h3>
                
                {/* 점수 선택 */}
                <div className="space-y-2">
                  <div className="hidden sm:flex justify-between text-xs text-slate-400 px-1 mb-1">
                    <span>전혀 아니다</span>
                    <span>중간</span>
                    <span>매우 그렇다</span>
                  </div>
                  
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <label
                        key={score}
                        className={`relative flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ease-in-out rounded-lg aspect-square ${
                          answers[question.id] === score
                            ? 'transform scale-110 ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-800'
                            : 'hover:transform hover:scale-105 hover:bg-slate-700'
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
                          className={`w-full h-full border-2 flex items-center justify-center text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 ease-in-out ${
                            answers[question.id] === score
                              ? 'border-purple-500 bg-purple-600 text-white shadow-lg'
                              : 'border-slate-600 bg-slate-700 bg-opacity-50 text-slate-300 hover:border-purple-500 hover:bg-purple-700 hover:bg-opacity-30'
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
          <div className="bg-red-900 bg-opacity-50 border border-red-700 rounded-lg p-4 mb-8 text-center">
            <p className="text-red-300 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* 네비게이션 버튼 */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={isFirstPage || isLoading}
            className={`w-full sm:w-auto flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 ${
              isFirstPage || isLoading
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-slate-600 hover:bg-slate-500 text-slate-100 shadow-lg'
            }`}
          >
            <ArrowLeft size={20} className="mr-2" />
            이전
          </button>

          {/* 페이지 인디케이터 */}
          <div className="flex items-center space-x-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <div
                key={`page-${i + 1}-of-${totalPages}`}
                className={`h-2 rounded-full transition-all duration-300 ease-in-out ${
                  i === currentPage
                    ? 'bg-purple-500 w-6'
                    : 'bg-slate-600 w-2 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          {isLastPage ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full sm:w-auto flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 ${
                isLoading
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-xl'
              }`}
            >
              {isLoading ? <Loader2 size={20} className="animate-spin mr-2" /> : <Send size={20} className="mr-2" />}
              {isLoading ? '제출 중...' : '결과 보기'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={isLoading}
              className={`w-full sm:w-auto flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 ${
                isLoading
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl'
              }`}
            >
              다음
              <ArrowRight size={20} className="ml-2" />
            </button>
          )}
        </div>

        {/* 진행률 표시 */}
        <div className="mt-10 text-center">
          <div className="text-sm text-slate-400 mb-2">
            답변 완료: {Object.keys(answers).length} / {allQuestions.length}
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2.5 relative overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-300 ease-out shadow-inner"
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