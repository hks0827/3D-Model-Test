console.log('BusinessCharacter 파일 로드 시작...');

class BusinessCharacter {
    constructor(scene) {
        console.log('BusinessCharacter 생성자 호출됨');
        this.scene = scene;
        this.model = null;
        this.mixer = null;
        this.actions = {};
        this.morphTargets = {};
        this.currentState = 'idle';
        this.currentEmotion = 'professional';
        this.isLoading = false;
        this.bones = {};
        this.faceMesh = null;
        this.fallbackCreated = false;
        
        // 비즈니스 컨텍스트 설정
        this.businessContext = {
            mood: 'professional',
            posture: 'upright',
            engagement: 'active'
        };
        
        this.init();
    }

    async init() {
        try {
            console.log('🏢 비즈니스 캐릭터 초기화 시작...');
            
            this.showLoadingIndicator();
            
            // GLTFLoader 확인 및 로드
            await this.ensureGLTFLoader();
            
            // 비즈니스 캐릭터 모델 로드 시도
            await this.loadBusinessModel();
            
        } catch (error) {
            console.error('🚨 BusinessCharacter 로드 실패:', error);
            this.createBusinessFallback();
        } finally {
            this.hideLoadingIndicator();
        }
    }

    showLoadingIndicator() {
        console.log('📋 비즈니스 로딩 표시...');
        // 간단한 로딩 메시지나 스피너
    }

    hideLoadingIndicator() {
        console.log('✅ 로딩 완료');
    }

    // GLTFLoader 보장
    async ensureGLTFLoader() {
        return new Promise((resolve, reject) => {
            // 이미 로드되어 있으면 즉시 반환
            if (typeof THREE.GLTFLoader !== 'undefined') {
                console.log('✅ GLTFLoader 이미 준비됨');
                resolve();
                return;
            }

            console.log('📦 GLTFLoader 로드 중...');
            
            // Three.js r128에 호환되는 GLTFLoader URLs
            const loaderUrls = [
                'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js',
                'https://unpkg.com/three@0.128.0/examples/js/loaders/GLTFLoader.js',
                'https://threejs.org/examples/js/loaders/GLTFLoader.js'
            ];

            let urlIndex = 0;

            const tryLoadGLTF = () => {
                if (urlIndex >= loaderUrls.length) {
                    reject(new Error('모든 GLTFLoader URL에서 로드 실패'));
                    return;
                }

                const script = document.createElement('script');
                script.src = loaderUrls[urlIndex];
                
                script.onload = () => {
                    if (typeof THREE.GLTFLoader !== 'undefined') {
                        console.log('✅ GLTFLoader 로드 성공:', loaderUrls[urlIndex]);
                        resolve();
                    } else {
                        console.log('⚠️ 스크립트 로드됐지만 GLTFLoader 클래스 없음');
                        urlIndex++;
                        tryLoadGLTF();
                    }
                };
                
                script.onerror = () => {
                    console.log('❌ GLTFLoader URL 실패:', loaderUrls[urlIndex]);
                    urlIndex++;
                    tryLoadGLTF();
                };
                
                document.head.appendChild(script);
            };

            tryLoadGLTF();
        });
    }

    // 비즈니스 모델 로드
    async loadBusinessModel() {
        this.isLoading = true;
        
        console.log('🎯 비즈니스 모델 로드 시작...');
        
        // 시도할 모델 경로들 (가벼운 것부터)
        const modelPaths = [
            './src/assets/models/business-character.glb'
        ];

        let loadSuccess = false;

        for (const modelPath of modelPaths) {
            try {
                console.log(`🔍 시도 중: ${modelPath}`);
                
                // 파일 존재 확인
                const response = await fetch(modelPath, { method: 'HEAD' });
                if (!response.ok) {
                    console.log(`❌ 파일 없음: ${modelPath} (${response.status})`);
                    continue;
                }
                
                console.log(`✅ 파일 확인됨: ${modelPath}`);
                
                // GLB 파일 로드
                const gltf = await this.loadGLB(modelPath);
                await this.setupLoadedModel(gltf, modelPath);
                
                loadSuccess = true;
                break;
                
            } catch (error) {
                console.log(`❌ 로드 실패: ${modelPath}`, error.message);
                continue;
            }
        }

        if (!loadSuccess) {
            throw new Error('모든 모델 경로에서 로드 실패');
        }
        
        this.isLoading = false;
    }

