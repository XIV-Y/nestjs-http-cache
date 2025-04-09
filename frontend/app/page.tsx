"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Product } from "@/app/types/product";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const {
    data: products,
    error,
    isLoading: isSWRLoading,
  } = useSWR<Product[]>("http://localhost:3001/api/products");

  // 手動で再フェッチ（キャッシュを無視）
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await mutate("http://localhost:3001/api/products", undefined, {
        revalidate: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-start min-h-screen p-8 bg-gray-50">
      <div className="w-full max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold">商品一覧</h1>

        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className={`px-4 py-2 rounded font-medium text-white transition-colors ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "読み込み中..." : "再読み込み"}
          </button>
          <div className="text-sm">
            {error ? (
              <span className="text-red-600">エラーが発生しました</span>
            ) : isSWRLoading ? (
              <span className="text-gray-600">読み込み中...</span>
            ) : (
              <span className="text-green-600">
                データ取得完了 ({products?.length || 0}件)
              </span>
            )}
          </div>
        </div>

        {products && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 hover:-translate-y-1 duration-200"
              >
                <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                <p className="text-2xl font-bold text-blue-600 mb-2">
                  ¥{product.price.toLocaleString()}
                </p>
                <p className="mb-4 text-gray-700">{product.description}</p>
                <div className="flex justify-between text-xs text-gray-500 mt-4">
                  <span>在庫: {product.stock}個</span>
                  <span>
                    更新: {new Date(product.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 p-6 bg-white rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">ETagキャッシュの仕組み</h2>
          <div className="space-y-4">
            <div className="flex">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 font-bold rounded-full flex items-center justify-center mr-3">
                1
              </div>
              <p className="text-gray-700">
                ブラウザがサーバーにリクエストを送信し、サーバーはレスポンスと共に
                <code className="px-1 py-0.5 rounded bg-gray-100 text-red-600">
                  ETag
                </code>
                ヘッダーを返します。
              </p>
            </div>
            <div className="flex">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 font-bold rounded-full flex items-center justify-center mr-3">
                2
              </div>
              <p className="text-gray-700">
                次回のリクエスト時、ブラウザは前回のETagを
                <code className="px-1 py-0.5 rounded bg-gray-100 text-red-600">
                  If-None-Match
                </code>
                ヘッダーとして送信します。
              </p>
            </div>
            <div className="flex">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 font-bold rounded-full flex items-center justify-center mr-3">
                3
              </div>
              <p className="text-gray-700">
                データが変更されていない場合、サーバーは
                <code className="px-1 py-0.5 rounded bg-gray-100 text-red-600">
                  304 Not Modified
                </code>
                を返し、ブラウザはキャッシュを使用します。
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
