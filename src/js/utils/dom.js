// src/js/utils/dom.js
class DOMUtils {
    static getElementById(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`Element with ID '${id}' not found`);
        }
        return element;
    }

    static querySelector(selector) {
        const element = document.querySelector(selector);
        if (!element) {
            console.error(`Element with selector '${selector}' not found`);
        }
        return element;
    }
}

window.DOMUtils = DOMUtils;

// src/js/utils/animation.js
class AnimationUtils {
    static fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        const start = performance.now();
        
        function animate(time) {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    }

    static fadeOut(element, duration = 300) {
        const start = performance.now();
        const startOpacity = parseFloat(element.style.opacity) || 1;
        
        function animate(time) {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = startOpacity * (1 - progress);
            
            if (progress >= 1) {
                element.style.display = 'none';
            } else {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    }
}

window.AnimationUtils = AnimationUtils;

// src/js/speech/audioUtils.js
class AudioUtils {
    static analyzeAudioLevel(dataArray) {
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        return sum / dataArray.length;
    }

    static normalizeAudioData(dataArray, min = 0, max = 255) {
        return dataArray.map(value => (value - min) / (max - min));
    }

    static detectSilence(dataArray, threshold = 30) {
        const average = this.analyzeAudioLevel(dataArray);
        return average < threshold;
    }
}

window.AudioUtils = AudioUtils;

// src/js/ai/responses.js
class ResponseHandler {
    constructor() {
        this.responses = {
            greetings: [
                '안녕하세요! 무엇을 도와드릴까요?',
                '반갑습니다! 어떤 이야기를 나눠볼까요?',
                '안녕하세요! 오늘 기분이 어떠신가요?'
            ],
            default: [
                '흥미로운 말씀이네요!',
                '더 자세히 설명해주시겠어요?',
                '그렇군요. 어떤 도움이 필요하신가요?',
                '좋은 질문이네요!'
            ]
        };
    }

    getRandomResponse(category = 'default') {
        const responses = this.responses[category] || this.responses.default;
        return responses[Math.floor(Math.random() * responses.length)];
    }

    analyzeInput(input) {
        const greetingKeywords = ['안녕', '하이', '헬로', '처음', '반가'];
        
        if (greetingKeywords.some(keyword => input.includes(keyword))) {
            return 'greetings';
        }
        
        return 'default';
    }
}

window.ResponseHandler = ResponseHandler;

// src/js/ai/chatbot.js
class SimpleChatbot {
    constructor() {
        this.responseHandler = new ResponseHandler();
        this.context = [];
    }

    async generateResponse(userInput) {
        // 간단한 응답 생성 로직
        const category = this.responseHandler.analyzeInput(userInput);
        
        // 컨텍스트에 추가
        this.context.push({
            user: userInput,
            timestamp: new Date()
        });

        // 특정 키워드 응답
        if (userInput.includes('이름')) {
            return '저는 AI 챗봇입니다. 봇이라고 불러주세요!';
        }
        
        if (userInput.includes('시간')) {
            return `현재 시간은 ${new Date().toLocaleTimeString()}입니다.`;
        }

        if (userInput.includes('날짜')) {
            return `오늘은 ${new Date().toLocaleDateString()}입니다.`;
        }

        // 기본 응답
        return this.responseHandler.getRandomResponse(category);
    }
}

window.SimpleChatbot = SimpleChatbot;