import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  activitiesApi,
  materialsApi,
  opportunitiesApi,
  suppliersApi,
} from './backendApi';

function mockFetchResponse(data: unknown = []) {
  return {
    ok: true,
    json: vi.fn().mockResolvedValue(data),
  };
}

describe('backendApi 查询参数契约', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockFetchResponse()));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('activitiesApi.getList 将 search 映射为后端 keyword', async () => {
    await activitiesApi.getList({ year: '2026', status: '进行中', search: '发布会' });

    const [url] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toBe(
      'http://localhost:8001/api/activities?year=2026&status=%E8%BF%9B%E8%A1%8C%E4%B8%AD&keyword=%E5%8F%91%E5%B8%83%E4%BC%9A'
    );
  });

  it('activitiesApi.getList 返回后端数组契约', async () => {
    const activity = { id: 1, name: '测试活动' };
    vi.mocked(fetch).mockResolvedValueOnce(mockFetchResponse([activity]) as Response);

    const response = await activitiesApi.getList();

    expect(response).toEqual([activity]);
  });

  it('materialsApi.getList 将 search 映射为后端 keyword，并忽略空值', async () => {
    await materialsApi.getList({ category: '', search: '展架' });

    const [url] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toBe(
      'http://localhost:8001/api/materials?keyword=%E5%B1%95%E6%9E%B6'
    );
  });

  it('suppliersApi.getList 将 search 映射为后端 keyword', async () => {
    await suppliersApi.getList({ category: '搭建', search: '上海' });

    const [url] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toBe(
      'http://localhost:8001/api/suppliers?category=%E6%90%AD%E5%BB%BA&keyword=%E4%B8%8A%E6%B5%B7'
    );
  });

  it('opportunitiesApi.getList 将 stage/search 映射为后端 status/keyword', async () => {
    await opportunitiesApi.getList({ stage: '高意向', activity_id: 12, search: '华东' });

    const [url] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toBe(
      'http://localhost:8001/api/opportunities?status=%E9%AB%98%E6%84%8F%E5%90%91&activity_id=12&keyword=%E5%8D%8E%E4%B8%9C'
    );
  });

  it('无筛选条件时不生成尾随问号', async () => {
    await opportunitiesApi.getList();

    const [url] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toBe('http://localhost:8001/api/opportunities');
  });
});
