// Speech-to-Text 기능 관리 클래스
class SpeechToText {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.isSupported = this.checkSupport();
        this.callbacks = {
            onStart: null,
            onResult: null,
            onEnd: null,
            onError: null
        };
        
        this.audioContext = null;
        this.microphone = null;
        this.analyzer = null;
        
        if (this.isSupported) {
            this.initRecognition();
        }
    }

    // 브라우저 지원 확인
    checkSupport() {
        return ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
    }

    // 음성 인식 초기화
    initRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // 기본 설정
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = APP_CONFIG.SPEECH_CONFIG.LANGUAGE;
        this.recognition.maxAlternatives = 1;
        
        this.setupEventListeners();
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        if (!this.recognition) return;

        // 음성 인식 시작
        this.recognition.onstart = () => {
            this.isListening = true;
            console.log('음성 인식 시작');
            if (this.callbacks.onStart) {
                this.callbacks.onStart();
            }
        };

        // 음성 인식 결과
        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            if (this.callbacks.onResult) {
                this.callbacks.onResult({
                    final: finalTranscript,
                    interim: interimTranscript,
                    confidence: event.results[0] ? event.results[0][0].confidence : 0
                });
            }
        };

        // 음성 인식 종료
        this.recognition.onend = () => {
            this.isListening = false;
            console.log('음성 인식 종료');
            if (this.callbacks.onEnd) {
                this.callbacks.onEnd();
            }
        };

        // 음성 인식 에러
        this.recognition.onerror = (event) => {
            this.isListening = false;
            console.error('음성 인식 에러:', event.error);
            
            let errorMessage = APP_CONFIG.ERROR_MESSAGES.UNKNOWN_ERROR;
            
            switch (event.error) {
                case 'not-allowed':
                    errorMessage = APP_CONFIG.ERROR_MESSAGES.MICROPHONE_ACCESS;
                    break;
                case 'no-speech':
                    errorMessage = '음성이 감지되지 않았습니다. 다시 시도해주세요.';
                    break;
                case 'audio-capture':
                    errorMessage = '오디오 캡처에 실패했습니다.';
                    break;
                case 'network':
                    errorMessage = APP_CONFIG.ERROR_MESSAGES.NETWORK_ERROR;
                    break;
            }
            
            if (this.callbacks.onError) {
                this.callbacks.onError(errorMessage);
            }
        };
    }

    // 마이크 권한 요청 및 오디오 컨텍스트 설정
    async setupAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: APP_CONFIG.SPEECH_CONFIG.SAMPLE_RATE
                } 
            });
            
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.analyzer = this.audioContext.createAnalyser();
            
            this.analyzer.fftSize = APP_CONFIG.AUDIO_VISUALIZATION.FFT_SIZE;
            this.analyzer.smoothingTimeConstant = APP_CONFIG.AUDIO_VISUALIZATION.SMOOTHING_TIME;
            this.analyzer.minDecibels = APP_CONFIG.AUDIO_VISUALIZATION.MIN_DECIBELS;
            this.analyzer.maxDecibels = APP_CONFIG.AUDIO_VISUALIZATION.MAX_DECIBELS;
            
            this.microphone.connect(this.analyzer);
            
            return true;
        } catch (error) {
            console.error('오디오 컨텍스트 설정 실패:', error);
            throw new Error(APP_CONFIG.ERROR_MESSAGES.MICROPHONE_ACCESS);
        }
    }

    // 음성 인식 시작
    async startListening() {
        if (!this.isSupported) {
            throw new Error(APP_CONFIG.ERROR_MESSAGES.SPEECH_NOT_SUPPORTED);
        }

        if (this.isListening) {
            console.log('이미 음성 인식이 실행 중입니다.');
            return;
        }

        try {
            // 오디오 컨텍스트가 없으면 설정
            if (!this.audioContext) {
                await this.setupAudioContext();
            }

            // 오디오 컨텍스트 재개 (브라우저 정책)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            this.recognition.start();
        } catch (error) {
            console.error('음성 인식 시작 실패:', error);
            if (this.callbacks.onError) {
                this.callbacks.onError(error.message);
            }
        }
    }

    // 음성 인식 중지
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    // 오디오 레벨 분석 데이터 반환
    getAudioLevel() {
        if (!this.analyzer) return 0;

        const dataArray = new Uint8Array(this.analyzer.frequencyBinCount);
        this.analyzer.getByteFrequencyData(dataArray);
        
        // 평균 오디오 레벨 계산
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        
        return sum / dataArray.length;
    }

    // 주파수 데이터 반환 (시각화용)
    getFrequencyData() {
        if (!this.analyzer) return new Uint8Array(0);

        const dataArray = new Uint8Array(this.analyzer.frequencyBinCount);
        this.analyzer.getByteFrequencyData(dataArray);
        
        return dataArray;
    }

    // 음성 활동 감지
    detectSpeechActivity() {
        const audioLevel = this.getAudioLevel();
        const threshold = 30; // 임계값 (조정 가능)
        
        return audioLevel > threshold;
    }

    // 콜백 함수 설정
    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    // 언어 설정
    setLanguage(language) {
        if (this.recognition) {
            this.recognition.lang = language;
        }
    }

    // 연속 인식 모드 설정
    setContinuous(continuous) {
        if (this.recognition) {
            this.recognition.continuous = continuous;
        }
    }

    // 중간 결과 표시 설정
    setInterimResults(interim) {
        if (this.recognition) {
            this.recognition.interimResults = interim;
        }
    }

    // 상태 확인
    getStatus() {
        return {
            isSupported: this.isSupported,
            isListening: this.isListening,
            hasAudioContext: !!this.audioContext,
            language: this.recognition ? this.recognition.lang : null
        };
    }

    // 정리
    destroy() {
        this.stopListening();
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        this.microphone = null;
        this.analyzer = null;
        this.recognition = null;
    }
}

// 전역에서 사용할 수 있도록 설정
window.SpeechToText = SpeechToText;