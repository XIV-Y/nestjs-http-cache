import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class LastModifiedInterceptor implements NestInterceptor {
  private readonly ONE_MINUTE_MS = 60 * 1000;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse<Response>();

    // レスポンスがすでに送信されているかをチェックするフラグ
    let responseHandled = false;

    return next.handle().pipe(
      map(responseBody => {
        if (responseHandled || !responseBody) {
          return responseBody;
        }

        try {
          const now = new Date();

          response.setHeader('Cache-Control', 'public, max-age=60');
          response.setHeader('Last-Modified', now.toUTCString());

          const ifModifiedSince = request.headers['if-modified-since'];

          if (ifModifiedSince) {
            try {
              const ifModifiedSinceDate = new Date(ifModifiedSince);

              const timeSinceLastRequest = now.getTime() - ifModifiedSinceDate.getTime();

              if (timeSinceLastRequest < this.ONE_MINUTE_MS) {
                console.log('最後のリクエストから1分経過していません: 304レスポンス');

                response.status(304);
                responseHandled = true;
                return null;
              } else {
                console.log('最後のリクエストから1分以上経過: 新しいデータを返します');
              }
            } catch (e) {
              console.error('日付解析エラー:', e);
            }
          }

          return responseBody;
        } catch (e) {
          console.error('Last-Modified処理中にエラーが発生:', e);

          return responseBody;
        }
      })
    )
  }
}