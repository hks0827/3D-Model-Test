// 애플리케이션 상수 정의
const APP_CONFIG = {
    // 캐릭터 상태
    CHARACTER_STATES: {
        IDLE: 'idle',
        TALKING: 'talking',
        LISTENING: 'listening',
        THINKING: 'thinking',
        HAPPY: 'happy',
        SAD: 'sad',
        EXCITED: 'excited'
    },

    // 메시지 타입
    MESSAGE_TYPES: {
        USER: 'user-message',
        BOT: 'bot-message',
        SYSTEM: 'system-message'
    },

    // 음성 설정
    SPEECH_CONFIG: {
        LANGUAGE: 'ko-KR',
        MAX_RECORDING_TIME: 10000, // 10초
        SILENCE_DETECTION_TIME: 2000, // 2초
        SAMPLE_RATE: 16000
    },

    // TTS 설정
    TTS_CONFIG: {
        LANGUAGE: 'ko-KR',
        RATE: 1.0,
        PITCH: 1.0,
        VOLUME: 1.0
    },

    // 애니메이션 시간
    ANIMATION_DURATION: {
        CHARACTER_TRANSITION: 300,
        MESSAGE_FADE: 500,
        TYPING_INDICATOR: 1000
    },

    // API 설정
    API_CONFIG: {
        TIMEOUT: 10000,
        MAX_RETRIES: 3,
        RATE_LIMIT: 60 // 분당 요청 수
    },

    // 오디오 시각화
    AUDIO_VISUALIZATION: {
        FFT_SIZE: 256,
        SMOOTHING_TIME: 0.8,
        MIN_DECIBELS: -90,
        MAX_DECIBELS: -10
    },

    // 캐릭터 애니메이션 키프레임
    MOUTH_SHAPES: {
        CLOSED: 'closed',
        OPEN: 'open',
        SMILE: 'smile',
        SURPRISED: 'surprised'
    },

    // 로컬 스토리지 키
    STORAGE_KEYS: {
        VOICE_SETTINGS: 'chatbot_voice_settings',
        CHAT_HISTORY: 'chatbot_chat_history',
        USER_PREFERENCES: 'chatbot_user_preferences'
    },

    // 에러 메시지
    ERROR_MESSAGES: {
        MICROPHONE_ACCESS: '마이크 접근 권한이 필요합니다.',
        SPEECH_NOT_SUPPORTED: '음성 인식이 지원되지 않는 브라우저입니다.',
        TTS_NOT_SUPPORTED: '음성 합성이 지원되지 않는 브라우저입니다.',
        NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
        API_ERROR: 'API 서버에 문제가 발생했습니다.',
        UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.'
    },

    // 성공 메시지
    SUCCESS_MESSAGES: {
        MICROPHONE_READY: '마이크가 준비되었습니다.',
        SPEECH_RECOGNITION_STARTED: '음성 인식을 시작합니다.',
        MESSAGE_SENT: '메시지가 전송되었습니다.'
    }
};

// 전역에서 사용할 수 있도록 설정
window.APP_CONFIG = APP_CONFIG;