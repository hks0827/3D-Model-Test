// 2D 캐릭터 애니메이션 관리 클래스
class Character {
    constructor(characterElement) {
        this.element = characterElement;
        this.currentState = APP_CONFIG.CHARACTER_STATES.IDLE;
        this.mouthElement = document.getElementById('characterMouth');
        this.isAnimating = false;
        this.speechAnalyzer = null;
        this.voiceVisualization = null;
        
        this.init();
    }

    init() {
        this.createVoiceVisualization();
        this.setupEventListeners();
        this.setState(APP_CONFIG.CHARACTER_STATES.IDLE);
    }

    // 음성 시각화 요소 생성
    createVoiceVisualization() {
        const visualizationDiv = document.createElement('div');
        visualizationDiv.className = 'voice-visualization';
        visualizationDiv.id = 'voiceVisualization';
        
        // 음성 바 생성
        for (let i = 0; i < 5; i++) {
            const bar = document.createElement('div');
            bar.className = 'voice-bar';
            visualizationDiv.appendChild(bar);
        }
        
        this.element.parentElement.appendChild(visualizationDiv);
        this.voiceVisualization = visualizationDiv;
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 캐릭터 클릭 이벤트
        this.element.addEventListener('click', () => {
            this.playClickAnimation();
        });

        // 마우스 호버 효과
        this.element.addEventListener('mouseenter', () => {
            if (this.currentState === APP_CONFIG.CHARACTER_STATES.IDLE) {
                this.element.style.transform = 'scale(1.05)';
            }
        });

        this.element.addEventListener('mouseleave', () => {
            if (this.currentState === APP_CONFIG.CHARACTER_STATES.IDLE) {
                this.element.style.transform = 'scale(1)';
            }
        });
    }

    // 캐릭터 상태 변경
    setState(newState, duration = null) {
        if (this.currentState === newState) return;

        // 이전 상태 클래스 제거
        this.element.classList.remove(this.currentState);
        
        // 새로운 상태 클래스 추가
        this.element.classList.add(newState);
        this.currentState = newState;

        // 상태별 특수 효과
        this.handleStateChange(newState);

        // 지정된 시간 후 idle 상태로 복귀
        if (duration) {
            setTimeout(() => {
                this.setState(APP_CONFIG.CHARACTER_STATES.IDLE);
            }, duration);
        }

        console.log(`캐릭터 상태 변경: ${newState}`);
    }

    // 상태별 특수 효과 처리
    handleStateChange(state) {
        switch (state) {
            case APP_CONFIG.CHARACTER_STATES.TALKING:
                this.startTalkingAnimation();
                break;
            case APP_CONFIG.CHARACTER_STATES.LISTENING:
                this.startListeningAnimation();
                break;
            case APP_CONFIG.CHARACTER_STATES.THINKING:
                this.startThinkingAnimation();
                break;
            case APP_CONFIG.CHARACTER_STATES.HAPPY:
                this.setMouthShape(APP_CONFIG.MOUTH_SHAPES.SMILE);
                this.createParticleEffect();
                break;
            case APP_CONFIG.CHARACTER_STATES.IDLE:
                this.stopAllAnimations();
                this.setMouthShape(APP_CONFIG.MOUTH_SHAPES.CLOSED);
                break;
        }
    }

    // 말하기 애니메이션 시작
    startTalkingAnimation() {
        this.stopVoiceVisualization();
        let mouthStates = [
            APP_CONFIG.MOUTH_SHAPES.OPEN,
            APP_CONFIG.MOUTH_SHAPES.CLOSED
        ];
        let currentIndex = 0;

        this.talkingInterval = setInterval(() => {
            this.setMouthShape(mouthStates[currentIndex]);
            currentIndex = (currentIndex + 1) % mouthStates.length;
        }, 200);
    }

    // 듣기 애니메이션 시작
    startListeningAnimation() {
        this.setMouthShape(APP_CONFIG.MOUTH_SHAPES.CLOSED);
        this.startVoiceVisualization();
    }

    // 생각하기 애니메이션 시작
    startThinkingAnimation() {
        this.setMouthShape(APP_CONFIG.MOUTH_SHAPES.CLOSED);
        
        // 점점 커지는 효과
        let scale = 1;
        let direction = 1;
        
        this.thinkingInterval = setInterval(() => {
            scale += direction * 0.02;
            if (scale >= 1.1) direction = -1;
            if (scale <= 1) direction = 1;
            
            this.element.style.transform = `scale(${scale})`;
        }, 100);
    }

