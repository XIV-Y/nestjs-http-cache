import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class ETagInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((responseBody) => {
        const response = context.switchToHttp().getResponse<Response>();
        const request = context.switchToHttp().getRequest();

        const etag = this.generateETag(responseBody);

        response.setHeader('Cache-Control', 'public, max-age=60');
        response.setHeader('ETag', etag);

        const ifNoneMatch = request.headers['if-none-match'];

        if (ifNoneMatch && this.compareETag(ifNoneMatch, etag)) {
          response.status(304);

          return null;
        }

        return responseBody;
      }),
    );
  }

  private generateETag(data: unknown): string {
    try {
      const jsonStr = typeof data === 'object' ? JSON.stringify(data) : String(data);
      const hash = crypto.createHash('md5').update(jsonStr).digest('hex');

      return `W/"${hash}"`;
    } catch (error) {
      console.error('ETag生成エラー:', error);

      return `W/"fallback-${Date.now()}"`;
    }
  }

  private compareETag(clientETag: string, serverETag: string): boolean {
    // 引用符や余分なスペースを削除して比較
    const normalizeETag = (etag: string) => etag.replace(/^W\//, '').replace(/"/g, '').trim();

    return normalizeETag(clientETag) === normalizeETag(serverETag);
  }
}
