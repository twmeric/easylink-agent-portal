/**
 * Easylink API - Multi-Tenant Payment Gateway
 * Version: 4.0 - Multi-Tenant Architecture
 */

const EASYLINK_BASE_URL = 'https://api-pay.gnete.com.hk';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    
    // CORS处理
    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = [
      'https://king-chicken.jkdcoding.com',
      'https://dummy.jkdcoding.com',
      'http://localhost:5173',
      'http://localhost:3000'
    ];
    const isAllowed = allowedOrigins.some(o => 
      origin === o || origin.includes('jkdcoding.com') || origin.includes('pages.dev')
    );
    
    if (method === 'OPTIONS') {
      return corsResponse(origin, isAllowed);
    }

    try {
      // ===== 路由分发 =====
      
      // 1. 客户端API: /api/v1/client/{client-code}/*
      const clientMatch = path.match(/^\/api\/v1\/client\/([^\/]+)(\/.*)?$/);
      if (clientMatch) {
        const clientCode = clientMatch[1];
        const subPath = clientMatch[2] || '/';
        return await handleClientAPI(request, env, clientCode, subPath, method, origin, isAllowed);
      }
      
      // 2. Admin API: /api/v1/admin/*
      if (path.startsWith('/api/v1/admin/')) {
        return await handleAdminAPI(request, env, path, method, origin, isAllowed);
      }
      
      // 3. 公共API: /api/v1/public/*
      if (path.startsWith('/api/v1/public/')) {
        return await handlePublicAPI(request, env, path, method, origin, isAllowed);
      }
      
      // 4. 认证API
      if (path.startsWith('/api/v1/auth/')) {
        return await handleAuthAPI(request, env, path, method, origin, isAllowed);
      }

      // 5. CloudWAPI 测试发送
      if (path === '/test/whatsapp' && method === 'POST') {
        return await handleTestWhatsApp(request, env, origin, isAllowed);
      }

      // 6. 健康检查
      if (path === '/health' && method === 'GET') {
        return jsonResponse({ 
          status: 'ok', 
          service: 'Easylink API',
          version: '4.0',
          features: ['multi-tenant', 'boss-report', 'whatsapp'],
          timestamp: Date.now()
        }, 200, origin, isAllowed);
      }

      return jsonResponse({ error: 'Not Found', path }, 404, origin, isAllowed);
      
    } catch (error) {
      console.error('[Worker] Error:', error);
      return jsonResponse({ 
        error: 'Internal Server Error',
        request_id: crypto.randomUUID()
      }, 500, origin, isAllowed);
    }
  },

  // Cron: Boss日报
  async scheduled(event, env, ctx) {
    console.log("[Cron] Boss report triggered at:", new Date().toISOString());
    
    try {
      const configs = await env.DB.prepare(
        `SELECT b.*, t.client_code, t.config_json 
         FROM boss_configs b 
         JOIN tenants t ON b.tenant_id = t.id 
         WHERE b.enabled = 1 AND t.is_active = 1`
      ).all();
      
      console.log(`[Cron] Found ${configs.results?.length || 0} active boss configs`);
      
      for (const config of configs.results || []) {
        try {
          await sendBossReport(env, config);
        } catch (err) {
          console.error(`[Cron] Failed to send report to ${config.client_code}:`, err);
        }
      }
    } catch (err) {
      console.error("[Cron] Error:", err);
    }
  }
};