    // 입 모양 변경
    setMouthShape(shape) {
        if (!this.mouthElement) return;

        // 모든 입 모양 클래스 제거
        Object.values(APP_CONFIG.MOUTH_SHAPES).forEach(mouthShape => {
            this.mouthElement.classList.remove(mouthShape);
        });

        // 새로운 입 모양 적용
        this.mouthElement.classList.add(shape);
    }

    // 음성 시각화 시작
    startVoiceVisualization() {
        if (!this.voiceVisualization) return;

        this.voiceVisualization.classList.add('active');
        
        // 오디오 분석기가 있으면 실제 오디오 데이터 사용
        if (this.speechAnalyzer) {
            this.updateVisualizationFromAudio();
        } else {
            // 기본 애니메이션
            this.animateVoiceBars();
        }
    }

    // 음성 시각화 중지
    stopVoiceVisualization() {
        if (!this.voiceVisualization) return;
        
        this.voiceVisualization.classList.remove('active');
        
        if (this.visualizationInterval) {
            clearInterval(this.visualizationInterval);
        }
    }

    // 음성 바 애니메이션
    animateVoiceBars() {
        const bars = this.voiceVisualization.querySelectorAll('.voice-bar');
        
        this.visualizationInterval = setInterval(() => {
            bars.forEach((bar, index) => {
                const height = Math.random() * 20 + 5;
                bar.style.height = `${height}px`;
                bar.style.animationDelay = `${index * 0.1}s`;
            });
        }, 100);
    }

    // 실제 오디오 데이터로 시각화 업데이트
    updateVisualizationFromAudio() {
        if (!this.speechAnalyzer || !this.voiceVisualization) return;

        const bars = this.voiceVisualization.querySelectorAll('.voice-bar');
        const dataArray = this.speechAnalyzer.getFrequencyData();
        
        const step = Math.floor(dataArray.length / bars.length);
        
        bars.forEach((bar, index) => {
            const value = dataArray[index * step];
            const height = (value / 255) * 25 + 4;
            bar.style.height = `${height}px`;
        });

        if (this.currentState === APP_CONFIG.CHARACTER_STATES.LISTENING) {
            requestAnimationFrame(() => this.updateVisualizationFromAudio());
        }
    }

    // 파티클 효과 생성
    createParticleEffect() {
        const particleCount = 8;
        const container = this.element.parentElement;
        
        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                const angle = (i / particleCount) * 2 * Math.PI;
                const radius = 120;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                particle.style.left = `${this.element.offsetLeft + this.element.offsetWidth/2 + x}px`;
                particle.style.top = `${this.element.offsetTop + this.element.offsetHeight/2 + y}px`;
                
                container.appendChild(particle);
                
                // 2초 후 제거
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 2000);
            }, i * 100);
        }
    }

    // 클릭 애니메이션
    playClickAnimation() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.setState(APP_CONFIG.CHARACTER_STATES.EXCITED, 800);
        
        setTimeout(() => {
            this.isAnimating = false;
        }, 800);
    }

    // 모든 애니메이션 중지
    stopAllAnimations() {
        if (this.talkingInterval) {
            clearInterval(this.talkingInterval);
            this.talkingInterval = null;
        }
        
        if (this.thinkingInterval) {
            clearInterval(this.thinkingInterval);
            this.thinkingInterval = null;
        }
        
        if (this.visualizationInterval) {
            clearInterval(this.visualizationInterval);
            this.visualizationInterval = null;
        }
        
        this.stopVoiceVisualization();
        this.element.style.transform = '';
    }

    // 오디오 분석기 설정
    setSpeechAnalyzer(analyzer) {
        this.speechAnalyzer = analyzer;
    }

    // 캐릭터 상태 반환
    getCurrentState() {
        return this.currentState;
    }

    // 감정 표현
    expressEmotion(emotion, duration = 2000) {
        const emotionMap = {
            'happy': APP_CONFIG.CHARACTER_STATES.HAPPY,
            'sad': APP_CONFIG.CHARACTER_STATES.SAD,
            'excited': APP_CONFIG.CHARACTER_STATES.EXCITED,
            'thinking': APP_CONFIG.CHARACTER_STATES.THINKING
        };

        const state = emotionMap[emotion] || APP_CONFIG.CHARACTER_STATES.IDLE;
        this.setState(state, duration);
    }

    // 정리
    destroy() {
        this.stopAllAnimations();
        if (this.voiceVisualization && this.voiceVisualization.parentNode) {
            this.voiceVisualization.parentNode.removeChild(this.voiceVisualization);
        }
    }
}

// 전역에서 사용할 수 있도록 설정
window.Character = Character;