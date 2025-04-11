"use client";

import { useEffect, useState } from "react";
import { Product } from "@/app/types/product";

const CACHE_KEY = "last-modified-products";

export default function LastModified() {
  const [products, setProducts] = useState<Product[]>([]);

  const getLastModified = () => {
    return sessionStorage.getItem(`${CACHE_KEY}:lastModified`) || null;
  };

  const saveLastModified = (value: string) => {
    sessionStorage.setItem(`${CACHE_KEY}:lastModified`, value);
  };

  useEffect(() => {
    fetchDataWithLastModified();
  }, []);

  const fetchDataWithLastModified = async (forceRefresh = false) => {
    try {
      const headers: HeadersInit = {
        Accept: "application/json",
      };

      if (!forceRefresh) {
        const lastModified = getLastModified();

        if (lastModified) {
          headers["If-Modified-Since"] = lastModified;
        }
      }

      const response = await fetch("http://localhost:3001/api/products", {
        cache: forceRefresh ? "no-store" : "default",
        headers,
      });

      const lastModified = response.headers.get("Last-Modified");

      if (lastModified) {
        saveLastModified(lastModified);

        console.log(`Last-Modified: ${lastModified}`);
      }

      if (response.status === 304) {
        console.log("304 Not Modified - キャッシュが使われています");

        const cachedData = sessionStorage.getItem(CACHE_KEY);

        if (cachedData) {
          try {
            const data = JSON.parse(cachedData);

            setProducts(data);
          } catch (e) {
            console.error("キャッシュデータの解析に失敗しました", e);
          }
        }
      } else {
        const data = await response.json();

        setProducts(data);

        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));

          const now = new Date();
          sessionStorage.setItem(`${CACHE_KEY}:timestamp`, now.toISOString());

          if (lastModified) {
            sessionStorage.setItem(`${CACHE_KEY}:lastModified`, lastModified);
          }
        } catch (e) {
          console.warn("sessionStorageへの保存に失敗しました", e);
        }
      }
    } catch (e) {
      console.error("データ取得エラー:", e);
    }
  };

  return (
    <main className="flex flex-col items-center justify-start min-h-screen p-8 bg-gray-50">
      <div className="w-full max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold">商品一覧</h1>

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
      </div>
    </main>
  );
}
