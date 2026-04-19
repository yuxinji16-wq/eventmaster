import { expect, test } from '@playwright/test';

function json(route: any, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', async route => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();

    if (path.endsWith('/api/auth/login') && method === 'POST') {
      return json(route, {
        access_token: 'test-token',
        token_type: 'bearer',
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          is_active: true,
          is_superadmin: true,
          role_id: null,
        },
      });
    }

    if (path.endsWith('/api/auth/me') && method === 'GET') {
      return json(route, {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        is_active: true,
        is_superadmin: true,
        role_id: null,
        created_at: '2026-01-01T00:00:00Z',
      });
    }

    if (path.endsWith('/api/users/permissions/me') && method === 'GET') {
      return json(route, {
        user_id: 1,
        username: 'admin',
        role_id: null,
        role_name: null,
        is_superadmin: true,
        permissions: {},
      });
    }

    if (path.endsWith('/api/dashboard/stats') && method === 'GET') {
      return json(route, {
        budget: { total: 120, utilization_rate: 75 },
        opportunities: { total_value: 560000 },
        activities: { total: 4, completed: 2, ongoing: 1, by_status: { 待启动: 1 } },
        monthly: {
          '2026-01': { budget: 18, count: 2 },
          '2026-02': { budget: 26, count: 3 },
        },
      });
    }

    if (path.endsWith('/api/activities') && method === 'GET') {
      return json(route, [
        {
          id: 101,
          name: '华东路演',
          date: '2026-02-10',
          year: '2026',
          location: '上海',
          type: 'Conference',
          category: '自办活动',
          industry: '电子信息',
          budget: 80,
          actual_spend: 42,
          leads: 26,
          status: '进行中',
          description: '重点客户线下活动',
          created_at: '2026-02-01T00:00:00Z',
          updated_at: '2026-02-01T00:00:00Z',
        },
      ]);
    }

    if (path.endsWith('/api/materials') && method === 'GET') {
      return json(route, [
        {
          id: 201,
          name: '品牌宣传册',
          category: '产品宣传册',
          type: '常规',
          stock: 120,
          unit: '本',
          status: 'In Stock',
          usage_count: 30,
          last_updated: '2026-02-12T10:00:00Z',
          created_at: '2026-02-01T00:00:00Z',
        },
      ]);
    }

    if (path.endsWith('/api/suppliers') && method === 'GET') {
      return json(route, [
        {
          id: 301,
          name: '星云会展',
          category: '搭建',
          rating: 4.8,
          contact: '张伟',
          phone: '13800000000',
          email: 'zhangwei@example.com',
          address: '上海市',
          bank_name: '招商银行',
          bank_account: '6222000000000000',
          last_used: '2026-02-15',
          order_count: 8,
          tags: ['响应快'],
          created_at: '2026-02-01T00:00:00Z',
          updated_at: '2026-02-01T00:00:00Z',
        },
      ]);
    }

    if (path.endsWith('/api/opportunities') && method === 'GET') {
      return json(route, [
        {
          id: 401,
          client_name: '星河科技',
          company: '星河科技',
          contact: '李明',
          phone: '13900000000',
          email: 'liming@example.com',
          requirement: '品牌发布会策划',
          contact_person: '李明',
          estimated_value: 300000,
          status: '潜在客户',
          create_date: '2026-02-16',
          source_type: 'manual',
          source_name: '自主录入',
          region: '华东',
          owner: '王磊',
          notes: '',
          created_at: '2026-02-16T00:00:00Z',
          updated_at: '2026-02-16T00:00:00Z',
        },
      ]);
    }

    return json(route, { message: `Unhandled mock route: ${method} ${path}` }, 404);
  });
});

test('登录并访问核心业务页面', async ({ page }) => {
  await page.goto('/login');

  await page.getByPlaceholder('请输入用户名').fill('admin');
  await page.getByPlaceholder('请输入密码').fill('admin123');
  await page.getByRole('button', { name: '登录' }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText('数据统计周期')).toBeVisible();

  await page.getByRole('button', { name: '活动管理' }).click();
  await expect(page.getByText('创建新活动')).toBeVisible();

  await page.getByRole('button', { name: '物料仓库' }).click();
  await expect(page.getByText('资产入库登记')).toBeVisible();

  await page.getByRole('button', { name: '供应商库' }).click();
  await expect(page.getByText('录入新供应商')).toBeVisible();

  await page.getByRole('button', { name: '商机转化' }).click();
  await expect(page.getByText('活动线索')).toBeVisible();
});
