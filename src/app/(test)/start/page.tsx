'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Users, Calendar, ArrowRight, Loader2 } from 'lucide-react';

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
    { value: 'male' as Gender, label: '남자', icon: <User size={20} /> },
    { value: 'female' as Gender, label: '여자', icon: <User size={20} /> }
  ];

  // 나이 버튼 데이터
  const ageOptions = [
    { value: 'under18' as AgeRange, label: '18세 이하', icon: <Calendar size={20} /> },
    { value: '19-25' as AgeRange, label: '19~25세', icon: <Calendar size={20} /> },
    { value: '26-50' as AgeRange, label: '26~50세', icon: <Calendar size={20} /> },
    { value: 'over51' as AgeRange, label: '51세 이상', icon: <Calendar size={20} /> }
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
    <div className="min-h-screen bg-gradient-to-tr from-slate-900 via-purple-900 to-slate-900 py-12 px-4 flex flex-col items-center justify-center">
      {/* 로고 또는 서비스 이름 */}
      <div className="text-center mb-10">
        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <Users size={28} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 mb-2">
          옥타그노시스 AI
        </h1>
        <p className="text-lg text-slate-400">당신의 성향을 찾아보세요</p>
      </div>

      <div className="w-full max-w-lg bg-slate-800 bg-opacity-50 backdrop-blur-md rounded-xl shadow-2xl p-8 space-y-8 border border-slate-700">
        {/* 성별 선택 */}
        <div>
          <h2 className="text-xl font-semibold text-slate-200 mb-1">성별을 선택해주세요</h2>
          <p className="text-sm text-slate-400 mb-4">검사 결과 분석에 사용됩니다.</p>
          <div className="grid grid-cols-2 gap-4">
            {genderOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedGender(option.value)}
                className={`group flex items-center justify-center space-x-2 py-4 px-4 rounded-lg border-2 transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 ${
                  selectedGender === option.value
                    ? 'border-purple-500 bg-purple-500 bg-opacity-20 text-purple-300 shadow-lg'
                    : 'border-slate-700 bg-slate-700 bg-opacity-40 text-slate-300 hover:border-purple-600 hover:text-purple-300'
                }`}
                disabled={isLoading}
              >
                {option.icon}
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 나이 선택 */}
        <div>
          <h2 className="text-xl font-semibold text-slate-200 mb-1">나이대를 선택해주세요</h2>
          <p className="text-sm text-slate-400 mb-4">맞춤형 분석을 위해 필요합니다.</p>
          <div className="grid grid-cols-2 gap-4">
            {ageOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedAgeRange(option.value)}
                className={`group flex items-center justify-center space-x-2 py-4 px-4 rounded-lg border-2 transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 ${
                  selectedAgeRange === option.value
                    ? 'border-purple-500 bg-purple-500 bg-opacity-20 text-purple-300 shadow-lg'
                    : 'border-slate-700 bg-slate-700 bg-opacity-40 text-slate-300 hover:border-purple-600 hover:text-purple-300'
                }`}
                disabled={isLoading}
              >
                {option.icon}
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-700 rounded-lg p-3 text-center">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* NEXT 버튼 */}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleNext}
            disabled={isLoading || !selectedGender || !selectedAgeRange}
            className={`w-full flex items-center justify-center space-x-2 py-4 rounded-lg font-semibold text-lg transition-all duration-300 ease-in-out transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 ${
              isLoading || !selectedGender || !selectedAgeRange
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={22} className="animate-spin" />
                <span>처리 중...</span>
              </>
            ) : (
              <>
                <span>NEXT</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* 진행 표시 */}
      <div className="mt-10 w-full max-w-lg">
        <div className="flex justify-between items-center text-xs text-slate-500 mb-2 px-1">
          <span>정보 입력</span>
          <span>성향 분석</span>
          <span>결과 확인</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: '33%' }}
          />
        </div>
      </div>
    </div>
  );
} 