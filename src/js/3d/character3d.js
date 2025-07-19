console.log('Character3D 파일 로드 시작...');

class Character3D {
    constructor(scene) {
        console.log('Character3D 생성자 호출됨');
        this.scene = scene;
        this.mesh = null;
        this.head = null;
        this.eyes = [];
        this.mouth = null;
        this.currentState = 'idle';
        this.mixer = null;
        this.actions = {};
        
        this.createCharacter();
        this.setupAnimations();
    }

    createCharacter() {
        console.log('Character3D createCharacter 시작...');
        
        // 전체 캐릭터 그룹
        this.mesh = new THREE.Group();
        
        // 머리 생성
        const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({
            color: 0xffdbac
        });
        
        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.head.position.y = 1.5;
        this.head.castShadow = true;
        this.mesh.add(this.head);

        // 몸체 생성 (CapsuleGeometry 대신 간단한 조합)
        this.createSimpleBody();

        // 눈 생성
        this.createEyes();
        
        // 입 생성
        this.createMouth();

        // 씬에 추가
        this.scene.add(this.mesh);
        
        console.log('✅ Character3D 생성 완료');
    }

    // 간단한 몸체 생성
    createSimpleBody() {
        // 몸통 (원통형)
        const bodyGeometry = new THREE.CylinderGeometry(0.25, 0.3, 1.0, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({
            color: 0x4ecdc4
        });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;
        body.castShadow = true;
        this.mesh.add(body);

        // 어깨 (구체)
        const shoulderGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const shoulder = new THREE.Mesh(shoulderGeometry, bodyMaterial);
        shoulder.position.y = 1.0;
        shoulder.scale.y = 0.5;
        this.mesh.add(shoulder);
    }

    createEyes() {
        // 왼쪽 눈
        const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.15, 0.1, 0.35);
        this.head.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.15, 0.1, 0.35);
        this.head.add(rightEye);

        this.eyes = [leftEye, rightEye];
    }

    createMouth() {
        // 입 (간단한 구체)
        const mouthGeometry = new THREE.SphereGeometry(0.04, 8, 8);
        const mouthMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x000000
        });
        
        this.mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        this.mouth.position.set(0, -0.15, 0.35);
        this.mouth.scale.set(1.5, 0.5, 1);
        this.head.add(this.mouth);
    }

    setupAnimations() {
        // 애니메이션 믹서 생성
        this.mixer = new THREE.AnimationMixer(this.mesh);

        // 기본 호흡 애니메이션
        this.createBreathingAnimation();
    }

    createBreathingAnimation() {
        // 간단한 위아래 움직임
        const times = [0, 1, 2];
        const values = [0, 0.05, 0];
        
        const track = new THREE.NumberKeyframeTrack('.position[y]', times, values);
        const clip = new THREE.AnimationClip('breathing', 2, [track]);
        
        const action = this.mixer.clipAction(clip);
        action.loop = THREE.LoopRepeat;
        action.play();
        
        this.actions.idle = action;
    }

    // 상태 변경
    setState(newState) {
        console.log(`3D 캐릭터 상태: ${newState}`);
        this.currentState = newState;
        this.updateAppearance(newState);
    }

    updateAppearance(state) {
        if (!this.head || !this.head.material) return;
        
        const material = this.head.material;
        
        switch (state) {
            case 'talking':
                material.color.setHex(0xffcdb2);
                this.animateMouth(true);
                break;
            case 'listening':
                material.color.setHex(0xe8f4fd);
                this.animateMouth(false);
                break;
            case 'thinking':
                material.color.setHex(0xfff4e6);
                this.animateMouth(false);
                break;
            default:
                material.color.setHex(0xffdbac);
                this.animateMouth(false);
        }
    }

    animateMouth(talking) {
        if (!this.mouth) return;
        
        if (talking) {
            // 말할 때 입 크기 변화
            this.mouth.scale.y = 0.8 + Math.sin(Date.now() * 0.01) * 0.3;
        } else {
            // 기본 크기
            this.mouth.scale.y = 0.5;
        }
    }

    // 립싱크
    updateLipSync(audioData) {
        if (!audioData || !this.mouth) return;
        
        const average = audioData.reduce((a, b) => a + b) / audioData.length;
        const normalized = average / 255;
        const scale = 0.5 + normalized * 0.5;
        
        this.mouth.scale.y = scale;
    }

    // 눈 깜빡임
    blink() {
        this.eyes.forEach(eye => {
            const originalScale = eye.scale.y;
            eye.scale.y = 0.1;
            setTimeout(() => {
                eye.scale.y = originalScale;
            }, 150);
        });
    }

    update() {
        // 애니메이션 믹서 업데이트
        if (this.mixer) {
            this.mixer.update(0.016);
        }

        // 랜덤 깜빡임
        if (Math.random() < 0.003) {
            this.blink();
        }

        // 상태별 특수 애니메이션
        if (this.currentState === 'talking') {
            this.animateMouth(true);
        }
    }

    destroy() {
        if (this.mixer) {
            this.mixer.stopAllAction();
        }
        
        if (this.mesh && this.scene) {
            this.scene.remove(this.mesh);
        }
        
        console.log('Character3D 정리됨');
    }
}

// 전역 설정 (중복 선언 방지)
if (typeof window.Character3D === 'undefined') {
    window.Character3D = Character3D;
    console.log('✅ Character3D 클래스 등록됨');
} else {
    console.log('⚠️ Character3D 이미 존재함');
}