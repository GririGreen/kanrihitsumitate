'use client';

import { useState, useEffect } from 'react';

// 費用種別の設定 - ここに新しい項目を追加するだけでOK
const FEE_TYPES = [
  {
    value: '管理費積立金',
    label: '管理費積立金',
    inputLabel: '管理費・修繕積立金の合計（月額）'
  },
  {
    value: '賃料等清算金',
    label: '賃料等清算金',
    inputLabel: '賃料等の合計（月額）'
  },
  // 新しい項目を追加する場合は、ここに同じ形式で追加
  // 例:
  // {
  //   value: '駐車場代',
  //   label: '駐車場代',
  //   inputLabel: '駐車場代（月額）'
  // },
] as const;

type FeeType = typeof FEE_TYPES[number]['value'];

export default function Home() {
  const [totalAmount, setTotalAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [settlementDate, setSettlementDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [feeType, setFeeType] = useState<FeeType>(FEE_TYPES[0].value);
  const [results, setResults] = useState<{
    sellerBurden: { days: number; amount: number };
    buyerBurden: { days: number; amount: number };
    daysInMonth: number;
  } | null>(null);

  // 数値入力時の処理
  const handleAmountChange = (value: string) => {
    // カンマを除去して数値のみにする
    const numericValue = value.replace(/,/g, '');
    // 数値のみ許可
    if (/^\d*$/.test(numericValue)) {
      setTotalAmount(numericValue);
      setDisplayAmount(numericValue);
    }
  };

  // フォーカスが外れた時にカンマを追加
  const handleBlur = () => {
    if (totalAmount) {
      const formatted = parseInt(totalAmount).toLocaleString('ja-JP');
      setDisplayAmount(formatted);
    }
  };

  // フォーカス時にカンマを除去
  const handleFocus = () => {
    setDisplayAmount(totalAmount);
  };

  // 日割り計算（入力値が変更されるたびに自動実行）
  useEffect(() => {
    if (!totalAmount || !settlementDate) {
      setResults(null);
      return;
    }

    const date = new Date(settlementDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    // 月の日数を取得
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // 売主負担日数（1日から決済日前日まで）
    const sellerDays = day - 1;
    
    // 買主負担日数（決済日から月末まで）
    const buyerDays = daysInMonth - day + 1;
    
    // 月額を日割り
    const monthlyAmount = parseFloat(totalAmount) || 0;
    const dailyAmount = monthlyAmount / daysInMonth;
    
    // 売主負担額
    const sellerAmount = Math.round(dailyAmount * sellerDays);
    
    // 買主負担額
    const buyerAmount = Math.round(dailyAmount * buyerDays);
    
    setResults({
      sellerBurden: {
        days: sellerDays,
        amount: sellerAmount
      },
      buyerBurden: {
        days: buyerDays,
        amount: buyerAmount
      },
      daysInMonth: daysInMonth
    });
  }, [totalAmount, settlementDate]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // 負担割合の計算
  const getPercentage = (days: number, totalDays: number) => {
    return (days / totalDays) * 100;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-3xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mt-8 mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            日割り計算ツール
          </h1>
          <div className="mt-4">
            <select
              value={feeType}
              onChange={(e) => setFeeType(e.target.value as FeeType)}
              className="px-6 py-2 text-lg font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all hover:border-gray-300 cursor-pointer"
            >
              {FEE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* 入力セクション */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-8 border border-white/50">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">入力情報</h2>
          </div>
          
          <div className="space-y-6">
            {/* 決済日 */}
            <div className="group">
              <label htmlFor="settlementDate" className="block text-sm font-bold text-gray-700 mb-2 group-hover:text-indigo-600 transition-colors">
                📅 決済日
              </label>
              <input
                type="date"
                id="settlementDate"
                value={settlementDate}
                onChange={(e) => setSettlementDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 text-lg font-medium transition-all hover:border-gray-300"
              />
            </div>
            
            {/* 金額入力 */}
            <div className="group">
              <label htmlFor="totalAmount" className="block text-sm font-bold text-gray-700 mb-2 group-hover:text-indigo-600 transition-colors">
                💴 {FEE_TYPES.find(type => type.value === feeType)?.inputLabel || '金額（月額）'}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl font-bold">¥</span>
                <input
                  type="text"
                  id="totalAmount"
                  value={displayAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  onBlur={handleBlur}
                  onFocus={handleFocus}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 text-lg font-medium transition-all hover:border-gray-300"
                  placeholder="25,000"
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* 結果セクション */}
        {results && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/50 animate-fade-in">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                計算結果
                <span className="text-sm font-normal text-gray-600 ml-2">（{formatDate(settlementDate)}決済）</span>
              </h2>
            </div>
            
            <div className="space-y-8">
              {/* ビジュアルグラフ */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-sm font-bold text-gray-700 mb-4">負担割合</h3>
                <div className="relative">
                  <div className="flex h-16 w-full rounded-xl overflow-hidden shadow-lg">
                    <div 
                      className="bg-gradient-to-r from-red-400 to-red-600 flex items-center justify-center text-white font-bold transition-all duration-500 ease-out"
                      style={{ width: `${getPercentage(results.sellerBurden.days, results.daysInMonth)}%` }}
                    >
                      {results.sellerBurden.days > 0 && (
                        <span className="text-sm drop-shadow">
                          {results.sellerBurden.days}日
                        </span>
                      )}
                    </div>
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold transition-all duration-500 ease-out"
                      style={{ width: `${getPercentage(results.buyerBurden.days, results.daysInMonth)}%` }}
                    >
                      {results.buyerBurden.days > 0 && (
                        <span className="text-sm drop-shadow">
                          {results.buyerBurden.days}日
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between mt-3 text-xs font-medium text-gray-600">
                    <span>1日</span>
                    <span className="font-bold text-indigo-600">
                      {new Date(settlementDate).getDate()}日（決済日）
                    </span>
                    <span>{results.daysInMonth}日</span>
                  </div>
                </div>
              </div>

              {/* 金額詳細 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 売主負担 */}
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-100">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <h3 className="text-lg font-bold text-red-700">売主負担分</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      期間: 1日〜{new Date(settlementDate).getDate() - 1}日
                      <span className="font-medium text-red-600 ml-1">（{results.sellerBurden.days}日間）</span>
                    </p>
                    <p className="text-3xl font-bold text-gray-800 mt-3">
                      {formatCurrency(results.sellerBurden.amount)}
                    </p>
                  </div>
                </div>
                
                {/* 買主負担 */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <h3 className="text-lg font-bold text-blue-700">買主負担分</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      期間: {new Date(settlementDate).getDate()}日〜{results.daysInMonth}日
                      <span className="font-medium text-blue-600 ml-1">（{results.buyerBurden.days}日間）</span>
                    </p>
                    <p className="text-3xl font-bold text-gray-800 mt-3">
                      {formatCurrency(results.buyerBurden.amount)}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* 注意事項 */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start">
                <svg className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-amber-800">
                  日割り計算は1円未満を四捨五入しています
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* フッター */}
        <div className="text-center mt-8 mb-4">
          <p className="text-sm text-gray-500">
            © 2024 日割り計算ツール
          </p>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </main>
  );
}
