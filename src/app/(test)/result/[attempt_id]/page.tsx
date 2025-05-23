'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import Script from 'next/script';
import { 
  Share2, 
  CheckCircle, 
  Star, 
  AlertTriangle,
  ExternalLink,
  Loader2,
  RefreshCw,
  Award,
  Sparkles,
  Link as LinkIcon,
  Repeat,
  Info
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
    const errorData = await response.json().catch(() => ({ message: '결과를 불러오는데 실패했습니다.' }));
    throw new Error(errorData.message || '결과를 불러오는데 실패했습니다.');
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
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        // 3번 이상 재시도 방지
        if (retryCount >= 2) return
        // 5초 후 재시도
        setTimeout(() => revalidate({ retryCount }), 5000)
      }
    }
  );

  // 카카오 SDK 초기화
  useEffect(() => {
    const initKakao = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
        if (kakaoKey) {
          window.Kakao.init(kakaoKey);
          setKakaoReady(true);
        } else {
          console.warn("Kakao JavaScript Key가 설정되지 않았습니다.");
        }
      } else if (window.Kakao?.isInitialized?.()) {
        setKakaoReady(true);
      }
    };

    if (typeof window !== 'undefined' && window.Kakao) {
      initKakao();
    }
  }, []);

  // URL 복사 기능
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch (err) {
      console.error('URL 복사 실패:', err);
      alert('URL 복사에 실패했습니다. 수동으로 복사해주세요.');
    }
  };

  // 카카오톡 공유 기능
  const handleKakaoShare = () => {
    if (!kakaoReady || typeof window.Kakao === 'undefined' || !window.Kakao.Share) {
      alert('카카오톡 공유 기능을 사용할 수 없습니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    if (!data?.success || !data.data || data.data.personality_types.length === 0) {
      alert('공유할 결과 데이터가 없습니다.');
      return;
    }
    const firstType = data.data.personality_types[0];
    const currentUrl = window.location.href;
    const siteName = "옥타그노시스 AI 성향 검사";

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: `[${siteName}] 나의 성향 결과: ${firstType.type_name}`,
        description: firstType.theme_sentence,
        imageUrl: 'https://via.placeholder.com/400x300?text=Personality+Test',
        link: { mobileWebUrl: currentUrl, webUrl: currentUrl },
      },
      buttons: [
        { title: '내 결과 자세히 보기', link: { mobileWebUrl: currentUrl, webUrl: currentUrl } },
        { title: '나도 검사하러 가기', link: { mobileWebUrl: `${window.location.origin}/start`, webUrl: `${window.location.origin}/start` } }
      ],
    });
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={56} className="text-purple-400 animate-spin mx-auto mb-6" />
          <p className="text-slate-300 text-xl">결과를 분석 중입니다...</p>
          <p className="text-slate-400 text-sm">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || !data?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-6">
        <div className="max-w-lg mx-auto text-center bg-slate-800 bg-opacity-50 backdrop-blur-md rounded-xl shadow-2xl p-8 border border-slate-700">
          <AlertTriangle size={56} className="text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-red-300 mb-3">결과를 불러올 수 없습니다</h2>
          <p className="text-slate-400 mb-8">
            {error?.message || data?.message || '데이터를 가져오는 중 알 수 없는 오류가 발생했습니다. 네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.'}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              type="button"
              onClick={() => mutate()}
              className="flex items-center justify-center w-full sm:w-auto px-6 py-3 rounded-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-200 shadow-lg hover:shadow-purple-500/50"
            >
              <RefreshCw size={18} className="mr-2" />
              다시 시도
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex items-center justify-center w-full sm:w-auto px-6 py-3 rounded-lg font-semibold bg-slate-600 hover:bg-slate-700 text-slate-100 transition-colors duration-200 shadow-lg"
            >
              처음으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const resultData = data.data;
  if (!resultData || resultData.personality_types.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-6">
        <div className="max-w-lg mx-auto text-center bg-slate-800 bg-opacity-50 backdrop-blur-md rounded-xl shadow-2xl p-8 border border-slate-700">
          <Info size={56} className="text-blue-400 mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-slate-200 mb-3">결과 정보 없음</h2>
          <p className="text-slate-400 mb-8">
            검사 결과를 찾을 수 없습니다. 다시 검사를 진행해주세요.
          </p>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex items-center justify-center w-full sm:w-auto px-6 py-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 shadow-lg"
          >
            검사 시작하기
          </button>
        </div>
      </div>
    );
  }
  
  const { personality_types: personalityTypes, is_tie: isTie } = resultData;

  return (
    <>
      <Script
        src="https://developers.kakao.com/sdk/js/kakao.js"
        strategy="lazyOnload"
        onLoad={() => {
          const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
          if (typeof window.Kakao !== 'undefined' && kakaoKey && !window.Kakao.isInitialized()) {
            try {
              window.Kakao.init(kakaoKey);
              setKakaoReady(true);
            } catch (e) {
              console.error("Kakao SDK 초기화 실패:", e);
            }
          } else if (typeof window.Kakao !== 'undefined' && window.Kakao.isInitialized()) {
            setKakaoReady(true);
          }
        }}
        onError={(e) => {
          console.error('Kakao SDK 로드 실패:', e);
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 text-slate-200 overflow-hidden relative">
        {/* 배경 장식 */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-purple-700 rounded-full opacity-20 animate-pulse-slow filter blur-3xl" />
          <div className="absolute -bottom-1/4 -right-1/4 w-80 h-80 bg-indigo-600 rounded-full opacity-15 animate-pulse-slower filter blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <Sparkles size={48} className="text-purple-400 mx-auto mb-4 animate-pulse" />
            <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 mb-3 leading-tight">
              나를 찾았어!!
            </h1>
            <p className="text-lg md:text-xl text-slate-300">
              {isTie 
                ? `당신에게서 ${personalityTypes.length}개의 강력한 성향이 동점으로 나타났습니다!`
                : '당신의 핵심 성향을 발견했습니다!'
              }
            </p>
          </div>

          <div className="space-y-10 mb-12">
            {personalityTypes.map((type, index) => (
              <div key={type.id} className="bg-slate-800 bg-opacity-70 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
                <div className="bg-gradient-to-r from-purple-700 via-pink-600 to-indigo-700 p-6 md:p-8 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                      {isTie ? `결과 ${index + 1}` : '나의 성향'}
                    </span>
                    <span className="text-lg font-bold bg-white/20 px-4 py-1.5 rounded-full flex items-center">
                      <Award size={18} className="mr-2 opacity-80" />
                      {type.calculated_score}점
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-2 leading-tight">
                    {type.title}
                  </h2>
                  <p className="text-xl md:text-2xl font-medium text-purple-200 italic">
                    &ldquo;{type.theme_sentence}&rdquo;
                  </p>
                </div>

                <div className="p-6 md:p-8 space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-100 mb-4 flex items-center">
                      <Star size={20} className="text-yellow-400 mr-2.5" />
                      주요 특징
                    </h3>
                    <ul className="space-y-3 text-slate-300 pl-1">
                      {type.description_points.map((point, i) => (
                        <li key={`description-${type.id}-${i}`} className="flex items-start">
                          <span className="inline-block w-1.5 h-1.5 bg-purple-400 rounded-full mt-[9px] mr-3 flex-shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-slate-100 mb-4">
                      💪 당신의 강점
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {type.strength_keywords.map((keyword) => (
                        <span key={keyword} className="bg-green-500/20 text-green-300 px-3.5 py-1.5 rounded-full text-sm font-medium border border-green-500/30">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-slate-100 mb-4">
                      🔧 성장 포인트
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {type.weakness_keywords.map((keyword) => (
                        <span key={keyword} className="bg-orange-500/20 text-orange-300 px-3.5 py-1.5 rounded-full text-sm font-medium border border-orange-500/30">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-800 bg-opacity-70 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 mb-10 border border-slate-700">
            <h3 className="text-xl font-semibold text-slate-100 mb-6 text-center">
              결과를 친구들과 공유해보세요!
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={handleKakaoShare}
                disabled={!kakaoReady || isLoading}
                className={`w-full sm:w-auto flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 ${
                  kakaoReady ? 'bg-[#FEE500] hover:bg-[#FADA0A] text-gray-800 shadow-lg' : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Share2 size={20} className="mr-2" />
                카카오톡 공유
              </button>
              
              <button
                type="button"
                onClick={handleCopyUrl}
                disabled={isLoading}
                className="w-full sm:w-auto flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
              >
                {copySuccess ? (
                  <> <CheckCircle size={20} className="mr-2 text-green-300" /> 복사 완료! </>
                ) : (
                  <> <LinkIcon size={20} className="mr-2" /> URL 복사하기 </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-slate-800 bg-opacity-70 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 mb-10 text-center border border-slate-700">
            <h3 className="text-xl font-semibold text-slate-100 mb-3">
              더 자세한 진로 탐색을 원하시나요?
            </h3>
            <p className="text-slate-400 mb-6">
              옥타그노시스 전문 검사를 통해 심층적인 분석과 맞춤형 가이드를 받아보세요.
            </p>
            <a
              href="https://www.careerapt.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-3.5 bg-transparent hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 border-2 border-purple-500 rounded-xl font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            >
              <ExternalLink size={20} className="mr-2.5" />
              한국진로적성센터 바로가기
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
            <div className="bg-slate-800 bg-opacity-50 backdrop-blur-sm rounded-xl p-6 text-center border border-slate-700">
              <div className="w-24 h-12 bg-slate-700 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <span className="text-slate-400 text-xs">옥타그노시스 로고</span>
              </div>
              <p className="text-sm text-slate-400">옥타그노시스 성향 분석</p>
            </div>
            <div className="bg-slate-800 bg-opacity-50 backdrop-blur-sm rounded-xl p-6 text-center border border-slate-700">
              <button type="button" className="inline-block w-full h-full" onClick={() => alert('회사 홈페이지 링크를 설정해주세요.')}>
                <div className="w-24 h-12 bg-slate-700 rounded-lg mx-auto mb-3 flex items-center justify-center group-hover:bg-slate-600 transition-colors">
                  <span className="text-slate-400 text-xs">회사 로고</span>
                </div>
                <p className="text-sm text-slate-400 group-hover:text-slate-200">회사 홈페이지</p>
              </button>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              type="button"
              onClick={() => router.push('/start')}
              className="group inline-flex items-center justify-center px-10 py-4 bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 hover:from-purple-700 hover:via-pink-600 hover:to-indigo-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-xl hover:shadow-purple-500/40 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50"
            >
              <Repeat size={22} className="mr-2.5 transition-transform duration-500 group-hover:rotate-180" />
              새로운 검사 시작하기
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 