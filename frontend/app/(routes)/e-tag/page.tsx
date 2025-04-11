"use client";

import { useEffect, useState } from "react";
import { Product } from "@/app/types/product";
import fetchWithETag from "@/app/utils/fetch-with-etag";

export default function ETag() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const handleRefresh = async () => {
      try {
        const data = await fetchWithETag<Product[]>(
          "http://localhost:3001/api/products"
        );

        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    handleRefresh();
  }, []);

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
