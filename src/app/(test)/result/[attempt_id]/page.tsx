'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import Script from 'next/script';
import { 
  Share2, 
  Copy, 
  CheckCircle, 
  Star, 
  AlertTriangle,
  ExternalLink,
  Loader2,
  RefreshCw
} from 'lucide-react';

declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (options: {
          objectType: string;
          content: {
            title: string;
            description: string;
            imageUrl: string;
            link: {
              mobileWebUrl: string;
              webUrl: string;
            };
          };
          buttons: Array<{
            title: string;
            link: {
              mobileWebUrl: string;
              webUrl: string;
            };
          }>;
        }) => void;
      };
    };
  }
}

interface ResultPersonalityType {
  id: string;
  type_code: string;
  type_name: string;
  title: string;
  theme_sentence: string;
  description: string;
  description_points: string[];
  strength_keywords: string[];
  weakness_keywords: string[];
  calculated_score: number;
}

interface TestResultData {
  attempt_id: string;
  test_completed_at: string;
  max_score: number;
  personality_types: ResultPersonalityType[];
  is_tie: boolean;
  total_questions_answered: number;
}

interface ApiResponse {
  success: boolean;
  data?: TestResultData;
  message: string;
}

// SWR fetcher 함수
const fetcher = async (url: string): Promise<ApiResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('결과를 불러오는데 실패했습니다.');
  }
  return response.json();
};

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attempt_id as string;
  
  const [copySuccess, setCopySuccess] = useState(false);
  const [kakaoReady, setKakaoReady] = useState(false);

  // SWR로 결과 데이터 페칭
  const { data, error, isLoading, mutate } = useSWR<ApiResponse>(
    attemptId ? `/api/test/result/${attemptId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // 카카오 SDK 초기화
  useEffect(() => {
    const initKakao = () => {
      if (window.Kakao?.isInitialized?.() === false) {
        const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
        if (kakaoKey) {
          window.Kakao.init(kakaoKey);
          setKakaoReady(true);
        }
      } else if (window.Kakao?.isInitialized?.() === true) {
        setKakaoReady(true);
      }
    };

    if (window.Kakao) {
      initKakao();
    } else {
      // Kakao SDK가 로드되면 초기화
      const handleLoad = () => initKakao();
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  // URL 복사 기능
  const handleCopyUrl = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('URL 복사 실패:', error);
      alert('URL 복사에 실패했습니다.');
    }
  };

  // 카카오톡 공유 기능
  const handleKakaoShare = () => {
    if (!kakaoReady || !window.Kakao) {
      alert('카카오톡 공유 기능을 준비 중입니다.');
      return;
    }

    if (!data?.success || !data.data) {
      alert('공유할 결과가 없습니다.');
      return;
    }

    const firstType = data.data.personality_types[0];
    const currentUrl = window.location.href;

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '나를 찾았어!! - 옥타그노시스 성격 검사 결과',
        description: `${firstType.title}\n${firstType.theme_sentence}`,
        imageUrl: 'https://via.placeholder.com/400x300?text=Personality+Test', // 실제 이미지 URL로 교체
        link: {
          mobileWebUrl: currentUrl,
          webUrl: currentUrl,
        },
      },
      buttons: [
        {
          title: '결과 확인하기',
          link: {
            mobileWebUrl: currentUrl,
            webUrl: currentUrl,
          },
        },
        {
          title: '나도 검사하기',
          link: {
            mobileWebUrl: window.location.origin,
            webUrl: window.location.origin,
          },
        },
      ],
    });
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || !data?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-800 mb-2">결과를 불러올 수 없습니다</h2>
            <p className="text-red-700 mb-4">
              {error?.message || data?.message || '알 수 없는 오류가 발생했습니다.'}
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => mutate()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg mr-2"
              >
                <RefreshCw className="w-4 h-4 inline mr-1" />
                다시 시도
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                처음으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const resultData = data.data;
  if (!resultData) return null;
  
  const personalityTypes = resultData.personality_types;

  return (
    <>
      {/* 카카오 SDK 로드 */}
      <Script
        src="https://developers.kakao.com/sdk/js/kakao.js"
        onLoad={() => {
          const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
          if (window.Kakao && kakaoKey && !window.Kakao.isInitialized()) {
            window.Kakao.init(kakaoKey);
            setKakaoReady(true);
          }
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* 메인 타이틀 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              나를 찾았어!!
            </h1>
            <p className="text-lg text-gray-600">
              {resultData.is_tie 
                ? `${personalityTypes.length}개의 성격 유형이 동점으로 나타났습니다!`
                : '당신의 성격 유형을 발견했습니다!'
              }
            </p>
          </div>

          {/* 결과 카드들 */}
          <div className="space-y-8 mb-8">
            {personalityTypes.map((type) => (
              <div key={type.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* 카드 헤더 */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium opacity-90">
                      {personalityTypes.length > 1 ? `결과 ${personalityTypes.indexOf(type) + 1}` : '검사 결과'}
                    </span>
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                      {type.calculated_score}점
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">
                    {type.title}
                  </h2>
                  <p className="text-xl md:text-2xl font-semibold text-indigo-100">
                    {type.theme_sentence}
                  </p>
                </div>

                {/* 카드 내용 */}
                <div className="p-6 space-y-6">
                  {/* 설명 포인트 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <Star className="w-5 h-5 text-yellow-500 mr-2" />
                      주요 특징
                    </h3>
                    <ul className="space-y-2">
                      {type.description_points.map((point) => (
                        <li key={point} className="flex items-start">
                          <span className="inline-block w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 강점 키워드 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      💪 강점
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {type.strength_keywords.map((keyword) => (
                        <span 
                          key={keyword}
                          className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          #{keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 약점/개선점 키워드 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      🔧 개선할 점
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {type.weakness_keywords.map((keyword) => (
                        <span 
                          key={keyword}
                          className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          #{keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 공유 기능 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              결과를 공유해보세요!
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={handleKakaoShare}
                disabled={!kakaoReady}
                className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  kakaoReady
                    ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-800'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Share2 className="w-5 h-5 mr-2" />
                카카오톡으로 공유
              </button>
              
              <button
                type="button"
                onClick={handleCopyUrl}
                className="flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all duration-200"
              >
                {copySuccess ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    복사 완료!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5 mr-2" />
                    URL 복사하기
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 추가 정보 링크 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              내게 맞는 전공과 직업을 더 자세히 알고 싶다면?
            </h3>
            <p className="text-gray-600 mb-4">
              전문적인 진로 적성 검사를 받아보세요
            </p>
            <a
              href="https://www.careerapt.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              한국진로적성센터 바로가기
            </a>
          </div>

          {/* 로고 영역 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="space-y-4">
              <div>
                <div className="w-32 h-16 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">옥타그노시스 로고</span>
                </div>
                <p className="text-sm text-gray-600">옥타그노시스 검사</p>
              </div>
              
              <div>
                <button
                  type="button"
                  className="inline-block"
                  onClick={() => {
                    alert('회사 홈페이지 링크를 설정해주세요.');
                  }}
                >
                  <div className="w-32 h-16 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center hover:bg-gray-300 transition-colors">
                    <span className="text-gray-500 text-sm">회사 로고</span>
                  </div>
                  <p className="text-sm text-gray-600 hover:text-gray-800">회사 홈페이지 바로가기</p>
                </button>
              </div>
            </div>
          </div>

          {/* 새로운 검사 시작 버튼 */}
          <div className="text-center mt-8">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              새로운 검사 시작하기
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 