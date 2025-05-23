import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* 메인 제목 */}
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
          나를 찾아줘!!
        </h1>
        
        {/* 설명 문구 */}
        <p className="text-lg md:text-xl text-gray-600 leading-relaxed px-4">
          10만 1천 4백명의 성공을 만든 옥타그노시스 검사의<br />
          <span className="font-semibold text-indigo-700">'나를 찾아줘!'</span> 버전을 지금 시작하세요!
        </p>
        
        {/* 시작 버튼 */}
        <div className="pt-8">
          <Link 
            href="/start"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xl px-12 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            [ 시작 ]
          </Link>
        </div>
        
        {/* 주의 문구 */}
        <div className="pt-12">
          <p className="text-sm text-gray-500 leading-relaxed max-w-lg mx-auto">
            * 본 무료테스트는 옥타그노시스 검사의 축약본으로, 실제 검사와 결과가 다를 수 있습니다. 
            정확한 진단을 위해서는 전문 검사를 받으시기 바랍니다.
          </p>
        </div>
      </div>
      
      {/* 배경 장식 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-200 rounded-full opacity-20"></div>
        <div className="absolute top-1/4 -left-8 w-16 h-16 bg-blue-200 rounded-full opacity-30"></div>
        <div className="absolute bottom-1/4 -right-12 w-20 h-20 bg-purple-200 rounded-full opacity-25"></div>
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-indigo-100 rounded-full opacity-40"></div>
      </div>
    </div>
  );
}
