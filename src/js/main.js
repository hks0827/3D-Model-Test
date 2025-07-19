// 메인 애플리케이션 클래스
class ChatbotApp {
    constructor() {
        this.character = null;
        this.stt = null;
        this.tts = null;
        this.chatMessages = [];
        this.isInitialized = false;
        
        // DOM 요소들
        this.elements = {
            character: null,
            chatMessages: null,
            textInput: null,
            sendButton: null,
            micButton: null,
            speakButton: null,
            settingsPanel: null,
            settingsButton: null,
            connectionStatus: null,
            loadingSpinner: null
        };

        this.is3DMode = true; // 3D 모드 기본값
        this.threeScene = null;
        this.character3D = null;

        this.init();
    }

    

    // 애플리케이션 초기화
    async init() {
        try {
            console.log('챗봇 애플리케이션 초기화 시작...');
            
            // DOM 요소 참조
            this.initDOMElements();
            
            // 컴포넌트 초기화
            await this.initComponents();
            
            // 이벤트 리스너 설정
            this.setupEventListeners();
            
            // 설정 로드
            this.loadSettings();
            
            // 초기 메시지 표시
            this.showWelcomeMessage();
            
            this.isInitialized = true;
            this.updateConnectionStatus('연결됨');
            
            console.log('챗봇 애플리케이션 초기화 완료!');
            
        } catch (error) {
            console.error('애플리케이션 초기화 실패:', error);
            this.showError('애플리케이션 초기화에 실패했습니다: ' + error.message);
        }
    }

    // DOM 요소 초기화
    initDOMElements() {
        this.elements = {
            // 기존 요소들
            character: document.getElementById('character'),
            character3dContainer: document.getElementById('character3dContainer'),
            character2dContainer: document.getElementById('character2dContainer'),
            chatMessages: document.getElementById('chatMessages'),
            textInput: document.getElementById('textInput'),
            sendButton: document.getElementById('sendButton'),
            micButton: document.getElementById('micButton'),
            speakButton: document.getElementById('speakButton'),
            settingsPanel: document.getElementById('settingsPanel'),
            settingsButton: document.getElementById('settingsButton'),
            closeSettings: document.getElementById('closeSettings'),
            connectionStatus: document.getElementById('connectionStatus'),
            loadingSpinner: document.getElementById('loadingSpinner'),
            
            // 새로운 UI 요소들
            characterModeText: document.getElementById('characterModeText'),
            toggle2D3D: document.getElementById('toggle2D3D'),
            
            // 설정 요소들
            voiceSelect: document.getElementById('voiceSelect'),
            speedRange: document.getElementById('speedRange'),
            speedValue: document.getElementById('speedValue'),
            pitchRange: document.getElementById('pitchRange'),
            pitchValue: document.getElementById('pitchValue')
        };

        // 필수 요소 확인
        const requiredElements = ['chatMessages', 'textInput', 'sendButton'];
        for (const elementName of requiredElements) {
            if (!this.elements[elementName]) {
                throw new Error(`필수 DOM 요소를 찾을 수 없습니다: ${elementName}`);
            }
        }
        
        // 3D 컨테이너 확인
        if (!this.elements.character3dContainer) {
            console.warn('3D 캐릭터 컨테이너를 찾을 수 없습니다. 2D 모드로 실행됩니다.');
            this.is3DMode = false;
        }
    }

    // 컴포넌트 초기화
    async initComponents() {
        // 캐릭터 초기화
        this.character = new Character(this.elements.character);
        
        // 3D 캐릭터 초기화
        await this.init3DCharacter();

        // STT 초기화
        this.stt = new SpeechToText();
        this.setupSTTCallbacks();
        
        // TTS 초기화
        this.tts = new TextToSpeech();
        this.setupTTSCallbacks();
        
        // TTS 음성 목록 로드
        this.populateVoiceSelect();
        
        // 캐릭터에 음성 분석기 연결
        if (this.stt.analyzer) {
            this.character.setSpeechAnalyzer(this.stt);
        }
    }
    