// ===== 客户端API处理 =====
async function handleClientAPI(request, env, clientCode, subPath, method, origin, isAllowed) {
  // 验证租户存在
  const tenant = await env.DB.prepare(
    "SELECT * FROM tenants WHERE client_code = ? AND is_active = 1"
  ).bind(clientCode).first();
  
  if (!tenant) {
    return jsonResponse({ error: 'Client not found', code: clientCode }, 404, origin, isAllowed);
  }
  
  // 验证客户端认证（如有token）
  const authToken = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (authToken) {
    const session = await env.DB.prepare(
      "SELECT * FROM sessions WHERE token = ? AND tenant_id = ? AND expires_at > ?"
    ).bind(authToken, tenant.id, Date.now()).first();
    
    if (!session) {
      return jsonResponse({ error: 'Invalid or expired token' }, 401, origin, isAllowed);
    }
  }
  
  // 路由处理
  const route = `${method} ${subPath}`;
  
  switch (route) {
    case 'GET /dashboard':
      return await getDashboardData(env, tenant.id, origin, isAllowed);
    
    case 'GET /transactions':
      return await getTransactions(request, env, tenant.id, origin, isAllowed);
    
    case 'GET /boss-config':
      return await getBossConfig(env, tenant.id, origin, isAllowed);
    
    case 'PUT /boss-config':
      return await updateBossConfig(request, env, tenant.id, origin, isAllowed);
    
    case 'POST /boss-config/test':
      return await testBossReport(request, env, tenant.id, origin, isAllowed);
    
    case 'GET /boss-config/history':
      return await getBossReportHistory(env, tenant.id, origin, isAllowed);
    
    case 'GET /config':
      return jsonResponse({ 
        client_code: tenant.client_code,
        client_name: tenant.client_name,
        config: JSON.parse(tenant.config_json || '{}')
      }, 200, origin, isAllowed);
    
    default:
      return jsonResponse({ error: 'Endpoint not found', route }, 404, origin, isAllowed);
  }
}

// ===== Admin API处理 =====
async function handleAdminAPI(request, env, path, method, origin, isAllowed) {
  // 验证Admin认证
  const authResult = await checkAdminAuth(request, env);
  if (!authResult.valid) {
    return jsonResponse({ error: 'Unauthorized', message: authResult.error }, 401, origin, isAllowed);
  }
  
  const subPath = path.replace('/api/v1/admin/', '');
  
  // 租户管理
  if (subPath === 'tenants') {
    if (method === 'GET') {
      const tenants = await env.DB.prepare(
        "SELECT id, client_code, client_name, domain, is_active, created_at FROM tenants"
      ).all();
      return jsonResponse({ data: tenants.results }, 200, origin, isAllowed);
    }
    
    if (method === 'POST') {
      const body = await request.json();
      const { client_code, client_name, domain, config_json } = body;
      
      const apiKey = crypto.randomUUID().replace(/-/g, '');
      
      try {
        const result = await env.DB.prepare(
          `INSERT INTO tenants (client_code, client_name, domain, config_json, api_key) 
           VALUES (?, ?, ?, ?, ?)`
        ).bind(client_code, client_name, domain, JSON.stringify(config_json || {}), apiKey).run();
        
        return jsonResponse({ 
          success: true, 
          tenant_id: result.meta.last_row_id,
          api_key: apiKey
        }, 201, origin, isAllowed);
      } catch (err) {
        return jsonResponse({ error: 'Failed to create tenant', message: err.message }, 400, origin, isAllowed);
      }
    }
  }
  
  // 单租户详情
  const tenantMatch = subPath.match(/^tenants\/([^\/]+)$/);
  if (tenantMatch && method === 'GET') {
    const clientCode = tenantMatch[1];
    const tenant = await env.DB.prepare(
      "SELECT * FROM tenants WHERE client_code = ?"
    ).bind(clientCode).first();
    
    if (!tenant) {
      return jsonResponse({ error: 'Tenant not found' }, 404, origin, isAllowed);
    }
    
    // 获取统计
    const stats = await env.DB.prepare(
      `SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as success_count,
        SUM(amount) as total_amount
       FROM transactions WHERE tenant_id = ?`
    ).bind(tenant.id).first();
    
    return jsonResponse({ 
      tenant,
      stats
    }, 200, origin, isAllowed);
  }
  
  return jsonResponse({ error: 'Admin endpoint not found' }, 404, origin, isAllowed);
}

// ===== 公共API =====
async function handlePublicAPI(request, env, path, method, origin, isAllowed) {
  // 支付创建等公共接口
  const subPath = path.replace('/api/v1/public/', '');
  
  if (subPath === 'payment/create' && method === 'POST') {
    return await createPayment(request, env, origin, isAllowed);
  }
  
  if (subPath.startsWith('payment/query/') && method === 'GET') {
    const orderNo = subPath.split('/').pop();
    return await queryPayment(orderNo, env, origin, isAllowed);
  }
  
  return jsonResponse({ error: 'Public endpoint not found' }, 404, origin, isAllowed);
}

