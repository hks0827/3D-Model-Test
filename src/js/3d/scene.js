// src/js/3d/scene.js - Three.js 씬 관리
class ThreeScene {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.character = null;
        this.animationId = null;
        
        this.init();
    }

    init() {
        // 씬 생성
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);

        // 카메라 설정
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 1.6, 3);

        // 렌더러 설정
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.container.appendChild(this.renderer.domElement);

        // 조명 설정
        this.setupLighting();

        // 3D 캐릭터 생성
        this.createCharacter();

        // 렌더링 시작
        this.animate();

        // 리사이즈 이벤트
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLighting() {
        // 환경광
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // 주 조명
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(-1, 1, 1);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // 보조 조명 (얼굴 밝게)
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(1, 0, 1);
        this.scene.add(fillLight);
    }

    createCharacter() {
        try {
            console.log('캐릭터 생성 시작...');
            
            // 우선순위: BusinessCharacter > RealCharacter3D > Character3D
            if (typeof BusinessCharacter !== 'undefined') {
                console.log('✅ BusinessCharacter 사용 - 전문 비즈니스 아바타');
                this.character = new BusinessCharacter(this.scene);
                
            } else if (typeof RealCharacter3D !== 'undefined') {
                console.log('✅ RealCharacter3D 사용 - 실제 3D 모델');
                this.character = new RealCharacter3D(this.scene);
                
            } else if (typeof Character3D !== 'undefined') {
                console.log('✅ Character3D 사용 - 기본 3D 캐릭터');
                this.character = new Character3D(this.scene);
                
            } else {
                throw new Error('사용 가능한 캐릭터 클래스가 없습니다');
            }
            
            console.log('✅ 캐릭터 생성 완료');
            
        } catch (error) {
            console.error('캐릭터 생성 실패:', error);
            this.createSimpleCharacter();
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // 캐릭터 업데이트
        if (this.character) {
            this.character.update();
        }

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.character) {
            this.character.destroy();
        }
        
        if (this.renderer) {
            this.container.removeChild(this.renderer.domElement);
            this.renderer.dispose();
        }
    }
}

// src/js/3d/character3d.js - 3D 캐릭터 클래스
class Character3D {
    constructor(scene) {
        this.scene = scene;
        this.mesh = null;
        this.head = null;
        this.eyes = [];
        this.mouth = null;
        this.currentState = 'idle';
        this.mixer = null;
        this.actions = {};
        this.morphTargets = {};
        
        this.createCharacter();
        this.setupAnimations();
    }

