// API 설정 및 관리
class APIConfig {
    constructor() {
        this.baseURL = '';
        this.apiKey = '';
        this.endpoints = {
            chat: '/api/chat',
            upload: '/api/upload'
        };
        this.headers = {
            'Content-Type': 'application/json'
        };
    }

    // API 키 설정 (환경변수 또는 설정에서)
    setApiKey(key) {
        this.apiKey = key;
        this.headers['Authorization'] = `Bearer ${key}`;
    }

    // 기본 URL 설정
    setBaseURL(url) {
        this.baseURL = url;
    }

    // API 요청 헬퍼
    async makeRequest(endpoint, method = 'POST', data = null) {
        const url = this.baseURL + endpoint;
        
        const config = {
            method,
            headers: { ...this.headers },
            timeout: APP_CONFIG.API_CONFIG.TIMEOUT
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            return result;
            
        } catch (error) {
            console.error('API 요청 실패:', error);
            throw error;
        }
    }

    // 채팅 API 호출
    async sendChatMessage(message, conversation_id = null) {
        const data = {
            message,
            conversation_id,
            timestamp: new Date().toISOString()
        };

        return await this.makeRequest(this.endpoints.chat, 'POST', data);
    }
}

// 전역에서 사용할 수 있도록 설정
window.APIConfig = APIConfig;