// ===== 认证API =====
async function handleAuthAPI(request, env, path, method, origin, isAllowed) {
  const subPath = path.replace('/api/v1/auth/', '');
  
  // Admin登录
  if (subPath === 'admin/login' && method === 'POST') {
    const body = await request.json();
    const { email, password } = body;
    
    const user = await env.DB.prepare(
      "SELECT * FROM admin_users WHERE email = ? AND password = ? AND is_active = 1"
    ).bind(email, password).first();
    
    if (!user) {
      return jsonResponse({ error: 'Invalid credentials' }, 401, origin, isAllowed);
    }
    
    const token = crypto.randomUUID();
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24小时
    
    await env.DB.prepare(
      "INSERT INTO sessions (token, user_type, user_id, expires_at) VALUES (?, 'admin', ?, ?)"
    ).bind(token, user.id, expiresAt).run();
    
    await env.DB.prepare(
      "UPDATE admin_users SET last_login = ? WHERE id = ?"
    ).bind(Date.now(), user.id).run();
    
    return jsonResponse({ 
      success: true, 
      token,
      user: { id: user.id, email: user.email, name: user.name }
    }, 200, origin, isAllowed);
  }
  
  // Client登录（API Key方式）
  if (subPath === 'client/login' && method === 'POST') {
    const body = await request.json();
    const { client_code, api_key } = body;
    
    const tenant = await env.DB.prepare(
      "SELECT * FROM tenants WHERE client_code = ? AND api_key = ? AND is_active = 1"
    ).bind(client_code, api_key).first();
    
    if (!tenant) {
      return jsonResponse({ error: 'Invalid credentials' }, 401, origin, isAllowed);
    }
    
    const token = crypto.randomUUID();
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7天
    
    await env.DB.prepare(
      "INSERT INTO sessions (token, user_type, user_id, tenant_id, expires_at) VALUES (?, 'client', ?, ?, ?)"
    ).bind(token, tenant.id, tenant.id, expiresAt).run();
    
    return jsonResponse({
      success: true,
      token,
      tenant: { 
        id: tenant.id,
        code: tenant.client_code, 
        name: tenant.client_name 
      }
    }, 200, origin, isAllowed);
  }
  
  // 验证会话
  if (subPath === 'verify' && method === 'GET') {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return jsonResponse({ valid: false }, 200, origin, isAllowed);
    }
    
    const session = await env.DB.prepare(
      "SELECT * FROM sessions WHERE token = ? AND expires_at > ?"
    ).bind(token, Date.now()).first();
    
    return jsonResponse({ 
      valid: !!session,
      type: session?.user_type,
      expires_at: session?.expires_at
    }, 200, origin, isAllowed);
  }
  
  return jsonResponse({ error: 'Auth endpoint not found' }, 404, origin, isAllowed);
}

// ===== 业务逻辑函数 =====

async function getDashboardData(env, tenantId, origin, isAllowed) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfDay = Math.floor(today.getTime() / 1000);
  const endOfDay = startOfDay + 86400;
  
  // 今日统计
  const todayStats = await env.DB.prepare(
    `SELECT 
      COUNT(*) as order_count,
      SUM(amount) as total_amount,
      SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as success_count,
      SUM(CASE WHEN status = 2 THEN amount ELSE 0 END) as success_amount
     FROM transactions 
     WHERE tenant_id = ? AND createdAt >= ? AND createdAt < ?`
  ).bind(tenantId, startOfDay, endOfDay).first();
  
  // 近7天趋势
  const sevenDaysAgo = startOfDay - (7 * 86400);
  const chartData = await env.DB.prepare(
    `SELECT 
      date(createdAt, 'unixepoch') as date,
      COUNT(*) as count,
      SUM(amount) as amount,
      SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as success_count
     FROM transactions 
     WHERE tenant_id = ? AND createdAt >= ?
     GROUP BY date(createdAt, 'unixepoch')
     ORDER BY date`
  ).bind(tenantId, sevenDaysAgo).all();
  
  return jsonResponse({
    today: {
      orderCount: todayStats.order_count || 0,
      totalAmount: todayStats.total_amount || 0,
      successCount: todayStats.success_count || 0,
      successAmount: todayStats.success_amount || 0
    },
    chart: chartData.results || []
  }, 200, origin, isAllowed);
}

