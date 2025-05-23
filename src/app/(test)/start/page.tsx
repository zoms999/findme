'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type AgeRange = 'under18' | '19-25' | '26-50' | 'over51';
type Gender = 'male' | 'female';

// 나이대를 대표 나이값으로 변환하는 함수
const getRepresentativeAge = (ageRange: AgeRange): number => {
  switch (ageRange) {
    case 'under18':
      return 15;
    case '19-25':
      return 22;
    case '26-50':
      return 38;
    case 'over51':
      return 55;
    default:
      return 25;
  }
};

export default function StartTestPage() {
  const router = useRouter();
  
  // 상태 관리
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [selectedAgeRange, setSelectedAgeRange] = useState<AgeRange | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 성별 버튼 데이터
  const genderOptions = [
    { value: 'male' as Gender, label: '남자' },
    { value: 'female' as Gender, label: '여자' }
  ];

  // 나이 버튼 데이터
  const ageOptions = [
    { value: 'under18' as AgeRange, label: '18세 이하' },
    { value: '19-25' as AgeRange, label: '19~25세' },
    { value: '26-50' as AgeRange, label: '26~50세' },
    { value: 'over51' as AgeRange, label: '51세 이상' }
  ];

  // API 호출 함수
  const handleNext = async () => {
    // 유효성 검사
    if (!selectedGender || !selectedAgeRange) {
      setError('성별과 나이를 모두 선택해주세요.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // API 호출 데이터 준비
      const requestData = {
        gender: selectedGender,
        age: getRepresentativeAge(selectedAgeRange),
      };

      // API 호출
      const response = await fetch('/api/test/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '테스트 시작에 실패했습니다.');
      }

      if (result.success && result.attempt_id) {
        // 성공 시 질문 페이지로 이동
        router.push(`/questions?attemptId=${result.attempt_id}`);
      } else {
        throw new Error('서버 응답이 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('API 호출 오류:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* 로고/제목 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            옥타그노시스 검사
          </h1>
          <div className="w-20 h-1 bg-indigo-600 mx-auto rounded" />
        </div>

        {/* 메인 컨텐츠 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-8">
          {/* 성별 선택 섹션 */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">성별</h2>
            <div className="grid grid-cols-2 gap-3">
              {genderOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedGender(option.value)}
                  className={`py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200 ${
                    selectedGender === option.value
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                  disabled={isLoading}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 나이 선택 섹션 */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">나이</h2>
            <div className="grid grid-cols-2 gap-3">
              {ageOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedAgeRange(option.value)}
                  className={`py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200 ${
                    selectedAgeRange === option.value
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                  disabled={isLoading}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* NEXT 버튼 */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleNext}
              disabled={isLoading}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 ${
                isLoading
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  처리 중...
                </div>
              ) : (
                'NEXT →'
              )}
            </button>
          </div>
        </div>

        {/* 진행 표시 */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-indigo-600 rounded-full" />
            <div className="w-3 h-3 bg-gray-300 rounded-full" />
            <div className="w-3 h-3 bg-gray-300 rounded-full" />
          </div>
          <p className="text-sm text-gray-500 mt-2">1/3 단계</p>
        </div>
      </div>
    </div>
  );
} 