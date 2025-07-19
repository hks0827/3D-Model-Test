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
        
        // 비즈니스 컨텍스트 설정
        this.businessContext = {
            mood: 'professional', // professional, friendly, focused, presenting
            posture: 'upright',   // upright, relaxed, attentive
            engagement: 'active'  // active, listening, thinking
        };
        
        this.init();
    }

    async init() {
        try {
            console.log('비즈니스 캐릭터 초기화 시작...');
            
            // 로딩 표시
            this.showLoadingIndicator();
            
            // GLTFLoader 로드
            await this.loadGLTFLoader();
            
            // 비즈니스 캐릭터 모델 로드
            await this.loadBusinessCharacter();
            
        } catch (error) {
            console.error('BusinessCharacter 초기화 실패:', error);
            this.createFallbackBusinessCharacter();
        } finally {
            this.hideLoadingIndicator();
        }
    }

    showLoadingIndicator() {
        console.log('로딩 표시...');
        // 로딩 스피너나 메시지 표시 로직
    }

    hideLoadingIndicator() {
        console.log('로딩 숨김');
    }

    async loadGLTFLoader() {
        return new Promise((resolve, reject) => {
            if (typeof THREE.GLTFLoader !== 'undefined') {
                console.log('✅ GLTFLoader 이미 존재');
                resolve();
                return;
            }

            console.log('📦 GLTFLoader 로드 중...');
            
            // Three.js r128에 맞는 정확한 URL
            const loaderUrl = 'https://threejs.org/examples/js/loaders/GLTFLoader.js';
            
            const script = document.createElement('script');
            script.src = loaderUrl;
            
            script.onload = () => {
                if (typeof THREE.GLTFLoader !== 'undefined') {
                    console.log('✅ GLTFLoader 로드 성공');
                    resolve();
                } else {
                    console.error('❌ GLTFLoader 클래스가 정의되지 않음');
                    reject(new Error('GLTFLoader class not found'));
                }
            };
            
            script.onerror = () => {
                console.error('❌ GLTFLoader 스크립트 로드 실패');
                reject(new Error('Failed to load GLTFLoader script'));
            };
            
            document.head.appendChild(script);
        });
    }

    async loadBusinessCharacter() {
        this.isLoading = true;
        
        try {
            console.log('🚀 비즈니스 캐릭터 로딩 시작...');
            console.log('📍 현재 위치:', window.location.origin);
            console.log('📁 기본 경로:', window.location.pathname);
            
            // 절대 경로로 시도
            const baseUrl = window.location.origin;
            const modelPath = `${baseUrl}/src/assets/models/business-character.glb`;
            
            console.log('🎯 시도할 경로:', modelPath);
            
            // 1단계: 파일 존재 확인
            console.log('1️⃣ 파일 존재 확인 중...');
            try {
                const headResponse = await fetch(modelPath, { method: 'HEAD' });
                console.log('📊 HEAD 응답:', {
                    status: headResponse.status,
                    ok: headResponse.ok,
                    statusText: headResponse.statusText,
                    headers: {
                        'content-type': headResponse.headers.get('content-type'),
                        'content-length': headResponse.headers.get('content-length')
                    }
                });
                
                if (!headResponse.ok) {
                    throw new Error(`파일 접근 실패: ${headResponse.status} ${headResponse.statusText}`);
                }
                
                console.log('✅ 파일 접근 가능!');
                
            } catch (fetchError) {
                console.error('❌ 파일 접근 실패:', fetchError);
                throw fetchError;
            }
            
            // 2단계: GLTFLoader 확인
            console.log('2️⃣ GLTFLoader 확인 중...');
            if (typeof THREE.GLTFLoader === 'undefined') {
                console.log('⚠️ GLTFLoader 없음, 로드 중...');
                await this.loadGLTFLoader();
            }
            
            if (typeof THREE.GLTFLoader === 'undefined') {
                throw new Error('GLTFLoader 로드 실패');
            }
            
            console.log('✅ GLTFLoader 준비됨');
            
            // 3단계: GLB 파일 로드
            console.log('3️⃣ GLB 파일 로딩 시작...');
            const loader = new THREE.GLTFLoader();
            
            const gltf = await new Promise((resolve, reject) => {
                const startTime = Date.now();
                
                loader.load(
                    modelPath,
                    (gltf) => {
                        const loadTime = Date.now() - startTime;
                        console.log(`🎉 GLB 로드 성공! (${loadTime}ms)`);
                        console.log('📦 GLB 내용:', {
                            scene: gltf.scene,
                            animations: gltf.animations?.length || 0,
                            scenes: gltf.scenes?.length || 0,
                            cameras: gltf.cameras?.length || 0
                        });
                        resolve(gltf);
                    },
                    (progress) => {
                        if (progress.lengthComputable) {
                            const percent = (progress.loaded / progress.total * 100).toFixed(1);
                            console.log(`📥 로딩 중: ${percent}% (${progress.loaded}/${progress.total} bytes)`);
                        } else {
                            console.log(`📥 로딩 중: ${progress.loaded} bytes`);
                        }
                    },
                    (error) => {
                        console.error('💥 GLB 로드 에러:', error);
                        console.error('에러 세부사항:', {
                            message: error.message,
                            type: error.constructor.name,
                            stack: error.stack
                        });
                        reject(error);
                    }
                );
            });
            
            // 4단계: 캐릭터 설정
            console.log('4️⃣ 캐릭터 설정 시작...');
            await this.setupBusinessCharacter(gltf);
            
            console.log('🎊 비즈니스 캐릭터 로드 완료!');
            
        } catch (error) {
            console.error('🚨 전체 로딩 프로세스 실패:', error);
            console.log('🔄 폴백 캐릭터로 전환...');
            this.createFallbackBusinessCharacter();
        }
        
        this.isLoading = false;
    }

    async setupBusinessCharacter(gltf) {
        console.log('비즈니스 캐릭터 설정 시작...');
        
        this.model = gltf.scene;
        
        // 비즈니스 적절한 크기 및 위치 조정
        this.model.scale.set(1, 1, 1);
        this.model.position.set(0, 0, 0);
        this.model.rotation.y = 0; // 정면을 바라보도록
        
        // 전문적인 조명에 맞는 그림자 설정
        this.model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                // 비즈니스 환경에 맞는 머티리얼 조정
                if (child.material) {
                    child.material.needsUpdate = true;
                    
                    // 정장의 경우 약간의 광택 추가
                    if (child.name.toLowerCase().includes('suit') || 
                        child.name.toLowerCase().includes('shirt')) {
                        child.material.roughness = 0.7;
                        child.material.metalness = 0.1;
                    }
                }
            }
        });

        // 본(뼈대) 찾기 및 설정
        this.findImportantBones();

        // 얼굴 메시 찾기
        this.findFaceMesh();

        // 비즈니스 애니메이션 설정
        if (gltf.animations && gltf.animations.length > 0) {
            this.setupBusinessAnimations(gltf.animations);
        } else {
            this.createBusinessAnimations();
        }

        // 기본 비즈니스 포즈 설정
        this.setBusinessPosture('professional');

        // 씬에 추가
        this.scene.add(this.model);

        console.log('✅ 비즈니스 캐릭터 설정 완료');
    }

    findImportantBones() {
        const boneNames = ['head', 'neck', 'spine', 'leftShoulder', 'rightShoulder'];
        
        this.model.traverse((child) => {
            if (child.isBone) {
                const boneName = child.name.toLowerCase();
                boneNames.forEach(targetBone => {
                    if (boneName.includes(targetBone)) {
                        this.bones[targetBone] = child;
                        console.log(`본 발견: ${targetBone} → ${child.name}`);
                    }
                });
            }
        });
    }

    findFaceMesh() {
        this.model.traverse((child) => {
            if (child.isMesh && child.morphTargetInfluences) {
                const meshName = child.name.toLowerCase();
                if (meshName.includes('head') || 
                    meshName.includes('face') || 
                    meshName.includes('eyes') ||
                    meshName.includes('mouth')) {
                    this.faceMesh = child;
                    this.morphTargets = child.morphTargetDictionary || {};
                    console.log('얼굴 메시 발견:', child.name);
                    console.log('모프 타겟:', Object.keys(this.morphTargets));
                    return;
                }
            }
        });
    }

    setupBusinessAnimations(animations) {
        this.mixer = new THREE.AnimationMixer(this.model);

        animations.forEach((clip) => {
            const action = this.mixer.clipAction(clip);
            const animName = clip.name.toLowerCase();
            
            // 비즈니스 컨텍스트에 맞는 애니메이션 매핑
            if (animName.includes('idle') || animName.includes('standing')) {
                this.actions.professional = action;
            } else if (animName.includes('talk') || animName.includes('speak')) {
                this.actions.presenting = action;
            } else if (animName.includes('listen')) {
                this.actions.attentive = action;
            } else if (animName.includes('think')) {
                this.actions.analyzing = action;
            }
            
            this.actions[clip.name.toLowerCase()] = action;
            console.log('비즈니스 애니메이션 등록:', clip.name);
        });

        // 기본 프로페셔널 자세
        if (this.actions.professional) {
            this.actions.professional.play();
        }
    }

    createBusinessAnimations() {
        if (!this.model) return;

        this.mixer = new THREE.AnimationMixer(this.model);

        // 프로페셔널한 호흡 애니메이션
        this.createProfessionalBreathing();

        // 비즈니스 제스처 애니메이션
        this.createBusinessGestures();

        // 프레젠테이션 모드 애니메이션
        this.createPresentationAnimations();
    }

    createProfessionalBreathing() {
        const times = [0, 2, 4];
        const values = [1, 1.015, 1]; // 매우 미세한 움직임

        const scaleTrack = new THREE.VectorKeyframeTrack(
            '.scale',
            times,
            values.flatMap(v => [v, v, v])
        );

        const clip = new THREE.AnimationClip('professional', 4, [scaleTrack]);
        const action = this.mixer.clipAction(clip);
        action.loop = THREE.LoopRepeat;
        action.play();

        this.actions.professional = action;
    }

    createBusinessGestures() {
        // 프레젠테이션할 때의 손 움직임 (어깨 회전)
        if (this.bones.leftShoulder && this.bones.rightShoulder) {
            const times = [0, 1, 2, 3, 4];
            const leftShoulderRotations = [0, 0.05, 0, -0.03, 0];
            const rightShoulderRotations = [0, -0.03, 0, 0.05, 0];

            const leftTrack = new THREE.NumberKeyframeTrack(
                `${this.bones.leftShoulder.name}.rotation[z]`,
                times,
                leftShoulderRotations
            );

            const rightTrack = new THREE.NumberKeyframeTrack(
                `${this.bones.rightShoulder.name}.rotation[z]`,
                times,
                rightShoulderRotations
            );

            const clip = new THREE.AnimationClip('presenting', 4, [leftTrack, rightTrack]);
            const action = this.mixer.clipAction(clip);
            action.loop = THREE.LoopRepeat;

            this.actions.presenting = action;
        }
    }

    createPresentationAnimations() {
        // 경청 자세 (약간 앞으로 기울기)
        if (this.bones.spine) {
            const times = [0, 2, 4];
            const rotations = [0, 0.05, 0];

            const spineTrack = new THREE.NumberKeyframeTrack(
                `${this.bones.spine.name}.rotation[x]`,
                times,
                rotations
            );

            const clip = new THREE.AnimationClip('attentive', 4, [spineTrack]);
            const action = this.mixer.clipAction(clip);
            action.loop = THREE.LoopRepeat;

            this.actions.attentive = action;
        }
    }

    // 비즈니스 상황별 상태 설정
    setState(newState) {
        if (this.currentState === newState) return;

        console.log(`비즈니스 캐릭터 상태: ${this.currentState} → ${newState}`);

        // 비즈니스 컨텍스트에 맞는 상태 매핑
        const businessStateMap = {
            'idle': 'professional',
            'talking': 'presenting', 
            'listening': 'attentive',
            'thinking': 'analyzing'
        };

        const businessState = businessStateMap[newState] || 'professional';

        // 현재 애니메이션 페이드아웃
        if (this.actions[this.currentState]) {
            this.actions[this.currentState].fadeOut(0.8);
        }

        // 새 애니메이션 페이드인
        if (this.actions[businessState]) {
            this.actions[businessState].reset().fadeIn(0.8).play();
        }

        this.currentState = businessState;

        // 비즈니스 표정 설정
        this.setBusinessExpression(newState);

        // 비즈니스 컨텍스트 업데이트
        this.updateBusinessContext(newState);
    }

    setBusinessExpression(state) {
        if (!this.faceMesh || !this.morphTargets) return;

        // 모든 표정 초기화
        if (this.faceMesh.morphTargetInfluences) {
            this.faceMesh.morphTargetInfluences.fill(0);
        }

        // 비즈니스 적절한 표정 설정
        switch (state) {
            case 'talking':
            case 'presenting':
                this.setMorphTarget('mouthSmile', 0.3);     // 약간의 미소
                this.setMorphTarget('eyesConfident', 0.4);   // 자신감 있는 눈빛
                this.setMorphTarget('browSlightUp', 0.2);    // 약간 올라간 눈썹
                break;

            case 'listening':
            case 'attentive':
                this.setMorphTarget('eyesAttentive', 0.5);   // 집중하는 눈빛
                this.setMorphTarget('browInterested', 0.3);  // 관심 있는 표정
                this.setMorphTarget('mouthNeutral', 0.2);    // 중립적인 입
                break;

            case 'thinking':
            case 'analyzing':
                this.setMorphTarget('eyesFocused', 0.4);     // 집중하는 눈
                this.setMorphTarget('browConcentrated', 0.3); // 생각하는 눈썹
                this.setMorphTarget('mouthThinking', 0.2);   // 생각하는 입모양
                break;

            default: // professional
                this.setMorphTarget('mouthProfessional', 0.2); // 프로페셔널한 표정
                this.setMorphTarget('eyesAlert', 0.3);         // 경계하는 눈빛
                this.setMorphTarget('browNeutral', 0.1);       // 중립적인 눈썹
        }
    }

    setMorphTarget(targetName, value) {
        if (!this.faceMesh || !this.morphTargets) return;

        // 다양한 이름 매핑 시도
        const possibleNames = [
            targetName,
            targetName.toLowerCase(),
            targetName.replace(/([A-Z])/g, '_$1').toLowerCase(),
            targetName.replace(/([A-Z])/g, '-$1').toLowerCase()
        ];

        for (const name of possibleNames) {
            const index = this.morphTargets[name];
            if (index !== undefined && this.faceMesh.morphTargetInfluences) {
                this.faceMesh.morphTargetInfluences[index] = value;
                return;
            }
        }
    }

    updateBusinessContext(state) {
        switch (state) {
            case 'presenting':
                this.businessContext.mood = 'confident';
                this.businessContext.posture = 'upright';
                this.businessContext.engagement = 'active';
                break;

            case 'attentive':
                this.businessContext.mood = 'focused';
                this.businessContext.posture = 'leaning';
                this.businessContext.engagement = 'listening';
                break;

            case 'analyzing':
                this.businessContext.mood = 'thoughtful';
                this.businessContext.posture = 'relaxed';
                this.businessContext.engagement = 'thinking';
                break;

            default:
                this.businessContext.mood = 'professional';
                this.businessContext.posture = 'upright';
                this.businessContext.engagement = 'ready';
        }
    }

    setBusinessPosture(postureType) {
        if (!this.bones.spine) return;

        switch (postureType) {
            case 'professional':
                this.bones.spine.rotation.x = 0;
                this.bones.spine.rotation.z = 0;
                break;

            case 'presenting':
                this.bones.spine.rotation.x = -0.05; // 약간 앞으로
                break;

            case 'attentive':
                this.bones.spine.rotation.x = 0.03; // 약간 뒤로 (경청)
                break;
        }
    }

    // 비즈니스 맥락의 립싱크
    updateLipSync(audioData) {
        if (!audioData || !this.faceMesh) return;

        const averageLevel = audioData.reduce((a, b) => a + b) / audioData.length;
        const normalizedLevel = averageLevel / 255;

        // 비즈니스 상황에 맞는 절제된 입 움직임
        const intensity = normalizedLevel * 0.6; // 과하지 않게

        this.setMorphTarget('mouthOpen', intensity);
        this.setMorphTarget('jawOpen', intensity * 0.3);

        // 말할 때 약간의 미소 유지
        if (this.currentState === 'presenting') {
            this.setMorphTarget('mouthSmile', 0.2 + intensity * 0.1);
        }
    }

    // 전문적인 시선 처리
    updateGaze(mouseX, mouseY) {
        if (!this.bones.head && !this.bones.neck) return;

        // 비즈니스 상황에 맞는 절제된 시선 이동
        const gazeIntensity = 0.05; // 과하지 않게

        if (this.bones.head) {
            this.bones.head.rotation.y = THREE.MathUtils.lerp(
                this.bones.head.rotation.y, 
                mouseX * gazeIntensity, 
                0.1
            );
            this.bones.head.rotation.x = THREE.MathUtils.lerp(
                this.bones.head.rotation.x, 
                mouseY * gazeIntensity * 0.5, 
                0.1
            );
        }
    }

    update() {
        // 애니메이션 믹서 업데이트
        if (this.mixer) {
            this.mixer.update(0.016);
        }

        // 마우스 추적 (절제된 방식)
        if (typeof window.mouseX !== 'undefined' && typeof window.mouseY !== 'undefined') {
            const mouseX = (window.mouseX / window.innerWidth) * 2 - 1;
            const mouseY = -(window.mouseY / window.innerHeight) * 2 + 1;
            this.updateGaze(mouseX, mouseY);
        }

        // 비즈니스 컨텍스트별 미세 조정
        this.updateBusinessBehavior();
    }

    updateBusinessBehavior() {
        // 현재 비즈니스 컨텍스트에 따른 미세한 행동 조정
        const time = Date.now() * 0.001;

        if (this.currentState === 'professional') {
            // 매우 미세한 움직임으로 생동감 부여
            if (this.bones.head) {
                this.bones.head.position.y += Math.sin(time * 0.5) * 0.001;
            }
        }
    }

    createFallbackBusinessCharacter() {
        console.log('비즈니스 폴백 캐릭터 생성...');
        
        // 정장을 입은 것처럼 보이는 간단한 캐릭터
        const group = new THREE.Group();
        
        // 머리 (살색)
        const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.7;
        group.add(head);

        // 몸 (정장 - 어두운 색)
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.35, 1.2, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x2c3e50 }); // 네이비 정장
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1;
        group.add(body);

        // 셔츠 (흰색)
        const shirtGeometry = new THREE.CylinderGeometry(0.25, 0.3, 1.0, 8);
        const shirtMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const shirt = new THREE.Mesh(shirtGeometry, shirtMaterial);
        shirt.position.y = 1;
        shirt.position.z = 0.05;
        group.add(shirt);

        // 넥타이
        const tieGeometry = new THREE.CylinderGeometry(0.03, 0.06, 0.8, 6);
        const tieMaterial = new THREE.MeshLambertMaterial({ color: 0x8b0000 }); // 어두운 빨간색
        const tie = new THREE.Mesh(tieGeometry, tieMaterial);
        tie.position.y = 1.2;
        tie.position.z = 0.15;
        group.add(tie);

        // 눈
        const eyeGeometry = new THREE.SphereGeometry(0.03, 8, 8);
        const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.1, 1.75, 0.25);
        group.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.1, 1.75, 0.25);
        group.add(rightEye);

        this.model = group;
        this.scene.add(this.model);

        // 간단한 애니메이션
        this.createCustomAnimations();

        console.log('✅ 비즈니스 폴백 캐릭터 생성 완료');
    }

    destroy() {
        if (this.mixer) {
            this.mixer.stopAllAction();
        }

        if (this.model && this.scene) {
            this.scene.remove(this.model);
        }

        console.log('BusinessCharacter 정리됨');
    }
}

// 전역 설정
if (typeof window.BusinessCharacter === 'undefined') {
    window.BusinessCharacter = BusinessCharacter;
    console.log('✅ BusinessCharacter 클래스 등록됨');
} else {
    console.log('⚠️ BusinessCharacter 이미 존재함');
}