'use client';

type ETagCache = {
  [url: string]: string;
};

let etags: ETagCache = {};

const initETagCache = () => {
  if (typeof window !== 'undefined') {
    try {
      const savedETags = localStorage.getItem('etags');
      if (savedETags) {
        etags = JSON.parse(savedETags);
      }
    } catch (e) {
      console.warn('ETagの復元に失敗しました', e);
      etags = {};
    }
  }
};

const saveETags = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('etags', JSON.stringify(etags));
    } catch (e) {
      console.warn('ETagの保存に失敗しました', e);
    }
  }
};

initETagCache();

const fetchWithETag = async <T>(url: string): Promise<T> => {
  if (typeof window === 'undefined') {
    const response = await fetch(url);
    return await response.json() as T;
  }

  const headers: HeadersInit = {
    'Accept': 'application/json'
  };

  console.log(etags)

  if (etags[url]) {
    headers['If-None-Match'] = etags[url];
  }

  const startTime = performance.now();

  try {
    const response = await fetch(url, {
      headers,
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    const etag = response.headers.get('ETag');
    console.log(etag)
    if (etag) {
      etags[url] = etag;
      saveETags();
    }

    // 304 Not Modifiedの場合は、sessionStorageからデータを取得
    if (response.status === 304) {
      console.info(`[304] キャッシュからデータを使用: ${url}`);

      const cachedData = sessionStorage.getItem(`data:${url}`);
      if (cachedData) {
        try {
          const data = JSON.parse(cachedData) as T;

          const endTime = performance.now();
          console.info(`キャッシュヒット - 処理時間: ${(endTime - startTime).toFixed(2)}ms`);

          return data;
        } catch (e) {
          console.warn('キャッシュデータの解析に失敗しました', e);
        }
      }
    }

    const data = await response.json() as T;

    try {
      sessionStorage.setItem(`data:${url}`, JSON.stringify(data));
    } catch (e) {
      console.warn('sessionStorageへの保存に失敗しました', e);
    }

    const endTime = performance.now();
    console.info(`新規取得 - 処理時間: ${(endTime - startTime).toFixed(2)}ms`);

    return data;
  } catch (error) {
    console.error('データ取得エラー:', error);

    const cachedData = sessionStorage.getItem(`data:${url}`);
    if (cachedData) {
      try {
        console.info(`エラー発生時にキャッシュからリカバリー: ${url}`);
        return JSON.parse(cachedData) as T;
      } catch (e) {
        console.error('キャッシュからのリカバリーに失敗しました', e);
      }
    }

    throw error;
  }
};

export default fetchWithETag;