async function getTransactions(request, env, tenantId, origin, isAllowed) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page')) || 1;
  const limit = Math.min(parseInt(url.searchParams.get('limit')) || 15, 100);
  const offset = (page - 1) * limit;
  
  const status = url.searchParams.get('status');
  const state = url.searchParams.get('state');
  const payType = url.searchParams.get('payType');
  const dateFrom = url.searchParams.get('dateFrom');
  const dateTo = url.searchParams.get('dateTo');
  const mchNo = url.searchParams.get('mchNo');
  const minAmount = url.searchParams.get('minAmount');
  const maxAmount = url.searchParams.get('maxAmount');
  
  let whereClause = 'WHERE tenant_id = ?';
  const params = [tenantId];
  
  // Support both 'status' and 'state' params
  const statusFilter = status || state;
  if (statusFilter && statusFilter !== 'all') {
    whereClause += ' AND status = ?';
    params.push(parseInt(statusFilter));
  }
  
  if (payType && payType !== 'all') {
    whereClause += ' AND pay_type = ?';
    params.push(payType);
  }
  
  // Merchant order number search (partial match)
  if (mchNo) {
    whereClause += ' AND mchOrderNo LIKE ?';
    params.push(`%${mchNo}%`);
  }
  
  // Amount range filter (convert to cents)
  if (minAmount) {
    whereClause += ' AND amount >= ?';
    params.push(Math.floor(parseFloat(minAmount) * 100));
  }
  
  if (maxAmount) {
    whereClause += ' AND amount <= ?';
    params.push(Math.floor(parseFloat(maxAmount) * 100));
  }
  
  if (dateFrom) {
    whereClause += ' AND createdAt >= ?';
    params.push(Math.floor(new Date(dateFrom).getTime() / 1000));
  }
  
  if (dateTo) {
    whereClause += ' AND createdAt <= ?';
    params.push(Math.floor(new Date(dateTo).getTime() / 1000) + 86400);
  }
  
  // 获取总数
  const countResult = await env.DB.prepare(
    `SELECT COUNT(*) as total FROM transactions ${whereClause}`
  ).bind(...params).first();
  
  // 获取分页数据
  const dataResult = await env.DB.prepare(
    `SELECT * FROM transactions ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`
  ).bind(...params, limit, offset).all();
  
  return jsonResponse({
    data: dataResult.results || [],
    total: countResult.total,
    page,
    limit
  }, 200, origin, isAllowed);
}

async function getBossConfig(env, tenantId, origin, isAllowed) {
  const config = await env.DB.prepare(
    "SELECT * FROM boss_configs WHERE tenant_id = ?"
  ).bind(tenantId).first();
  
  if (!config) {
    return jsonResponse({
      enabled: false,
      time: '22:00',
      recipients: [],
      includeTrend: false,
      includeDetail: false
    }, 200, origin, isAllowed);
  }
  
  return jsonResponse({
    enabled: !!config.enabled,
    time: config.send_time || '22:00',
    recipients: JSON.parse(config.recipients_json || '[]'),
    includeTrend: !!config.include_trend,
    includeDetail: !!config.include_detail
  }, 200, origin, isAllowed);
}

async function updateBossConfig(request, env, tenantId, origin, isAllowed) {
  const body = await request.json();
  const { enabled, time, recipients, includeTrend, includeDetail } = body;
  
  const recipientsJson = JSON.stringify(recipients || []);
  
  await env.DB.prepare(
    `INSERT INTO boss_configs (tenant_id, enabled, send_time, recipients_json, include_trend, include_detail)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(tenant_id) DO UPDATE SET
       enabled = excluded.enabled,
       send_time = excluded.send_time,
       recipients_json = excluded.recipients_json,
       include_trend = excluded.include_trend,
       include_detail = excluded.include_detail`
  ).bind(tenantId, enabled ? 1 : 0, time || '22:00', recipientsJson, 
         includeTrend ? 1 : 0, includeDetail ? 1 : 0).run();
  
  return jsonResponse({ success: true }, 200, origin, isAllowed);
}

