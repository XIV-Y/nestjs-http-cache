import { Injectable } from '@nestjs/common';

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string;
  updatedAt: string;
}

@Injectable()
export class ProductsService {
  findAll(): Product[] {
    return this.products;
  }

  private products: Product[] = [
    {
      id: 1,
      name: '高品質ノートパソコン',
      price: 120000,
      stock: 15,
      description: 'ビジネス利用に最適な高性能ノートパソコン',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'ワイヤレスイヤホン',
      price: 15000,
      stock: 42,
      description: 'ノイズキャンセリング機能搭載の高音質イヤホン',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 3,
      name: 'スマートウォッチ',
      price: 25000,
      stock: 28,
      description: '健康管理と通知機能を備えた最新スマートウォッチ',
      updatedAt: new Date().toISOString(),
    },
  ];
}