    // 3D 캐릭터 초기화 (비즈니스 버전)
    async init3DCharacter() {
        try {
            console.log('비즈니스 캐릭터 초기화 시작...');
            
            if (!this.elements.character3dContainer) {
                throw new Error('3D 캐릭터 컨테이너를 찾을 수 없습니다');
            }

            // Three.js 확인
            if (typeof THREE === 'undefined') {
                throw new Error('Three.js 라이브러리가 필요합니다');
            }

            // BusinessCharacter 클래스 확인
            if (typeof BusinessCharacter !== 'undefined') {
                console.log('BusinessCharacter 사용');
                this.threeScene = new ThreeScene(this.elements.character3dContainer);
                // scene.js에서 BusinessCharacter 사용하도록 수정 필요
                this.character3D = this.threeScene.character;
            } else if (typeof RealCharacter3D !== 'undefined') {
                console.log('RealCharacter3D 사용');
                this.threeScene = new ThreeScene(this.elements.character3dContainer);
                this.character3D = this.threeScene.character;
            } else {
                console.log('기본 Character3D 사용');
                this.threeScene = new ThreeScene(this.elements.character3dContainer);
                this.character3D = this.threeScene.character;
            }
            
            console.log('✅ 캐릭터 초기화 완료');
            
        } catch (error) {
            console.error('3D 캐릭터 초기화 실패:', error);
            this.createBusinessFallbackDisplay();
        }
    }