// 测试发送 Boss 报告
async function testBossReport(request, env, tenantId, origin, isAllowed) {
  try {
    // 获取当前配置
    const config = await env.DB.prepare(
      "SELECT * FROM boss_configs WHERE tenant_id = ?"
    ).bind(tenantId).first();
    
    if (!config) {
      return jsonResponse({ error: 'Boss config not found' }, 404, origin, isAllowed);
    }
    
    // 获取接收人
    const recipientsResult = await env.DB.prepare(
      "SELECT * FROM boss_recipients WHERE tenant_id = ? AND is_enabled = 1"
    ).bind(tenantId).all();
    
    const recipients = recipientsResult.results || [];
    if (recipients.length === 0) {
      return jsonResponse({ error: 'No active recipients found' }, 400, origin, isAllowed);
    }
    
    // 获取今日交易数据
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startTime = Math.floor(today.getTime() / 1000);
    const endTime = startTime + 86400;
    
    const stats = await env.DB.prepare(`
      SELECT 
        COUNT(*) as orderCount, 
        SUM(amount) / 100 as totalAmount,
        SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as successCount,
        SUM(CASE WHEN status = 2 THEN amount ELSE 0 END) / 100 as successAmount
      FROM transactions 
      WHERE tenant_id = ? AND createdAt >= ? AND createdAt < ?
    `).bind(tenantId, startTime, endTime).first();
    
    const dateStr = new Date().toLocaleDateString('zh-HK', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    const totalAmount = (stats?.totalAmount || 0).toFixed(2);
    const successAmount = (stats?.successAmount || 0).toFixed(2);
    const orderCount = stats?.orderCount || 0;
    const successCount = stats?.successCount || 0;
    const successRate = orderCount > 0 ? ((successCount / orderCount) * 100).toFixed(1) : 0;
    
    // 构建测试消息
    const message = `*🧪 King-Chicken 測試報告* 📊\n\n` +
      `📅 日期: ${dateStr}\n` +
      `⏰ 發送時間: ${new Date().toLocaleTimeString('zh-HK')}\n` +
      `💰 今日交易: HK$ ${Number(totalAmount).toLocaleString()}\n` +
      `📦 訂單數: ${orderCount} 筆\n` +
      `✅ 成功: ${successCount} 筆\n` +
      `💵 成功金額: HK$ ${Number(successAmount).toLocaleString()}\n` +
      `📈 成功率: ${successRate}%\n` +
      `\n📝 *這是測試報告*\n` +
      `_發送自 EasyLink Payment_`;
    
    // 发送给所有接收人
    const sentTo = [];
    for (const recipient of recipients) {
      try {
        await sendWhatsAppMessage(recipient.phone, message);
        sentTo.push({ name: recipient.name, phone: recipient.phone, status: 'sent' });
        console.log(`[TestReport] Sent to ${recipient.name} (${recipient.phone})`);
      } catch (err) {
        sentTo.push({ name: recipient.name, phone: recipient.phone, status: 'failed', error: err.message });
        console.error(`[TestReport] Failed to send to ${recipient.phone}:`, err);
      }
    }
    
    return jsonResponse({ 
      success: true, 
      message: '測試報告已發送',
      sentTo,
      stats: {
        totalAmount,
        orderCount,
        successRate
      }
    }, 200, origin, isAllowed);
    
  } catch (error) {
    console.error('[TestBossReport] Error:', error);
    return jsonResponse({ error: 'Failed to send test report: ' + error.message }, 500, origin, isAllowed);
  }
}

async function createPayment(request, env, origin, isAllowed) {
  // 实现支付创建逻辑（复用现有代码）
  return jsonResponse({ error: 'Not implemented' }, 501, origin, isAllowed);
}

async function queryPayment(orderNo, env, origin, isAllowed) {
  const payment = await env.DB.prepare(
    "SELECT * FROM transactions WHERE order_no = ?"
  ).bind(orderNo).first();
  
  if (!payment) {
    return jsonResponse({ error: 'Payment not found' }, 404, origin, isAllowed);
  }
  
  return jsonResponse({ data: payment }, 200, origin, isAllowed);
}

// CloudWAPI Configuration
const CLOUDWAPI_KEY = 'fLt40WBzPE2DIK5Ls8AIPAMnt8pV8D';
const CLOUDWAPI_SENDER = '85268810677';  // 提供的Sender号码
const CLOUDWAPI_URL = 'https://unofficial.cloudwapi.in/send-message';

async function sendBossReport(env, config) {
  console.log(`[BossReport] Sending to ${config.client_code}`);
  
  try {
    // 1. 获取昨日交易数据
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const startTime = Math.floor(yesterday.getTime() / 1000);
    const endTime = startTime + 86400;
    
    const stats = await env.DB.prepare(`
      SELECT 
        COUNT(*) as orderCount, 
        SUM(amount) / 100 as totalAmount,
        SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as successCount,
        SUM(CASE WHEN status = 2 THEN amount ELSE 0 END) / 100 as successAmount
      FROM transactions 
      WHERE tenant_id = ? AND createdAt >= ? AND createdAt < ?
    `).bind(config.tenant_id, startTime, endTime).first();
    
    // 2. 获取接收人列表
    const recipientsResult = await env.DB.prepare(`
      SELECT * FROM boss_recipients 
      WHERE tenant_id = ? AND is_enabled = 1
    `).bind(config.tenant_id).all();
    
    const recipients = recipientsResult.results || [];
    
    if (recipients.length === 0) {
      console.log(`[BossReport] No recipients for ${config.client_code}`);
      return;
    }
    
    // 3. 构建报告消息
    const dateStr = yesterday.toLocaleDateString('zh-HK', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    const totalAmount = (stats?.totalAmount || 0).toFixed(2);
    const successAmount = (stats?.successAmount || 0).toFixed(2);
    const orderCount = stats?.orderCount || 0;
    const successCount = stats?.successCount || 0;
    const successRate = orderCount > 0 ? ((successCount / orderCount) * 100).toFixed(1) : 0;
    
    // 获取支付方式统计
    let paymentBreakdown = '';
    if (config.include_detail) {
      const payStats = await env.DB.prepare(`
        SELECT pay_type, COUNT(*) as count, SUM(amount) / 100 as amount
        FROM transactions 
        WHERE tenant_id = ? AND createdAt >= ? AND createdAt < ? AND status = 2
        GROUP BY pay_type
      `).bind(config.tenant_id, startTime, endTime).all();
      
      if (payStats.results && payStats.results.length > 0) {
        paymentBreakdown = '\n📊 *支付方式統計*\n';
        for (const stat of payStats.results) {
          const payTypeName = getPayTypeName(stat.pay_type);
          paymentBreakdown += `${payTypeName}: ${stat.count}筆 HK$${parseFloat(stat.amount).toFixed(2)}\n`;
        }
      }
    }
    
    // 构建完整消息
    const message = `*🐔 King-Chicken 每日報告* 📊\n\n` +
      `📅 日期: ${dateStr}\n` +
      `💰 交易總額: HK$ ${Number(totalAmount).toLocaleString()}\n` +
      `📦 訂單總數: ${orderCount} 筆\n` +
      `✅ 成功交易: ${successCount} 筆\n` +
      `💵 成功金額: HK$ ${Number(successAmount).toLocaleString()}\n` +
      `📈 成功率: ${successRate}%\n` +
      paymentBreakdown +
      `\n_報告發送自 EasyLink Payment_`;
    
    // 4. 发送给所有接收人
    for (const recipient of recipients) {
      try {
        await sendWhatsAppMessage(recipient.phone, message);
        console.log(`[BossReport] Sent to ${recipient.name} (${recipient.phone})`);
        
        // 记录发送历史
        await env.DB.prepare(`
          INSERT INTO boss_report_history (tenant_id, report_date, total_amount, order_count, success_rate, sent_to, sent_at, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          config.tenant_id,
          dateStr,
          totalAmount,
          orderCount,
          successRate,
          recipient.phone,
          Date.now(),
          'sent'
        ).run();
        
      } catch (err) {
        console.error(`[BossReport] Failed to send to ${recipient.phone}:`, err);
      }
    }
    
  } catch (error) {
    console.error('[BossReport] Error:', error);
  }
}

// 发送 WhatsApp 消息 (CloudWAPI)
async function sendWhatsAppMessage(phone, message) {
  // 确保电话号码格式正确 (需要包含国家代码，如 85298113210)
  const formattedPhone = phone.startsWith('+') ? phone.substring(1) : phone;
  
  const response = await fetch(CLOUDWAPI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      api_key: CLOUDWAPI_KEY,
      sender: CLOUDWAPI_SENDER,
      number: formattedPhone,
      message: message
    })
  });
  
  const result = await response.json();
  
  if (!result.status && !result.success) {
    throw new Error(`CloudWAPI error: ${result.msg || result.message || JSON.stringify(result)}`);
  }
  
  console.log('[WhatsApp] Sent:', result);
  return result;
}

// 测试 WhatsApp 发送
async function handleTestWhatsApp(request, env, origin, isAllowed) {
  try {
    const body = await request.json();
    const { phone, message } = body;
    
    if (!phone) {
      return jsonResponse({ error: 'Phone number is required' }, 400, origin, isAllowed);
    }
    
    const testMessage = message || '這是一條來自 King-Chicken 支付系統的測試消息。\n\n如果您收到此消息，說明 CloudWAPI 配置正確！🎉';
    
    console.log(`[TestWhatsApp] Sending to ${phone} from ${CLOUDWAPI_SENDER}`);
    
    const result = await sendWhatsAppMessage(phone, testMessage);
    
    return jsonResponse({ 
      success: true, 
      message: 'Test message sent successfully',
      to: phone,
      from: CLOUDWAPI_SENDER,
      result 
    }, 200, origin, isAllowed);
    
  } catch (error) {
    console.error('[TestWhatsApp] Error:', error);
    return jsonResponse({ 
      error: 'Failed to send test message',
      details: error.message 
    }, 500, origin, isAllowed);
  }
}

// 获取支付方式名称
function getPayTypeName(payType) {
  const names = {
    'UP_OP': '💳 銀聯',
    'ALI_H5': '💰 支付寶',
    'WX_H5': '💚 微信支付',
    'UP_H5': '💳 銀聯H5'
  };
  return names[payType] || payType;
}

// 获取Boss报告发送历史
async function getBossReportHistory(env, tenantId, origin, isAllowed) {
  try {
    const history = await env.DB.prepare(`
      SELECT 
        id,
        report_date,
        total_amount / 100.0 as total_amount,
        order_count,
        success_rate,
        sent_to,
        datetime(sent_at / 1000, 'unixepoch') as sent_at,
        status,
        error_message
      FROM boss_report_history 
      WHERE tenant_id = ? 
      ORDER BY sent_at DESC 
      LIMIT 50
    `).bind(tenantId).all();
    
    return jsonResponse({
      success: true,
      data: history.results || []
    }, 200, origin, isAllowed);
  } catch (error) {
    console.error('[BossReportHistory] Error:', error);
    return jsonResponse({ 
      success: false,
      error: 'Failed to get report history: ' + error.message 
    }, 500, origin, isAllowed);
  }
}

// ===== 工具函数 =====

function jsonResponse(data, status = 200, origin = '*', isAllowed = true) {
  const corsOrigin = isAllowed ? origin : '*';
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
    }
  });
}

function corsResponse(origin = '*', isAllowed = true) {
  const corsOrigin = isAllowed ? origin : '*';
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
    }
  });
}

async function checkAdminAuth(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { valid: false, error: 'No token provided' };
  }
  
  const token = authHeader.substring(7);
  const session = await env.DB.prepare(
    "SELECT * FROM sessions WHERE token = ? AND user_type = 'admin' AND expires_at > ?"
  ).bind(token, Date.now()).first();
  
  if (!session) {
    return { valid: false, error: 'Invalid or expired token' };
  }
  
  return { valid: true, session };
}
