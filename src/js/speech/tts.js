// Text-to-Speech 기능 관리 클래스
class TextToSpeech {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.isSupported = this.checkSupport();
        this.isSpeaking = false;
        this.voices = [];
        this.currentVoice = null;
        
        this.settings = {
            rate: APP_CONFIG.TTS_CONFIG.RATE,
            pitch: APP_CONFIG.TTS_CONFIG.PITCH,
            volume: APP_CONFIG.TTS_CONFIG.VOLUME,
            language: APP_CONFIG.TTS_CONFIG.LANGUAGE
        };

        this.callbacks = {
            onStart: null,
            onEnd: null,
            onError: null,
            onPause: null,
            onResume: null
        };

        if (this.isSupported) {
            this.loadVoices();
            this.setupEventListeners();
        }
    }

    // 브라우저 지원 확인
    checkSupport() {
        return 'speechSynthesis' in window;
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 음성 목록 변경 감지
        this.synthesis.addEventListener('voiceschanged', () => {
            this.loadVoices();
        });
    }

    // 사용 가능한 음성 로드
    loadVoices() {
        this.voices = this.synthesis.getVoices();
        
        // 한국어 음성 우선 선택
        const koreanVoice = this.voices.find(voice => 
            voice.lang.startsWith('ko') || voice.lang.includes('KR')
        );
        
        if (koreanVoice) {
            this.currentVoice = koreanVoice;
        } else if (this.voices.length > 0) {
            this.currentVoice = this.voices[0];
        }

        console.log(`사용 가능한 음성: ${this.voices.length}개`);
        console.log('선택된 음성:', this.currentVoice?.name);
    }

    // 텍스트 음성 변환
    speak(text, options = {}) {
        if (!this.isSupported) {
            throw new Error(APP_CONFIG.ERROR_MESSAGES.TTS_NOT_SUPPORTED);
        }

        if (!text || text.trim().length === 0) {
            console.warn('음성 변환할 텍스트가 없습니다.');
            return;
        }

        // 현재 음성 중지
        this.stop();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // 설정 적용
        utterance.voice = options.voice || this.currentVoice;
        utterance.rate = options.rate || this.settings.rate;
        utterance.pitch = options.pitch || this.settings.pitch;
        utterance.volume = options.volume || this.settings.volume;
        utterance.lang = options.language || this.settings.language;

        // 이벤트 리스너 설정
        utterance.onstart = () => {
            this.isSpeaking = true;
            console.log('음성 출력 시작');
            if (this.callbacks.onStart) {
                this.callbacks.onStart(text);
            }
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            console.log('음성 출력 완료');
            if (this.callbacks.onEnd) {
                this.callbacks.onEnd(text);
            }
        };

        utterance.onerror = (event) => {
            this.isSpeaking = false;
            console.error('음성 출력 에러:', event.error);
            
            let errorMessage = APP_CONFIG.ERROR_MESSAGES.UNKNOWN_ERROR;
            
            switch (event.error) {
                case 'not-allowed':
                    errorMessage = '음성 출력이 허용되지 않습니다.';
                    break;
                case 'audio-busy':
                    errorMessage = '오디오 장치가 사용 중입니다.';
                    break;
                case 'audio-hardware':
                    errorMessage = '오디오 하드웨어 문제가 발생했습니다.';
                    break;
                case 'network':
                    errorMessage = APP_CONFIG.ERROR_MESSAGES.NETWORK_ERROR;
                    break;
                case 'synthesis-unavailable':
                    errorMessage = '음성 합성을 사용할 수 없습니다.';
                    break;
            }
            
            if (this.callbacks.onError) {
                this.callbacks.onError(errorMessage);
            }
        };

        utterance.onpause = () => {
            console.log('음성 출력 일시정지');
            if (this.callbacks.onPause) {
                this.callbacks.onPause();
            }
        };

        utterance.onresume = () => {
            console.log('음성 출력 재개');
            if (this.callbacks.onResume) {
                this.callbacks.onResume();
            }
        };

        // 음성 출력 시작
        this.synthesis.speak(utterance);
        
        return utterance;
    }

    // 음성 출력 중지
    stop() {
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
            this.isSpeaking = false;
        }
    }

    // 음성 출력 일시정지
    pause() {
        if (this.synthesis.speaking && !this.synthesis.paused) {
            this.synthesis.pause();
        }
    }

    // 음성 출력 재개
    resume() {
        if (this.synthesis.paused) {
            this.synthesis.resume();
        }
    }

    // 텍스트를 청크로 나누어 음성 출력 (긴 텍스트 처리)
    speakLongText(text, chunkSize = 200) {
        if (!text || text.trim().length === 0) return;

        const chunks = this.splitTextIntoChunks(text, chunkSize);
        let currentChunk = 0;

        const speakNextChunk = () => {
            if (currentChunk >= chunks.length) {
                if (this.callbacks.onEnd) {
                    this.callbacks.onEnd(text);
                }
                return;
            }

            const chunk = chunks[currentChunk];
            const utterance = this.speak(chunk);

            utterance.onend = () => {
                currentChunk++;
                setTimeout(() => speakNextChunk(), 100); // 청크 간 짧은 대기
            };
        };

        speakNextChunk();
    }

    // 텍스트를 청크로 분할
    splitTextIntoChunks(text, chunkSize) {
        const sentences = text.split(/[.!?。！？]/);
        const chunks = [];
        let currentChunk = '';

        sentences.forEach(sentence => {
            const trimmedSentence = sentence.trim();
            if (!trimmedSentence) return;

            if (currentChunk.length + trimmedSentence.length <= chunkSize) {
                currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
            } else {
                if (currentChunk) {
                    chunks.push(currentChunk);
                }
                currentChunk = trimmedSentence;
            }
        });

        if (currentChunk) {
            chunks.push(currentChunk);
        }

        return chunks;
    }

    // 사용 가능한 음성 목록 반환
    getVoices() {
        return this.voices;
    }

    // 한국어 음성만 필터링
    getKoreanVoices() {
        return this.voices.filter(voice => 
            voice.lang.startsWith('ko') || voice.lang.includes('KR')
        );
    }

    // 음성 선택
    setVoice(voiceIndex) {
        if (voiceIndex >= 0 && voiceIndex < this.voices.length) {
            this.currentVoice = this.voices[voiceIndex];
            console.log('음성 변경:', this.currentVoice.name);
        }
    }

    // 음성 이름으로 선택
    setVoiceByName(voiceName) {
        const voice = this.voices.find(v => v.name === voiceName);
        if (voice) {
            this.currentVoice = voice;
            console.log('음성 변경:', this.currentVoice.name);
        }
    }

    // 설정 업데이트
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }

    // 말하기 속도 설정
    setRate(rate) {
        this.settings.rate = Math.max(0.1, Math.min(10, rate));
    }

    // 음성 높이 설정
    setPitch(pitch) {
        this.settings.pitch = Math.max(0, Math.min(2, pitch));
    }

    // 볼륨 설정
    setVolume(volume) {
        this.settings.volume = Math.max(0, Math.min(1, volume));
    }

    // 언어 설정
    setLanguage(language) {
        this.settings.language = language;
    }

    // 콜백 함수 설정
    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    // 현재 상태 반환
    getStatus() {
        return {
            isSupported: this.isSupported,
            isSpeaking: this.isSpeaking,
            isPaused: this.synthesis.paused,
            voiceCount: this.voices.length,
            currentVoice: this.currentVoice?.name,
            settings: { ...this.settings }
        };
    }

    // 텍스트 전처리 (이모지, 특수문자 등 처리)
    preprocessText(text) {
        return text
            // 이모지 제거
            .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, '')
            // 연속된 공백 정리
            .replace(/\s+/g, ' ')
            // 특수 기호 처리
            .replace(/\*\*(.*?)\*\*/g, '$1') // 볼드 마크다운
            .replace(/\*(.*?)\*/g, '$1') // 이탤릭 마크다운
            .replace(/`(.*?)`/g, '$1') // 코드 마크다운
            // URL 처리
            .replace(/https?:\/\/[^\s]+/g, '링크')
            // 이메일 처리
            .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '이메일 주소')
            .trim();
    }

    // 감정 분석 기반 음성 조정
    adjustVoiceForEmotion(emotion) {
        const emotionSettings = {
            happy: { rate: 1.1, pitch: 1.2 },
            sad: { rate: 0.8, pitch: 0.8 },
            excited: { rate: 1.3, pitch: 1.3 },
            calm: { rate: 0.9, pitch: 1.0 },
            angry: { rate: 1.2, pitch: 0.7 },
            surprised: { rate: 1.0, pitch: 1.4 }
        };

        if (emotionSettings[emotion]) {
            return {
                ...this.settings,
                ...emotionSettings[emotion]
            };
        }

        return this.settings;
    }

    // 음성 테스트
    testVoice(text = '안녕하세요. 음성 테스트입니다.') {
        this.speak(text);
    }

    // 정리
    destroy() {
        this.stop();
        this.callbacks = {
            onStart: null,
            onEnd: null,
            onError: null,
            onPause: null,
            onResume: null
        };
    }
}

// 전역에서 사용할 수 있도록 설정
window.TextToSpeech = TextToSpeech;