    // 비즈니스 폴백 표시 생성
    createBusinessFallbackDisplay() {
        console.log('비즈니스 폴백 표시 생성...');
        
        const container = this.elements.character3dContainer;
        if (!container) return;
        
        container.innerHTML = `
            <div class="business-avatar-container" style="
                width: 200px;
                height: 250px;
                margin: 30px auto;
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            ">
                <!-- 비즈니스 아바타 -->
                <div class="business-avatar" style="
                    width: 150px;
                    height: 150px;
                    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 4rem;
                    animation: businessFloat 4s ease-in-out infinite;
                    box-shadow: 0 15px 35px rgba(44, 62, 80, 0.3);
                    position: relative;
                    overflow: hidden;
                ">
                    👔
                    
                    <!-- 넥타이 포인트 -->
                    <div style="
                        position: absolute;
                        bottom: 30px;
                        width: 8px;
                        height: 40px;
                        background: #8b0000;
                        border-radius: 2px;
                        z-index: 1;
                    "></div>
                    
                    <!-- 셔츠 칼라 -->
                    <div style="
                        position: absolute;
                        top: 20px;
                        width: 60px;
                        height: 15px;
                        background: white;
                        border-radius: 50%;
                        opacity: 0.3;
                    "></div>
                </div>
                
                <!-- 비즈니스 정보 -->
                <div class="business-info" style="
                    text-align: center;
                    margin-top: 15px;
                    color: #2c3e50;
                    font-family: 'Segoe UI', sans-serif;
                ">
                    <div style="font-weight: 600; font-size: 1.1rem;">비즈니스 AI</div>
                    <div style="font-size: 0.8rem; color: #7f8c8d; margin-top: 3px;">전문 상담사</div>
                </div>
                
                <!-- 상태 표시 -->
                <div class="business-status" style="
                    margin-top: 10px;
                    padding: 5px 12px;
                    background: rgba(46, 204, 113, 0.1);
                    border: 1px solid #2ecc71;
                    border-radius: 15px;
                    font-size: 0.7rem;
                    color: #27ae60;
                    font-weight: 500;
                ">
                    ● 상담 가능
                </div>
            </div>

            <style>
                @keyframes businessFloat {
                    0%, 100% { 
                        transform: translateY(0px) rotate(0deg);
                        box-shadow: 0 15px 35px rgba(44, 62, 80, 0.3);
                    }
                    50% { 
                        transform: translateY(-8px) rotate(1deg);
                        box-shadow: 0 25px 45px rgba(44, 62, 80, 0.4);
                    }
                }
                
                .business-avatar:hover {
                    transform: scale(1.05) !important;
                    transition: transform 0.3s ease;
                    cursor: pointer;
                }
                
                .business-avatar-container:hover .business-status {
                    background: rgba(52, 152, 219, 0.1);
                    border-color: #3498db;
                    color: #2980b9;
                }
            </style>
        `;
        
        // 비즈니스 캐릭터 객체 생성
        this.character = {
            setState: (state) => {
                const avatar = container.querySelector('.business-avatar');
                const status = container.querySelector('.business-status');
                if (!avatar || !status) return;
                
                console.log('비즈니스 캐릭터 상태:', state);
                
                switch (state) {
                    case APP_CONFIG.CHARACTER_STATES.TALKING:
                        avatar.style.background = 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)';
                        avatar.innerHTML = '🗣️<div style="position: absolute; bottom: 30px; width: 8px; height: 40px; background: #8b0000; border-radius: 2px;"></div>';
                        status.innerHTML = '● 발표 중';
                        status.style.borderColor = '#3498db';
                        status.style.color = '#2980b9';
                        break;
                        
                    case APP_CONFIG.CHARACTER_STATES.LISTENING:
                        avatar.style.background = 'linear-gradient(135deg, #1abc9c 0%, #16a085 100%)';
                        avatar.innerHTML = '👂<div style="position: absolute; bottom: 30px; width: 8px; height: 40px; background: #8b0000; border-radius: 2px;"></div>';
                        status.innerHTML = '● 경청 중';
                        status.style.borderColor = '#1abc9c';
                        status.style.color = '#16a085';
                        break;
                        
                    case APP_CONFIG.CHARACTER_STATES.THINKING:
                        avatar.style.background = 'linear-gradient(135deg, #f39c12 0%, #d68910 100%)';
                        avatar.innerHTML = '🤔<div style="position: absolute; bottom: 30px; width: 8px; height: 40px; background: #8b0000; border-radius: 2px;"></div>';
                        status.innerHTML = '● 분석 중';
                        status.style.borderColor = '#f39c12';
                        status.style.color = '#d68910';
                        break;
                        
                    case APP_CONFIG.CHARACTER_STATES.HAPPY:
                        avatar.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
                        avatar.innerHTML = '😊<div style="position: absolute; bottom: 30px; width: 8px; height: 40px; background: #8b0000; border-radius: 2px;"></div>';
                        status.innerHTML = '● 만족';
                        status.style.borderColor = '#e74c3c';
                        status.style.color = '#c0392b';
                        break;
                        
                    default:
                        avatar.style.background = 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)';
                        avatar.innerHTML = '👔<div style="position: absolute; bottom: 30px; width: 8px; height: 40px; background: #8b0000; border-radius: 2px;"></div>';
                        status.innerHTML = '● 상담 가능';
                        status.style.borderColor = '#2ecc71';
                        status.style.color = '#27ae60';
                }
            },
            destroy: () => console.log('비즈니스 폴백 캐릭터 정리됨')
        };
        
        console.log('✅ 비즈니스 폴백 표시 생성 완료');
    }

    

    // STT 콜백 설정
    setupSTTCallbacks() {
    this.stt.setCallbacks({
        onStart: () => {
            this.setCharacterState(APP_CONFIG.CHARACTER_STATES.LISTENING);
            this.elements.micButton.classList.add('active');
            this.updateMicButtonText('듣는 중...');
        },
        onResult: (result) => {
            // 🎤 실시간 오디오 데이터를 캐릭터에 전달
            if (this.is3DMode && this.character3D && this.stt.analyzer) {
                const audioData = this.stt.getFrequencyData();
                this.character3D.currentAudioData = audioData; // 💡 여기서 데이터 설정
            }
            
            if (result.interim) {
                this.showInterimResult(result.interim);
            }
            if (result.final && result.final.trim()) {
                this.handleUserInput(result.final.trim());
            }
        },
        onEnd: () => {
            this.setCharacterState(APP_CONFIG.CHARACTER_STATES.IDLE);
            this.elements.micButton.classList.remove('active');
            this.updateMicButtonText('음성 입력');
            this.clearInterimResult();
            
            // 🎤 오디오 데이터 초기화
            if (this.is3DMode && this.character3D) {
                this.character3D.currentAudioData = null;
            }
        },
        onError: (error) => {
            this.setCharacterState(APP_CONFIG.CHARACTER_STATES.IDLE);
            this.elements.micButton.classList.remove('active');
            this.updateMicButtonText('음성 입력');
            this.showError(error);
            this.clearInterimResult();
            
            // 🎤 오디오 데이터 초기화
            if (this.is3DMode && this.character3D) {
                this.character3D.currentAudioData = null;
            }
        }
    });
}

    // TTS 콜백 설정
    setupTTSCallbacks() {
        this.tts.setCallbacks({
            onStart: (text) => {
                this.setCharacterState(APP_CONFIG.CHARACTER_STATES.TALKING);
                this.elements.speakButton.classList.add('active');
                
                // 3D 캐릭터 립싱크 시작
                if (this.is3DMode && this.character3D) {
                    this.startTTSLipSync();
                }
            },
            onEnd: (text) => {
                this.setCharacterState(APP_CONFIG.CHARACTER_STATES.IDLE);
                this.elements.speakButton.classList.remove('active');
                
                // 3D 캐릭터 립싱크 중지
                if (this.is3DMode && this.character3D) {
                    this.stopTTSLipSync();
                }
            },
            onError: (error) => {
                this.setCharacterState(APP_CONFIG.CHARACTER_STATES.IDLE);
                this.elements.speakButton.classList.remove('active');
                this.showError(error);
            }
        });
    }

    // TTS용 립싱크 시작
    startTTSLipSync() {
    if (!this.character3D) return;
    
    // 🔊 TTS 중 가짜 오디오 데이터 생성
    this.ttsLipSyncInterval = setInterval(() => {
        const fakeAudioData = Array.from({length: 32}, () => 
            Math.random() * 128 + 64
        );
        
        // TTS 중에는 가짜 데이터 설정
        this.character3D.currentAudioData = fakeAudioData;
    }, 100);
}

    // TTS용 립싱크 중지
    stopTTSLipSync() {
    if (this.ttsLipSyncInterval) {
        clearInterval(this.ttsLipSyncInterval);
        this.ttsLipSyncInterval = null;
    }
    
    // 🔊 TTS 중지 시 오디오 데이터 초기화
    if (this.character3D) {
        this.character3D.currentAudioData = null;
    }
}

    // 이벤트 리스너 설정
    setupEventListeners() {

        const toggleButton = document.getElementById('toggle2D3D');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                this.toggle2D3D();
            });
        }

        // 텍스트 입력 전송
        this.elements.sendButton.addEventListener('click', () => {
            this.handleTextInput();
        });

        this.elements.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleTextInput();
            }
        });

        // 음성 입력
        this.elements.micButton.addEventListener('click', () => {
            this.toggleSpeechRecognition();
        });

        // 음성 출력 중지
        this.elements.speakButton.addEventListener('click', () => {
            this.toggleSpeech();
        });

        // 설정 패널
        this.elements.settingsButton.addEventListener('click', () => {
            this.toggleSettings();
        });

        this.elements.closeSettings.addEventListener('click', () => {
            this.closeSettings();
        });

        // 음성 설정
        this.elements.voiceSelect?.addEventListener('change', (e) => {
            this.tts.setVoice(parseInt(e.target.value));
        });

        this.elements.speedRange?.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.tts.setRate(value);
            this.elements.speedValue.textContent = value.toFixed(1);
        });

        this.elements.pitchRange?.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.tts.setPitch(value);
            this.elements.pitchValue.textContent = value.toFixed(1);
        });

        // 설정 패널 외부 클릭시 닫기
        document.addEventListener('click', (e) => {
            if (!this.elements.settingsPanel.contains(e.target) && 
                !this.elements.settingsButton.contains(e.target) &&
                !this.elements.settingsPanel.classList.contains('hidden')) {
                this.closeSettings();
            }
        });
    }
    
    // 2D/3D 모드 전환
    toggle2D3D() {
        this.is3DMode = !this.is3DMode;
        
        const toggle2DButton = document.getElementById('toggle2D3D');
        const character2D = document.querySelector('.character-section .character-container');
        const character3D = document.getElementById('character3dContainer');
        
        if (this.is3DMode) {
            // 3D 모드로 전환
            if (character2D) character2D.style.display = 'none';
            if (character3D) character3D.style.display = 'block';
            if (toggle2DButton) toggle2DButton.textContent = '2D로 전환';
            
            // 3D 씬 재시작
            if (this.threeScene) {
                this.threeScene.animate();
            }
        } else {
            // 2D 모드로 전환
            if (character3D) character3D.style.display = 'none';
            if (character2D) character2D.style.display = 'block';
            if (toggle2DButton) toggle2DButton.textContent = '3D로 전환';
        }
    }

    // 캐릭터 상태 변경 (2D/3D 통합)
    setCharacterState(state) {
        if (this.is3DMode && this.character3D) {
            this.character3D.setState(state);
        } else if (this.character) {
            this.character.setState(state);
        }
    }

    // 텍스트 입력 처리
    handleTextInput() {
        const text = this.elements.textInput.value.trim();
        if (!text) return;

        this.elements.textInput.value = '';
        this.handleUserInput(text);
    }

    // 사용자 입력 처리 (비즈니스 버전)
    async handleUserInput(userMessage) {
        try {
            // 비즈니스 컨텍스트 분석
            const businessContext = this.analyzeBusinessContext(userMessage);
            
            this.addMessage(userMessage, APP_CONFIG.MESSAGE_TYPES.USER);
            
            // 우선순위에 따른 캐릭터 반응
            if (businessContext.priority === 'high') {
                this.setCharacterState(APP_CONFIG.CHARACTER_STATES.LISTENING);
                await new Promise(resolve => setTimeout(resolve, 500)); // 빠른 반응
            } else {
                this.setCharacterState(APP_CONFIG.CHARACTER_STATES.THINKING);
                await new Promise(resolve => setTimeout(resolve, 1000)); // 일반적인 사고 시간
            }
            
            //this.showLoading(true);
            
            const botResponse = await this.generateBotResponse(userMessage);
            
            //this.showLoading(false);
            
            this.addMessage(botResponse, APP_CONFIG.MESSAGE_TYPES.BOT);
            
            // 비즈니스 톤에 맞는 음성 출력
            if (this.tts && this.tts.isSupported) {
                // 기본 음성 출력
                this.tts.speak(botResponse);
            }
            
        } catch (error) {
            this.showLoading(false);
            this.setCharacterState(APP_CONFIG.CHARACTER_STATES.IDLE);
            this.showError('비즈니스 분석 중 오류가 발생했습니다: ' + error.message);
        }
    }

    // 간단한 감정 분석
    analyzeEmotion(text) {
        const happyWords = ['기쁘', '좋', '행복', '웃', '재미'];
        const sadWords = ['슬프', '우울', '속상', '힘들'];
        const excitedWords = ['와!', '대단', '놀라', '신나'];
        
        if (happyWords.some(word => text.includes(word))) {
            return 'happy';
        } else if (sadWords.some(word => text.includes(word))) {
            return 'sad';
        } else if (excitedWords.some(word => text.includes(word))) {
            return 'excited';
        }
        
        return 'talking';
    }

    // 비즈니스 컨텍스트 응답 생성
    async generateBotResponse(userMessage) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 비즈니스 키워드 응답
        const businessResponses = {
            '안녕': '안녕하세요! 저는 전문 비즈니스 AI 어시스턴트입니다. 어떤 업무를 도와드릴까요?',
            '회의': '회의 관련해서 도움이 필요하시군요. 회의 일정 조율, 안건 정리, 또는 회의록 작성 중 어떤 것을 도와드릴까요?',
            '프레젠테이션': '프레젠테이션 준비를 도와드리겠습니다. 구조 설계, 콘텐츠 정리, 또는 발표 기법 중 무엇이 필요하신가요?',
            '계획': '비즈니스 계획 수립을 도와드리겠습니다. 전략 기획, 일정 관리, 목표 설정 중 어떤 부분을 중점적으로 다뤄볼까요?',
            '분석': '데이터 분석이나 비즈니스 분석이 필요하시군요. 어떤 종류의 분석을 원하시는지 자세히 알려주세요.',
            '매출': '매출 관련 문의이시군요. 매출 분석, 증대 방안, 또는 예측 중 어떤 것을 도와드릴까요?',
            '고객': '고객 관리는 비즈니스의 핵심입니다. 고객 서비스, 관계 관리, 또는 만족도 향상 중 어떤 영역을 다뤄볼까요?',
            '마케팅': '마케팅 전략 수립을 도와드리겠습니다. 디지털 마케팅, 브랜딩, 또는 캠페인 기획 중 관심 있는 분야가 있으신가요?',
            '재무': '재무 관리는 매우 중요한 영역입니다. 예산 계획, 투자 분석, 또는 비용 최적화 중 어떤 것을 우선적으로 다뤄볼까요?',
            '팀': '팀 관리와 리더십에 대해 이야기해보겠습니다. 팀 빌딩, 성과 관리, 또는 커뮤니케이션 개선 중 어떤 것이 필요하신가요?'
        };

        // 키워드 매칭
        for (const [keyword, response] of Object.entries(businessResponses)) {
            if (userMessage.includes(keyword)) {
                return response;
            }
        }

        // 기본 비즈니스 응답
        const defaultBusinessResponses = [
            '비즈니스 관점에서 더 구체적으로 설명해주시면, 더 정확한 조언을 드릴 수 있습니다.',
            '해당 이슈에 대해 체계적으로 접근해보겠습니다. 추가 정보가 필요하신가요?',
            '전문적인 관점에서 분석해드리겠습니다. 어떤 부분을 중점적으로 다뤄볼까요?',
            '비즈니스 목표 달성을 위해 단계별로 접근해보는 것이 좋겠습니다.',
            '데이터 기반의 의사결정을 위해 더 자세한 정보를 공유해주시겠어요?'
        ];

        return defaultBusinessResponses[Math.floor(Math.random() * defaultBusinessResponses.length)];
    }

    // 메시지 추가
    addMessage(text, type, timestamp = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;

        // 아바타 생성
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.textContent = type === 'bot-message' ? '🤖' : '👤';

        // 메시지 버블 생성
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';

        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.textContent = text;

        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = timestamp || this.formatTime(new Date());

        bubbleDiv.appendChild(textDiv);
        bubbleDiv.appendChild(timeDiv);

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(bubbleDiv);
        
        this.elements.chatMessages.appendChild(messageDiv);
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;

        // 메시지 저장
        this.chatMessages.push({
            text,
            type,
            timestamp: timestamp || new Date().toISOString()
        });
    }
    // 중간 결과 표시 (STT)
    showInterimResult(text) {
        let interimDiv = document.getElementById('interimResult');
        
        if (!interimDiv) {
            interimDiv = document.createElement('div');
            interimDiv.id = 'interimResult';
            interimDiv.className = 'message user-message interim';
            interimDiv.style.opacity = '0.6';
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            interimDiv.appendChild(contentDiv);
            
            this.elements.chatMessages.appendChild(interimDiv);
        }
        
        const contentDiv = interimDiv.querySelector('.message-content');
        contentDiv.textContent = text;
        
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
    }

    // 중간 결과 제거
    clearInterimResult() {
        const interimDiv = document.getElementById('interimResult');
        if (interimDiv) {
            interimDiv.remove();
        }
    }

    // 음성 인식 토글
    async toggleSpeechRecognition() {
        if (!this.stt.isSupported) {
            this.showError(APP_CONFIG.ERROR_MESSAGES.SPEECH_NOT_SUPPORTED);
            return;
        }

        if (this.stt.isListening) {
            this.stt.stopListening();
        } else {
            try {
                await this.stt.startListening();
            } catch (error) {
                this.showError(error.message);
            }
        }
    }

    // 음성 출력 토글
    toggleSpeech() {
        if (this.tts.isSpeaking) {
            this.tts.stop();
        } else {
            // 마지막 봇 메시지 다시 읽기
            const lastBotMessage = this.chatMessages
                .filter(msg => msg.type === APP_CONFIG.MESSAGE_TYPES.BOT)
                .pop();
            
            if (lastBotMessage) {
                this.speakText(lastBotMessage.text);
            }
        }
    }

    // 텍스트 음성 출력
    speakText(text) {
        if (this.tts.isSupported && text) {
            const cleanText = this.tts.preprocessText(text);
            this.tts.speak(cleanText);
        }
    }

    // 마이크 버튼 텍스트 업데이트
    updateMicButtonText(text) {
        const span = this.elements.micButton.querySelector('span');
        if (span) {
            span.textContent = text;
        }
    }

    // 음성 선택 옵션 채우기
    populateVoiceSelect() {
        if (!this.elements.voiceSelect) return;

        const voices = this.tts.getVoices();
        this.elements.voiceSelect.innerHTML = '';

        voices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${voice.name} (${voice.lang})`;
            this.elements.voiceSelect.appendChild(option);
        });
    }

    // 설정 패널 토글
    toggleSettings() {
        this.elements.settingsPanel.classList.toggle('hidden');
    }

    // 설정 패널 닫기
    closeSettings() {
        this.elements.settingsPanel.classList.add('hidden');
    }

    // 로딩 표시/숨기기
    showLoading(show) {
      console.log(`로딩 상태: ${show ? '시작' : '완료'} (UI 표시 안함)`);
    }

    // 연결 상태 업데이트
    updateConnectionStatus(status) {
        if (this.elements.connectionStatus) {
            this.elements.connectionStatus.textContent = status;
        }
    }

    // 에러 메시지 표시
    showError(message) {
        this.addMessage(`오류: ${message}`, APP_CONFIG.MESSAGE_TYPES.BOT);
        console.error('Error:', message);
    }

    // 비즈니스 환영 메시지
    showWelcomeMessage() {
        const businessWelcomeMessages = [
            '안녕하세요! 저는 전문 비즈니스 AI 어시스턴트입니다.',
            '업무 효율성 향상, 전략 기획, 데이터 분석 등 다양한 비즈니스 영역에서 도움을 드릴 수 있습니다.',
            '어떤 비즈니스 과제를 해결하시는데 도움이 필요하신가요?'
        ];

        businessWelcomeMessages.forEach((message, index) => {
            setTimeout(() => {
                this.addMessage(message, APP_CONFIG.MESSAGE_TYPES.BOT);
                
                // 메시지별 캐릭터 상태 변경
                if (index === 0) {
                    this.setCharacterState(APP_CONFIG.CHARACTER_STATES.HAPPY);
                } else if (index === 1) {
                    this.setCharacterState(APP_CONFIG.CHARACTER_STATES.THINKING);
                } else {
                    this.setCharacterState(APP_CONFIG.CHARACTER_STATES.IDLE);
                }
            }, index * 1500);
        });
    }

    // 비즈니스 컨텍스트 분석 (함수명 오타 수정)
    analyzeBusinessContext(userMessage) {
        const businessKeywords = {
            urgent: ['급해', '긴급', '빨리', '즉시', '오늘'],
            meeting: ['회의', '미팅', '회의실', '참석자', '안건'],
            financial: ['매출', '수익', '비용', '예산', '투자', '재무'],
            strategy: ['전략', '계획', '목표', '방향', '비전'],
            customer: ['고객', '클라이언트', '사용자', '만족도'],
            team: ['팀', '직원', '인사', '조직', '리더십'],
            marketing: ['마케팅', '광고', '홍보', '브랜드', '캠페인'],
            data: ['데이터', '분석', '통계', '지표', '성과']
        };

        const context = {
            priority: 'normal',
            category: 'general',
            tone: 'professional'
        };

        // 우선순위 판단
        if (businessKeywords.urgent.some(word => userMessage.includes(word))) {
            context.priority = 'high';
            context.tone = 'focused';
        }

        // 카테고리 판단
        for (const [category, keywords] of Object.entries(businessKeywords)) {
            if (keywords.some(word => userMessage.includes(word))) {
                context.category = category;
                break;
            }
        }

        return context;
    }

    // 시간 포맷팅
    formatTime(date) {
        return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // 설정 저장
    saveSettings() {
        const settings = {
            voice: this.elements.voiceSelect?.selectedIndex || 0,
            rate: this.tts.settings.rate,
            pitch: this.tts.settings.pitch,
            volume: this.tts.settings.volume
        };

        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.VOICE_SETTINGS, JSON.stringify(settings));
    }

    // 설정 로드
    loadSettings() {
        try {
            const saved = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.VOICE_SETTINGS);
            if (saved) {
                const settings = JSON.parse(saved);
                
                if (this.elements.voiceSelect && settings.voice !== undefined) {
                    this.elements.voiceSelect.selectedIndex = settings.voice;
                    this.tts.setVoice(settings.voice);
                }
                
                if (settings.rate !== undefined) {
                    this.tts.setRate(settings.rate);
                    if (this.elements.speedRange) {
                        this.elements.speedRange.value = settings.rate;
                        this.elements.speedValue.textContent = settings.rate.toFixed(1);
                    }
                }
                
                if (settings.pitch !== undefined) {
                    this.tts.setPitch(settings.pitch);
                    if (this.elements.pitchRange) {
                        this.elements.pitchRange.value = settings.pitch;
                        this.elements.pitchValue.textContent = settings.pitch.toFixed(1);
                    }
                }
            }
        } catch (error) {
            console.error('설정 로드 실패:', error);
        }
    }

    // 애플리케이션 정리
    destroy() {
        // 3D 씬 정리
        if (this.threeScene) {
            this.threeScene.destroy();
        }
        
        // 기존 정리 코드
        this.character?.destroy();
        this.stt?.destroy();
        this.tts?.destroy();
        
        if (this.ttsLipSyncInterval) {
            clearInterval(this.ttsLipSyncInterval);
        }
        
        this.saveSettings();
    }
}

// DOM 로드 완료 후 애플리케이션 시작
document.addEventListener('DOMContentLoaded', () => {
    window.chatbotApp = new ChatbotApp();
    
    // 페이지 언로드 시 정리
    window.addEventListener('beforeunload', () => {
        if (window.chatbotApp) {
            window.chatbotApp.destroy();
        }
    });
});

// DOM 로드 완료 후 애플리케이션 시작 - 강화된 버전
function initializeApp() {
    console.log('🚀 ChatbotApp 초기화 시작...');
    console.log('DOM 상태:', document.readyState);
    
    try {
        window.chatbotApp = new ChatbotApp();
        console.log('✅ ChatbotApp 생성 완료');
    } catch (error) {
        console.error('❌ ChatbotApp 초기화 실패:', error);
        console.error('에러 스택:', error.stack);
    }
}

// 여러 방법으로 초기화 시도
if (document.readyState === 'loading') {
    console.log('📝 DOM 로딩 중... DOMContentLoaded 대기');
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    console.log('📝 DOM 이미 로드됨, 즉시 초기화');
    initializeApp();
}

// 추가 안전망
window.addEventListener('load', () => {
    if (!window.chatbotApp) {
        console.log('⚠️ window.load에서 재시도');
        initializeApp();
    }
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    if (window.chatbotApp) {
        window.chatbotApp.destroy();
    }
});

// 수동 초기화 함수 (디버깅용)
window.manualInit = initializeApp;

