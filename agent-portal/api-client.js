/**
 * EasyLink Agent Portal API Client
 * 
 * 封装所有后端 API 调用
 */

const API_BASE_URL = 'https://easylink-api-v2.jimsbond007.workers.dev';

class AgentAPI {
    constructor() {
        this.agentCode = sessionStorage.getItem('agent_code');
    }

    // 设置 Agent Code（登录后）
    setAgentCode(code) {
        this.agentCode = code;
        sessionStorage.setItem('agent_code', code);
    }

    // 获取请求头
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.agentCode) {
            headers['X-Agent-Code'] = this.agentCode;
        }
        return headers;
    }

    // ============ 认证 API ============

    // 登录
    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/agent/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.setAgentCode(data.data.agentCode);
                sessionStorage.setItem('agent_name', data.data.name);
                sessionStorage.setItem('agent_email', data.data.email);
            }
            
            return data;
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    // 检查登录状态
    isLoggedIn() {
        return !!this.agentCode;
    }

    // 退出登录
    logout() {
        sessionStorage.removeItem('agent_code');
        sessionStorage.removeItem('agent_name');
        sessionStorage.removeItem('agent_email');
        this.agentCode = null;
    }

    // ============ Dashboard API ============

    // 获取 Dashboard 统计数据
    async getDashboard() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/agent/dashboard`, {
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Get dashboard error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    // ============ 商户 API ============

    // 获取旗下商户列表
    async getMerchants() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/agent/merchants`, {
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Get merchants error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    // ============ 申请 API ============

    // 创建商户申请
    async createApplication(applicationData) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/agent/applications`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(applicationData)
            });
            return await response.json();
        } catch (error) {
            console.error('Create application error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    // 获取申请列表
    async getApplications(status = null) {
        try {
            let url = `${API_BASE_URL}/api/agent/applications`;
            if (status) {
                url += `?status=${status}`;
            }
            
            const response = await fetch(url, {
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Get applications error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    // 获取申请详情
    async getApplicationDetail(appNo) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/agent/applications/${appNo}`, {
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Get application detail error:', error);
            return { success: false, error: 'Network error' };
        }
    }
}

// 创建全局 API 实例
const api = new AgentAPI();

// 导出（供其他脚本使用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AgentAPI, api };
}
