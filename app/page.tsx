'use client';

import { useState } from 'react';

export default function Home() {
  const [managementFee, setManagementFee] = useState('');
  const [reserveFund, setReserveFund] = useState('');
  const [settlementDate, setSettlementDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [results, setResults] = useState<{
    sellerBurden: { days: number; managementFee: number; reserveFund: number; total: number };
    buyerBurden: { days: number; managementFee: number; reserveFund: number; total: number };
  } | null>(null);

  const calculateProration = () => {
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
    const monthlyManagementFee = parseFloat(managementFee) || 0;
    const monthlyReserveFund = parseFloat(reserveFund) || 0;
    
    const dailyManagementFee = monthlyManagementFee / daysInMonth;
    const dailyReserveFund = monthlyReserveFund / daysInMonth;
    
    // 売主負担額
    const sellerManagementFee = Math.round(dailyManagementFee * sellerDays);
    const sellerReserveFund = Math.round(dailyReserveFund * sellerDays);
    
    // 買主負担額
    const buyerManagementFee = Math.round(dailyManagementFee * buyerDays);
    const buyerReserveFund = Math.round(dailyReserveFund * buyerDays);
    
    setResults({
      sellerBurden: {
        days: sellerDays,
        managementFee: sellerManagementFee,
        reserveFund: sellerReserveFund,
        total: sellerManagementFee + sellerReserveFund
      },
      buyerBurden: {
        days: buyerDays,
        managementFee: buyerManagementFee,
        reserveFund: buyerReserveFund,
        total: buyerManagementFee + buyerReserveFund
      }
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 text-center mt-8 mb-8">
          不動産管理費・積立金 日割り計算
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">入力情報</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="managementFee" className="block text-sm font-medium text-gray-600 mb-1">
                管理費（月額）
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">¥</span>
                <input
                  type="number"
                  id="managementFee"
                  value={managementFee}
                  onChange={(e) => setManagementFee(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10,000"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="reserveFund" className="block text-sm font-medium text-gray-600 mb-1">
                修繕積立金（月額）
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">¥</span>
                <input
                  type="number"
                  id="reserveFund"
                  value={reserveFund}
                  onChange={(e) => setReserveFund(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="15,000"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="settlementDate" className="block text-sm font-medium text-gray-600 mb-1">
                決済日
              </label>
              <input
                type="date"
                id="settlementDate"
                value={settlementDate}
                onChange={(e) => setSettlementDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={calculateProration}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 font-medium"
            >
              計算する
            </button>
          </div>
        </div>
        
        {results && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              計算結果（{formatDate(settlementDate)}決済）
            </h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="text-lg font-semibold text-red-600 mb-2">
                  売主負担分（{results.sellerBurden.days}日分）
                </h3>
                <div className="space-y-1 text-gray-700">
                  <p>管理費: {formatCurrency(results.sellerBurden.managementFee)}</p>
                  <p>修繕積立金: {formatCurrency(results.sellerBurden.reserveFund)}</p>
                  <p className="font-semibold text-lg pt-2 border-t">
                    合計: {formatCurrency(results.sellerBurden.total)}
                  </p>
                </div>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-lg font-semibold text-green-600 mb-2">
                  買主負担分（{results.buyerBurden.days}日分）
                </h3>
                <div className="space-y-1 text-gray-700">
                  <p>管理費: {formatCurrency(results.buyerBurden.managementFee)}</p>
                  <p>修繕積立金: {formatCurrency(results.buyerBurden.reserveFund)}</p>
                  <p className="font-semibold text-lg pt-2 border-t">
                    合計: {formatCurrency(results.buyerBurden.total)}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  ※ 日割り計算は1円未満を四捨五入しています
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
