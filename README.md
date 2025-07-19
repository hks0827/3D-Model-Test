<<<<<<< HEAD
# 3D-Model-Test
3D 모델을 테스트하는 repo
=======
# 2D AI 챗봇 프로젝트

음성 인식(STT)과 음성 합성(TTS)을 지원하는 2D 애니메이션 AI 챗봇입니다.

## 🌟 주요 기능

- **2D 캐릭터 애니메이션**: 상태별 애니메이션 (대기, 말하기, 듣기, 생각하기)
- **음성 인식 (STT)**: Web Speech API를 사용한 실시간 음성 인식
- **음성 합성 (TTS)**: 텍스트를 자연스러운 음성으로 변환
- **실시간 채팅**: 텍스트 및 음성 기반 대화
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원
- **음성 시각화**: 실시간 오디오 레벨 표시
- **다크 모드**: 시스템 설정 자동 감지

## 🚀 시작하기

### 필요 조건

- 모던 웹 브라우저 (Chrome, Firefox, Safari, Edge)
- 마이크 접근 권한
- 인터넷 연결

### 설치 및 실행

1. **프로젝트 클론**
```bash
git clone <repository-url>
cd ai-chatbot-2d
```

2. **개발 서버 설치**
```bash
npm install
```

3. **개발 서버 실행**
```bash
npm run dev
```

4. **브라우저에서 접속**
```
http://localhost:3000
```

## 📁 프로젝트 구조

```
ai-chatbot-2d/
├── index.html              # 메인 HTML 파일
├── package.json            # 프로젝트 설정
├── src/
│   ├── js/                 # JavaScript 파일들
│   │   ├── main.js         # 메인 애플리케이션 로직
│   │   ├── character.js    # 2D 캐릭터 애니메이션
│   │   ├── speech/         # 음성 관련 기능
│   │   │   ├── stt.js      # Speech-to-Text
│   │   │   ├── tts.js      # Text-to-Speech
│   │   │   └── audioUtils.js
│   │   └── ai/             # AI 로직
│   ├── css/                # 스타일 파일들
│   │   ├── main.css        # 메인 스타일
│   │   ├── character.css   # 캐릭터 스타일
│   │   └── responsive.css  # 반응형 스타일
│   └── assets/             # 리소스 파일들
├── config/                 # 설정 파일들
└── docs/                   # 문서
```

## 🎯 사용법

### 텍스트 채팅
1. 하단 입력창에 메시지 입력
2. 전송 버튼 클릭 또는 Enter 키 누르기

### 음성 채팅
1. 마이크 버튼 클릭
2. 음성으로 메시지 말하기
3. 자동으로 텍스트 변환 및 응답

### 음성 설정
1. 우하단 설정 버튼 클릭
2. 음성, 속도, 높이 조정

## 🔧 커스터마이징

### 캐릭터 스타일 변경
`src/css/character.css` 파일에서 캐릭터 모양과 애니메이션을 수정할 수 있습니다.

```css
.character {
    background: linear-gradient(45deg, #your-color1, #your-color2);
}
```

### 응답 로직 수정
`src/js/main.js`의 `generateBotResponse` 함수에서 봇 응답 로직을 수정할 수 있습니다.

### API 연동
`config/api.js`에서 외부 AI API (OpenAI, Claude 등)를 연동할 수 있습니다.

## 🌐 브라우저 지원

| 브라우저 | 음성 인식 | 음성 합성 | 지원 여부 |
|---------|----------|----------|----------|
| Chrome  | ✅       | ✅       | 완전 지원 |
| Firefox | ❌       | ✅       | 부분 지원 |
| Safari  | ✅       | ✅       | 완전 지원 |
| Edge    | ✅       | ✅       | 완전 지원 |

## 📱 반응형 지원

- **데스크톱**: 1200px 이상 - 2열 레이아웃
- **태블릿**: 768px - 1024px - 1열 레이아웃
- **모바일**: 768px 이하 - 최적화된 UI

## 🎨 테마

- **라이트 모드**: 기본 밝은 테마
- **다크 모드**: 시스템 설정 자동 감지
- **고대비 모드**: 접근성 향상

## 🔒 개인정보 보호

- 모든 음성 처리는 브라우저에서 로컬로 수행
- 대화 내용은 localStorage에만 저장
- 외부 서버로 음성 데이터 전송 없음

## 🛠 개발 도구

### 개발 서버 시작
```bash
npm run dev
```

### 정적 서버 실행
```bash
npm start
```

### 코드 형식 확인
```bash
npm run lint
```

## 🐛 문제 해결

### 마이크가 작동하지 않는 경우
1. 브라우저 마이크 권한 확인
2. HTTPS 연결 확인 (로컬 개발 시 예외)
3. 브라우저 호환성 확인

### 음성 합성이 작동하지 않는 경우
1. 브라우저 지원 여부 확인
2. 시스템 볼륨 확인
3. 브라우저 음소거 상태 확인

### 캐릭터 애니메이션이 버벅거리는 경우
1. 브라우저 하드웨어 가속 활성화
2. 다른 탭 닫기로 메모리 확보
3. CSS 애니메이션 최적화

## 🚀 향후 계획

- [ ] 실제 AI API 연동 (OpenAI, Claude)
- [ ] 감정 분석 기반 캐릭터 표현
- [ ] 더 다양한 캐릭터 모션
- [ ] 대화 기록 내보내기
- [ ] 다국어 지원
- [ ] PWA (Progressive Web App) 변환

## 📄 라이센스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🤝 기여하기

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 연락처

문의사항이나 버그 리포트는 [Issues](../../issues)를 통해 제출해주세요.

---

**즐거운 코딩하세요! 🎉**
>>>>>>> 40b7fbc (3D)
