import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class ClientCacheInterceptor implements NestInterceptor {
  constructor(private readonly ttl: number = 60) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      tap(() => {
        if (request.method !== 'GET' || request.headers.authorization) {
          response.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
          response.setHeader('Pragma', 'no-cache');
          response.setHeader('Expires', '0');
        } else {
          // 公開キャッシュを有効にする（デフォルトTTL: 60秒）
          response.setHeader('Cache-Control', `public, max-age=${this.ttl}`);

          // Last-Modifiedと現在時刻の設定
          response.setHeader('Last-Modified', new Date().toUTCString());
        }
      })
    )
  }
}