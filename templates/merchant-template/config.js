/**
 * EasyLink Merchant Configuration
 * 
 * 商户配置文件 - 新商户开通时只需修改此文件
 * 基于 King Chicken 模板
 * 
 * 修改后部署到 Cloudflare Pages 即可
 */

const MERCHANT_CONFIG = {
  // ============================================
  // 基本信息 (必填)
  // ============================================
  
  // 商户代码: 2-4 位大写字母/数字
  // 示例: 'KC', 'MFC', 'FSR', 'TS01'
  code: 'MERCHANT_CODE',
  
  // 商户显示名称
  // 示例: 'King Chicken', '美味餐厅'
  name: '商户名称',
  
  // 商户简称（用于页面标题）
  shortName: '商户简称',
  
  // Logo 文件名（放在同级目录）
  // 建议尺寸: 200x200px, 格式: PNG
  logo: 'logo.png',
  
  // 网站图标
  favicon: 'favicon.ico',
  
  // ============================================
  // 联系信息
  // ============================================
  
  contact: {
    phone: '852-0000-0000',
    email: 'contact@merchant.com',
    address: '商户地址'
  },
  
  // ============================================
  // 主题配置
  // ============================================
  
  theme: {
    // 主色调 (Hermes Orange 风格)
    primary: '#FF6B00',
    primaryDark: '#E55A00',
    
    // 次要色 (金色)
    secondary: '#C9A961',
    
    // 背景色
    background: '#FAF7F2',
    backgroundDark: '#F5F0E8',
    
    // 文字颜色
    textDark: '#2C2419',
    textMedium: '#5C4F3D',
    textLight: '#8B7D6B',
    
    // 边框/分隔线颜色
    border: '#EDE8E0'
  },
  
  // ============================================
  // 支付配置
  // ============================================
  
  payment: {
    // 货币代码
    currency: 'HKD',
    
    // 货币符号
    currencySymbol: 'HK$',
    
    // 预设金额选项 (单位: 元)
    // 根据商户业务类型调整
    presetAmounts: [100, 500, 1000, 2000],
    
    // 最小支付金额
    minAmount: 1,
    
    // 最大支付金额
    maxAmount: 50000,
    
    // 启用支付方式
    enabledPayTypes: [
      { code: 'UP_OP', name: '銀聯在線支付', icon: '銀', color: '#C41E3A' },
      { code: 'ALI_H5', name: '支付寶', icon: '支', color: '#1677FF' },
      { code: 'WX_H5', name: '微信支付', icon: '微', color: '#07C160' }
    ],
    
    // 默认支付方式
    defaultPayType: 'UP_OP'
  },
  
  // ============================================
  // 功能开关 (重要！)
  // ============================================
  
  features: {
    /**
     * 司机/员工管理功能
     * 
     * ⚠️ KC-SPECIFIC: 这是 King Chicken 特有的功能
     * 
     * 根据业务类型选择：
     * - 配送服务 (如 KC): true (保留 drivers.html)
     * - 餐饮(非配送): false (替换为 桌台管理/服务员管理)
     * - 零售: false (替换为 店员管理/门店管理)
     * - 电商: false (替换为 渠道管理)
     * - 其他: false (禁用此功能)
     */
    drivers: false,
    
    // 司机数据（仅在 drivers: true 时使用）
    // 格式: { code: { name, phone, avatar, status } }
    driverData: {
      'D001': { name: '员工A', phone: '0000-0001', avatar: 'A', status: 'active' },
      'D002': { name: '员工B', phone: '0000-0002', avatar: 'B', status: 'active' },
      'D003': { name: '员工C', phone: '0000-0003', avatar: 'C', status: 'active' }
    },
    
    // 管理者报告 (WhatsApp 自动报告)
    bossReport: true,
    
    // WhatsApp 通知
    whatsappNotification: true,
    
    // 导出功能
    exportData: true,
    
    // 交易筛选
    transactionFilter: true,
    
    // 统计图表
    statisticsChart: true
  },
  
  // ============================================
  // 管理员账户
  // ============================================
  
  admin: {
    // 默认登录账户
    // 首次登录后应立即修改密码
    username: 'admin',
    password: 'admin123',
    
    // 是否启用多管理员 (未来功能)
    multiAdmin: false
  },
  
  // ============================================
  // API 配置
  // ============================================
  
  api: {
    // Worker API 地址
    // 通常不需要修改
    baseUrl: 'https://easylink-api-v2.jimsbond007.workers.dev',
    
    // API 版本
    version: 'v1'
  },
  
  // ============================================
  // 其他配置
  // ============================================
  
  // 时区
  timezone: 'Asia/Hong_Kong',
  
  // 日期格式
  dateFormat: 'zh-HK',
  
  // 页脚版权信息
  footer: {
    copyright: '© 2024 商户名称. All rights reserved.',
    poweredBy: 'Powered by EasyLink'
  }
};

// ============================================
// 导出配置 (供其他文件使用)
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MERCHANT_CONFIG;
}