    // GLB 파일 로드
    async loadGLB(modelPath) {
        return new Promise((resolve, reject) => {
            const loader = new THREE.GLTFLoader();
            const startTime = Date.now();
            
            loader.load(
                modelPath,
                (gltf) => {
                    const loadTime = Date.now() - startTime;
                    console.log(`🎉 GLB 로드 성공! (${loadTime}ms)`);
                    console.log('📦 모델 정보:', {
                        scene: !!gltf.scene,
                        animations: gltf.animations?.length || 0,
                        cameras: gltf.cameras?.length || 0
                    });
                    resolve(gltf);
                },
                (progress) => {
                    if (progress.lengthComputable) {
                        const percent = (progress.loaded / progress.total * 100).toFixed(1);
                        console.log(`📥 로딩: ${percent}%`);
                    }
                },
                (error) => {
                    console.error('💥 GLB 로드 에러:', error);
                    reject(error);
                }
            );
        });
    }

    // 로드된 모델 설정
    async setupLoadedModel(gltf, modelPath) {
        console.log('🔧 비즈니스 모델 설정 중...');
        
        this.model = gltf.scene;
        
        // 비즈니스에 적합한 크기와 위치
        this.model.scale.set(1.5, 1.5, 1.5);
        this.model.position.set(0, -1, 0);
        this.model.rotation.y = 0;
        
        // 그림자 및 머티리얼 설정
        this.model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                // 비즈니스 전문성을 위한 머티리얼 조정
                if (child.material) {
                    child.material.needsUpdate = true;
                    
                    // 정장이나 셔츠의 경우 약간의 광택
                    if (child.name && (
                        child.name.toLowerCase().includes('suit') || 
                        child.name.toLowerCase().includes('shirt') ||
                        child.name.toLowerCase().includes('tie')
                    )) {
                        child.material.roughness = 0.6;
                        child.material.metalness = 0.2;
                    }
                }
            }
        });

        // 애니메이션 설정
        if (gltf.animations && gltf.animations.length > 0) {
            this.setupAnimations(gltf.animations);
        } else {
            this.createCustomAnimations();
        }

        // 입 움직임을 위한 특별 설정
        this.setupMouthAnimation();

        // 씬에 추가
        this.scene.add(this.model);

        console.log(`✅ 비즈니스 모델 설정 완료: ${modelPath}`);
    }


    // 입 애니메이션 전용 설정
    setupMouthAnimation() {
        this.mouthMeshes = [];
        this.jawBone = null;
        
        this.model.traverse((child) => {
            if (child.isMesh && child.name) {
                const name = child.name.toLowerCase();
                
                // 입 관련 메시 수집
                if (name.includes('mouth') || 
                    name.includes('lip') || 
                    name.includes('teeth') ||
                    name.includes('tongue')) {
                    this.mouthMeshes.push(child);
                    console.log('입 메시 발견:', child.name);
                }
            }
            
            // 턱 본 찾기
            if (child.isBone && child.name.toLowerCase().includes('jaw')) {
                this.jawBone = child;
                console.log('턱 본 발견:', child.name);
            }
        });
        
        console.log(`입 관련 요소: 메시 ${this.mouthMeshes.length}개, 턱 본: ${this.jawBone ? '있음' : '없음'}`);
    }



    // 애니메이션 설정
    setupAnimations(animations) {
        this.mixer = new THREE.AnimationMixer(this.model);

        animations.forEach((clip) => {
            const action = this.mixer.clipAction(clip);
            const animName = clip.name.toLowerCase();
            
            // 비즈니스 상황에 맞는 애니메이션 매핑
            if (animName.includes('idle') || animName.includes('stand')) {
                this.actions.idle = action;
                this.actions.professional = action;
            } else if (animName.includes('talk') || animName.includes('speak')) {
                this.actions.talking = action;
                this.actions.presenting = action;
            } else if (animName.includes('listen')) {
                this.actions.listening = action;
                this.actions.attentive = action;
            } else if (animName.includes('think')) {
                this.actions.thinking = action;
                this.actions.analyzing = action;
            }
            
            // 원본 이름으로도 저장
            this.actions[animName] = action;
            
            console.log(`📋 비즈니스 애니메이션 등록: ${clip.name}`);
        });

        // 기본 애니메이션 시작
        if (this.actions.idle || this.actions.professional) {
            const defaultAction = this.actions.idle || this.actions.professional;
            defaultAction.play();
        }
    }

    // 커스텀 애니메이션 생성
    createCustomAnimations() {
        if (!this.model) return;

        this.mixer = new THREE.AnimationMixer(this.model);

        // 전문적인 호흡 애니메이션
        this.createProfessionalBreathing();
        
        // 비즈니스 제스처
        this.createBusinessGestures();
    }

    createProfessionalBreathing() {
        const times = [0, 2, 4];
        const values = [1, 1.008, 1]; // 매우 미세한 움직임

        const scaleTrack = new THREE.VectorKeyframeTrack(
            '.scale',
            times,
            values.flatMap(v => [v, v, v])
        );

        const clip = new THREE.AnimationClip('professional', 4, [scaleTrack]);
        const action = this.mixer.clipAction(clip);
        action.loop = THREE.LoopRepeat;
        action.play();

        this.actions.idle = action;
        this.actions.professional = action;
    }

    createBusinessGestures() {
        // 미세한 회전 (자신감 있는 자세)
        const times = [0, 1, 2, 3, 4];
        const rotationValues = [0, 0.02, 0, -0.01, 0];

        const rotationTrack = new THREE.NumberKeyframeTrack(
            '.rotation[y]',
            times,
            rotationValues
        );

        const clip = new THREE.AnimationClip('presenting', 4, [rotationTrack]);
        const action = this.mixer.clipAction(clip);
        action.loop = THREE.LoopRepeat;

        this.actions.talking = action;
        this.actions.presenting = action;
    }

    // 폴백 비즈니스 캐릭터 생성
    createBusinessFallback() {
        console.log('🏢 비즈니스 폴백 캐릭터 생성...');
        
        if (this.fallbackCreated) return;
        this.fallbackCreated = true;
        
        const group = new THREE.Group();
        
        // 비즈니스 정장 스타일 캐릭터
        
        // 머리 (살색)
        const headGeometry = new THREE.SphereGeometry(0.35, 20, 20);
        const headMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffdbac,
            transparent: true,
            opacity: 0.95
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.8;
        head.castShadow = true;
        group.add(head);

        // 정장 상의 (어두운 네이비)
        const jacketGeometry = new THREE.CylinderGeometry(0.35, 0.4, 1.0, 12);
        const jacketMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a2e });
        const jacket = new THREE.Mesh(jacketGeometry, jacketMaterial);
        jacket.position.y = 1.1;
        jacket.castShadow = true;
        group.add(jacket);

        // 셔츠 (흰색)
        const shirtGeometry = new THREE.CylinderGeometry(0.3, 0.35, 0.9, 12);
        const shirtMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const shirt = new THREE.Mesh(shirtGeometry, shirtMaterial);
        shirt.position.y = 1.1;
        shirt.position.z = 0.02;
        group.add(shirt);

        // 넥타이 (파란색)
        const tieGeometry = new THREE.CylinderGeometry(0.04, 0.08, 0.7, 6);
        const tieMaterial = new THREE.MeshLambertMaterial({ color: 0x1e3a8a });
        const tie = new THREE.Mesh(tieGeometry, tieMaterial);
        tie.position.y = 1.3;
        tie.position.z = 0.12;
        group.add(tie);

        // 하의 (정장 바지)
        const pantsGeometry = new THREE.CylinderGeometry(0.3, 0.25, 1.2, 8);
        const pantsMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a2e });
        const pants = new THREE.Mesh(pantsGeometry, pantsMaterial);
        pants.position.y = 0.3;
        pants.castShadow = true;
        group.add(pants);

        // 신발
        const shoeGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.4);
        const shoeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        
        const leftShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
        leftShoe.position.set(-0.15, -0.3, 0.1);
        leftShoe.castShadow = true;
        group.add(leftShoe);

        const rightShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
        rightShoe.position.set(0.15, -0.3, 0.1);
        rightShoe.castShadow = true;
        group.add(rightShoe);

        // 눈
        const eyeGeometry = new THREE.SphereGeometry(0.03, 8, 8);
        const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.12, 1.85, 0.3);
        group.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.12, 1.85, 0.3);
        group.add(rightEye);

        // 입
        const mouthGeometry = new THREE.SphereGeometry(0.02, 8, 8);
        const mouthMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, 1.7, 0.3);
        mouth.scale.set(2, 1, 1);
        group.add(mouth);

        // 그룹 위치 조정
        group.position.y = 0;
        group.scale.set(1.2, 1.2, 1.2);

        this.model = group;
        this.scene.add(this.model);

        // 폴백용 애니메이션
        this.createFallbackAnimations();

        console.log('✅ 비즈니스 폴백 캐릭터 생성 완료');
    }

    createFallbackAnimations() {
        this.mixer = new THREE.AnimationMixer(this.model);

        // 전문적인 자세 유지 애니메이션
        const times = [0, 3, 6];
        const values = [0, 0.01, 0];

        const rotationTrack = new THREE.NumberKeyframeTrack(
            '.rotation[y]',
            times,
            values
        );

        const clip = new THREE.AnimationClip('business_idle', 6, [rotationTrack]);
        const action = this.mixer.clipAction(clip);
        action.loop = THREE.LoopRepeat;
        action.play();

        this.actions.idle = action;
        this.actions.professional = action;
        this.actions.talking = action;
        this.actions.listening = action;
        this.actions.thinking = action;
    }

    // 상태 변경
    setState(newState) {
        if (this.currentState === newState) return;

        console.log(`🏢 비즈니스 상태: ${this.currentState} → ${newState}`);

        // 비즈니스 상태 매핑
        const businessStateMap = {
            'idle': 'professional',
            'talking': 'presenting',
            'listening': 'attentive', 
            'thinking': 'analyzing',
            'happy': 'confident'
        };

        const mappedState = businessStateMap[newState] || 'professional';

        // 애니메이션 전환
        if (this.mixer && this.actions[this.currentState]) {
            this.actions[this.currentState].fadeOut(0.5);
        }

        if (this.mixer && this.actions[mappedState]) {
            this.actions[mappedState].reset().fadeIn(0.5).play();
        }

        this.currentState = mappedState;
        
        // 시각적 피드백
        this.applyBusinessVisualFeedback(newState);
    }

    applyBusinessVisualFeedback(state) {
      console.log(`비즈니스 상태 변경: ${state} (시각적 효과 비활성화)`);
    }

    // 개선된 립싱크 (입만 움직임)
    updateLipSync(audioData) {
    if (!audioData || !this.model) return;

    const averageLevel = audioData.reduce((a, b) => a + b) / audioData.length;
    const normalizedLevel = Math.min(averageLevel / 255, 1);
    const intensity = normalizedLevel * 2.0; // 40%로 제한

    console.log(`🎤 립싱크 강도: ${intensity.toFixed(2)}`); // 디버깅용

    // 방법 1: 모프타겟으로 입 움직임
    this.model.traverse((child) => {
        if (child.isMesh && child.morphTargetInfluences) {
            // 입 열림 모프타겟 찾기
            const mouthTargets = [
                'mouthOpen', 'mouth_open', 'MouthOpen', 
                'viseme_aa', 'viseme_E', 'viseme_O'
            ];
            
            for (const targetName of mouthTargets) {
                const index = child.morphTargetDictionary?.[targetName];
                if (index !== undefined) {
                    child.morphTargetInfluences[index] = intensity * 0.7;
                    console.log(`👄 모프타겟 적용: ${targetName}, 강도: ${intensity.toFixed(2)}`);
                    break; // 첫 번째 발견된 것만 사용
                }
            }
        }
        
        // 방법 2: 입 관련 메시 스케일 조정
        if (child.isMesh && child.name) {
            const name = child.name.toLowerCase();
            if (name.includes('mouth') || 
                name.includes('lip') || 
                name.includes('jaw')) {
                
                const targetScale = 1 + intensity * 0.3;
                child.scale.y = THREE.MathUtils.lerp(child.scale.y, targetScale, 0.4);
                console.log(`👄 메시 스케일: ${name}, 크기: ${targetScale.toFixed(2)}`);
            }
        }
        
        // 방법 3: 턱 본 회전
        if (child.isBone && child.name.toLowerCase().includes('jaw')) {
            const targetRotation = -intensity * 0.15; // 아래로 열림
            child.rotation.x = THREE.MathUtils.lerp(child.rotation.x, targetRotation, 0.3);
            console.log(`🦴 턱 본 회전: ${targetRotation.toFixed(2)}`);
        }
    });
}

    // 모프타겟 인덱스 찾기 헬퍼 함수 추가
    findMorphTargetIndex(mesh, targetNames) {
        if (!mesh.morphTargetDictionary) return -1;
        
        for (const name of targetNames) {
            if (mesh.morphTargetDictionary.hasOwnProperty(name)) {
                return mesh.morphTargetDictionary[name];
            }
        }
        return -1;
    }

    // 업데이트
    update() {
        // 기존 애니메이션은 모두 중지하고, 립싱크만 처리
        
        // 현재 오디오 데이터가 있으면 립싱크 처리
        if (this.currentAudioData) {
            this.updateLipSync(this.currentAudioData);
        }
        
        // 다른 모든 움직임은 제거
        // (mixer.update, updateBusinessBehavior 등 모두 제거)
    }

    updateBusinessBehavior() {
        if (!this.model) return;

        const time = Date.now() * 0.001;

        // 매우 미세한 자세 조정 (전문성 유지)
        if (this.currentState === 'professional') {
            this.model.rotation.y = Math.sin(time * 0.2) * 0.01;
        }
    }

    // 정리
    destroy() {
        if (this.mixer) {
            this.mixer.stopAllAction();
        }

        if (this.model && this.scene) {
            this.scene.remove(this.model);
        }

        console.log('🏢 BusinessCharacter 정리됨');
    }
}

// 전역 등록
if (typeof window !== 'undefined') {
    window.BusinessCharacter = BusinessCharacter;
    console.log('✅ BusinessCharacter 클래스 전역 등록됨');
}

// 모듈 내보내기 (필요한 경우)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BusinessCharacter;
}