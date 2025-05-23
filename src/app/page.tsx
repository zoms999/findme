import Link from "next/link";
import { Sparkles, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center px-4 py-12 overflow-hidden relative">
      {/* 배경 장식 - 동적이고 세련되게 */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-purple-700 rounded-full opacity-30 animate-pulse-slow filter blur-3xl" />
          <div className="absolute -bottom-1/4 -right-1/4 w-80 h-80 bg-indigo-600 rounded-full opacity-25 animate-pulse-slower filter blur-3xl" />
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-pink-600 rounded-full opacity-20 animate-pulse-even-slower filter blur-3xl" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto text-center space-y-10 relative z-10">
        {/* 로고 아이콘 */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-slate-800 bg-opacity-50 backdrop-blur-sm rounded-xl border border-slate-700 shadow-lg">
            <Sparkles size={48} className="text-purple-400" />
          </div>
        </div>

        {/* 메인 제목 */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 leading-tight">
          나를 찾아줘!!
        </h1>
        
        {/* 설명 문구 */}
        <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-xl mx-auto">
          <span className="font-semibold text-purple-300">10만 1천 4백명</span>의 성공을 만든 옥타그노시스 검사,
          <br />
          그 핵심을 담은 <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">&apos;나를 찾아줘!&apos;</span> 버전을 지금 시작하세요!
        </p>
        
        {/* 시작 버튼 */}
        <div className="pt-8">
          <Link 
            href="/start"
            className="group inline-flex items-center justify-center bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 hover:from-purple-700 hover:via-pink-600 hover:to-indigo-700 text-white font-semibold text-xl px-10 py-4 rounded-xl shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50"
          >
            검사 시작하기
            <ChevronRight size={24} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
        
        {/* 주의 문구 */}
        <div className="pt-12">
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            * 본 무료 테스트는 옥타그노시스 검사의 축약본으로, 일부 성향만 나타날 수 있습니다.
            정확한 진단 및 상세 결과는 정식 검사를 통해 확인하시기 바랍니다.
          </p>
        </div>
      </div>
      
      {/* 하단 그라데이션 페이드 아웃 효과 */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
    </div>
  );
}