    createCharacter() {
        // 머리 생성
        const headGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0xffdbac,
            roughness: 0.8,
            metalness: 0.0
        });
        
        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.head.position.y = 1.5;
        this.head.castShadow = true;
        this.scene.add(this.head);

        // 몸 생성
        const bodyGeometry = new THREE.CapsuleGeometry(0.3, 1.2, 4, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x4ecdc4,
            roughness: 0.7,
            metalness: 0.1
        });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.6;
        body.castShadow = true;
        this.scene.add(body);

        // 눈 생성
        this.createEyes();
        
        // 입 생성
        this.createMouth();

        // 전체 캐릭터 그룹
        this.mesh = new THREE.Group();
        this.mesh.add(this.head);
        this.mesh.add(body);
        this.scene.add(this.mesh);
    }

    createEyes() {
        // 왼쪽 눈
        const leftEyeGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(leftEyeGeometry, eyeMaterial);
        leftEye.position.set(-0.15, 0.1, 0.4);
        this.head.add(leftEye);

        // 오른쪽 눈
        const rightEye = new THREE.Mesh(leftEyeGeometry, eyeMaterial);
        rightEye.position.set(0.15, 0.1, 0.4);
        this.head.add(rightEye);

        this.eyes = [leftEye, rightEye];
    }

    createMouth() {
        const mouthGeometry = new THREE.RingGeometry(0.05, 0.1, 8);
        const mouthMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x000000,
            side: THREE.DoubleSide 
        });
        
        this.mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        this.mouth.position.set(0, -0.15, 0.4);
        this.mouth.rotation.x = Math.PI / 2;
        this.head.add(this.mouth);
    }

    setupAnimations() {
        // 애니메이션 믹서 생성
        this.mixer = new THREE.AnimationMixer(this.mesh);

        // 기본 애니메이션들
        this.createIdleAnimation();
        this.createTalkingAnimation();
        this.createListeningAnimation();
    }

    createIdleAnimation() {
        // 호흡 애니메이션
        const times = [0, 1, 2];
        const values = [1, 1.02, 1];
        
        const scaleTrack = new THREE.VectorKeyframeTrack(
            '.scale',
            times,
            values.flatMap(v => [v, v, v])
        );

        const clip = new THREE.AnimationClip('idle', 2, [scaleTrack]);
        const action = this.mixer.clipAction(clip);
        action.loop = THREE.LoopRepeat;
        
        this.actions.idle = action;
    }

    createTalkingAnimation() {
        // 입 움직임 애니메이션
        const times = [0, 0.1, 0.2, 0.3, 0.4];
        const scaleValues = [1, 1.5, 1, 1.8, 1];
        
        const mouthScaleTrack = new THREE.VectorKeyframeTrack(
            'mouth.scale',
            times,
            scaleValues.flatMap(v => [v, v, 1])
        );

        const clip = new THREE.AnimationClip('talking', 0.4, [mouthScaleTrack]);
        const action = this.mixer.clipAction(clip);
        action.loop = THREE.LoopRepeat;
        
        this.actions.talking = action;
    }

    createListeningAnimation() {
        // 머리 기울이기 애니메이션
        const times = [0, 1, 2];
        const rotationValues = [0, 0.1, 0];
        
        const rotationTrack = new THREE.NumberKeyframeTrack(
            'head.rotation[z]',
            times,
            rotationValues
        );

        const clip = new THREE.AnimationClip('listening', 2, [rotationTrack]);
        const action = this.mixer.clipAction(clip);
        action.loop = THREE.LoopRepeat;
        
        this.actions.listening = action;
    }

    // 상태 변경
    setState(newState) {
        if (this.currentState === newState) return;

        // 현재 애니메이션 중지
        if (this.actions[this.currentState]) {
            this.actions[this.currentState].fadeOut(0.5);
        }

        // 새 애니메이션 시작
        if (this.actions[newState]) {
            this.actions[newState].reset().fadeIn(0.5).play();
        }

        this.currentState = newState;

        // 상태별 특수 효과
        this.applyStateEffects(newState);
    }

    applyStateEffects(state) {
        switch (state) {
            case 'talking':
                this.head.material.color.setHex(0xff6b6b);
                break;
            case 'listening':
                this.head.material.color.setHex(0x4ecdc4);
                break;
            case 'thinking':
                this.head.material.color.setHex(0xfeca57);
                break;
            default:
                this.head.material.color.setHex(0xffdbac);
        }
    }

    // 립싱크 (음성 분석 기반)
    updateLipSync(audioData) {
        if (!audioData || !this.mouth) return;

        // 오디오 레벨에 따른 입 크기 조절
        const averageLevel = audioData.reduce((a, b) => a + b) / audioData.length;
        const normalizedLevel = averageLevel / 255;
        
        const targetScale = 1 + normalizedLevel * 2;
        this.mouth.scale.x = THREE.MathUtils.lerp(this.mouth.scale.x, targetScale, 0.3);
        this.mouth.scale.y = THREE.MathUtils.lerp(this.mouth.scale.y, targetScale, 0.3);
    }

    // 눈 깜빡임
    blink() {
        this.eyes.forEach(eye => {
            eye.scale.y = 0.1;
            setTimeout(() => {
                eye.scale.y = 1;
            }, 150);
        });
    }

    update() {
        // 애니메이션 믹서 업데이트
        if (this.mixer) {
            this.mixer.update(0.016); // 60fps 가정
        }

        // 랜덤 눈 깜빡임
        if (Math.random() < 0.01) {
            this.blink();
        }

        // 마우스 추적 (시선)
        this.updateGaze();
    }

    updateGaze() {
        // 간단한 시선 추적 (마우스 위치 기반)
        const mouseX = (window.mouseX || 0) / window.innerWidth * 2 - 1;
        const mouseY = -(window.mouseY || 0) / window.innerHeight * 2 + 1;

        this.eyes.forEach(eye => {
            eye.rotation.y = mouseX * 0.1;
            eye.rotation.x = mouseY * 0.1;
        });
    }

    destroy() {
        if (this.mixer) {
            this.mixer.stopAllAction();
        }
        
        if (this.mesh) {
            this.scene.remove(this.mesh);
        }
    }
}

// 마우스 위치 추적
document.addEventListener('mousemove', (event) => {
    window.mouseX = event.clientX;
    window.mouseY = event.clientY;
});

// 전역에서 사용할 수 있도록 설정
window.ThreeScene = ThreeScene;
window.Character3D = Character3D;