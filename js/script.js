// ==================== 1. 초기 설정 & 유틸리티 ====================
gsap.registerPlugin(ScrollTrigger);

// CSS 변수 설정
document.documentElement.style.setProperty('--point-bg-color', '#000612');

// 반응형 체크 유틸리티
const isMobile = () => window.innerWidth <= 768;

// 애니메이션 공통 설정
const ANIMATION_CONFIG = {
    triggerStart: 'top bottom-=200px',
    toggleActions: 'restart none restart none',
};

// AOS 설정값
const AOS_CONFIG = {
    duration: 600,
    offset: 120,
    easing: 'ease-in-out',
    once: false,
    mirror: true,
    anchorPlacement: 'top-bottom',
};

// ==================== 2. 성능 최적화 유틸리티 ====================
// throttle: 일정 시간 간격으로만 함수 실행
function throttle(func, delay) {
    let lastCall = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            func.apply(this, args);
        }
    };
}

// debounce: 마지막 호출 후 일정 시간 뒤에 함수 실행
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// ==================== 3. 이미지 최적화 (Critical Path) ====================
// WebP 지원 여부 확인
function supportsWebP() {
    return new Promise((resolve) => {
        const webP = new Image();
        webP.onload = webP.onerror = () => resolve(webP.height === 2);
        webP.src =
            'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
}

// 배경 이미지 적용
function applyBackgroundImage(imagePath) {
    const pointBox = document.querySelector('.point_box');
    if (!pointBox) return;

    // GPU 가속 활성화
    pointBox.style.transform = 'translate3d(0,0,0)';
    pointBox.style.willChange = 'background-image';
    pointBox.style.backgroundImage = `url('${imagePath}')`;
    pointBox.classList.add('bg-loaded');

    // 애니메이션 완료 후 will-change 제거 (메모리 최적화)
    setTimeout(() => {
        pointBox.style.willChange = 'auto';
    }, 1000);
}

// 폴백 이미지 로드
function loadFallbackImage(fallbackPath) {
    const fallbackImg = new Image();
    fallbackImg.onload = () => applyBackgroundImage(fallbackPath);
    fallbackImg.src = fallbackPath;
}

// 이미지 사전 로드
async function aggressivePreloadImages() {
    // 로컬 파일 실행 시 건너뛰기
    if (window.location.protocol === 'file:') {
        console.log('로컬 개발 환경 - 배경 이미지 로드 건너뜀');
        return;
    }

    const isWebPSupported = await supportsWebP();
    const bgImagePath = isWebPSupported ? '../images/point_bg.webp' : '../images/point_bg.jpg';

    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.as = 'image';
    preloadLink.href = bgImagePath;
    preloadLink.fetchPriority = 'high';
    document.head.appendChild(preloadLink);

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.decoding = 'async';

        img.onload = () => {
            console.log('Background image loaded successfully');
            applyBackgroundImage(bgImagePath);
            resolve(true);
        };

        img.onerror = () => {
            console.error('Failed to load background image');
            if (isWebPSupported && bgImagePath.includes('.webp')) {
                loadFallbackImage('../images/point_bg.jpg'); // PNG 대신 JPG
            } else {
                reject(false);
            }
        };

        img.src = bgImagePath;
    });
}

// ==================== 4. DOM 초기화 (DOMContentLoaded) ====================
document.addEventListener('DOMContentLoaded', async function () {
    // 4-1. 배경 초기화 (메인 페이지만)
    const pointBox = document.querySelector('.point_box');
    if (pointBox) {
        pointBox.style.backgroundColor = '#000612';
        pointBox.style.opacity = '1';
    }

    // 4-2. 배경 이미지 프리로드 (메인 페이지만)
    try {
        await aggressivePreloadImages();
    } catch (error) {
        console.warn('Background image preloading failed, using fallback');
    }

    // 4-3. Intersection Observer 설정 (지연 로딩)
    const observerOptions = {
        root: null,
        rootMargin: '300px',
        threshold: 0,
    };

    const pointObserver = new IntersectionObserver(async (entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                const pointBox = entry.target.querySelector('.point_box');
                if (pointBox && !pointBox.classList.contains('bg-loaded')) {
                    await aggressivePreloadImages();
                    pointBox.classList.add('bg-preloaded');
                }
                pointObserver.unobserve(entry.target);
                break;
            }
        }
    }, observerOptions);

    const pointSection = document.querySelector('.point');
    if (pointSection) {
        pointObserver.observe(pointSection);
    }

    // 4-4. 헤더 초기화
    initHeader();

    // 4-5. 모달 초기화
    initModal();

    // 4-6. AOS 초기화
    // 스크롤 애니메이션 라이브러리 설정
    AOS.init(AOS_CONFIG);

    // 4-7. GSAP 애니메이션 초기화 (Non-blocking)
    // requestAnimationFrame으로 메인 스레드 차단 방지
    requestAnimationFrame(() => {
        initAnimations();
    });

    // 4-8. 통합 resize 이벤트 (throttle 적용)
    // 모든 resize 관련 로직을 한 곳에서 처리
    const handleResize = throttle(() => {
        AOS.refresh(); // AOS 새로고침
        ScrollTrigger.refresh(); // ScrollTrigger 새로고침 (포인트 애니메이션 등)
    }, 200);

    window.addEventListener('resize', handleResize);
});

// ==================== 5. 헤더 관리 ====================
function initHeader() {
    const hamBtn = document.querySelector('.ham_btn');
    const hamGnb = document.querySelector('.ham_gnb');
    const hamIcon = document.querySelector('.ham_icon');

    if (!hamBtn) return;

    let isMenuOpen = false;

    // 햄버거 버튼 클릭 이벤트
    hamBtn.addEventListener('click', function () {
        isMenuOpen = !isMenuOpen;

        if (isMenuOpen) {
            // 메뉴 열기
            hamGnb.classList.add('active');
            hamIcon.src = '../images/close_btn.png';
            hamIcon.alt = '메뉴 닫기';
            hamBtn.setAttribute('aria-label', '메뉴 닫기');

            // 메인 페이지에서는 헤더 배경 변경
            if (document.querySelector('.main')) {
                gsap.to('.header', {
                    backgroundColor: 'var(--bs-white)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    duration: 0.3,
                });
                gsap.to('.header li a:not(.on)', {
                    color: 'var(--bs-black)',
                    duration: 0.3,
                });
            }
        } else {
            closeMenu();
        }
    });

    // 메뉴 링크 클릭 시 메뉴 닫기
    const menuLinks = document.querySelectorAll('.ham_gnb a');
    menuLinks.forEach((link) => {
        link.addEventListener('click', closeMenu);
    });

    // 메뉴 닫기 함수
    function closeMenu() {
        hamGnb.classList.remove('active');
        hamIcon.src = '../images/ham_btn.png';
        hamIcon.alt = '메뉴 버튼';
        hamBtn.setAttribute('aria-label', '메뉴 열기');
        isMenuOpen = false;

        // 메인 페이지 + 스크롤 최상단일 때 투명 헤더로 복원
        if (document.querySelector('.main') && window.scrollY < 20) {
            gsap.to('.header', {
                backgroundColor: 'transparent',
                boxShadow: 'none',
                duration: 0.3,
            });
            gsap.to('.header li a:not(.on)', {
                color: 'var(--bs-white)',
                duration: 0.3,
            });
        }
    }

    // 헤더 스크롤 애니메이션 (메인 페이지만)
    if (document.querySelector('.main')) {
        ScrollTrigger.create({
            start: '20px top',
            onEnter: () => {
                // 스크롤 다운 시 흰색 배경
                gsap.to('.header', {
                    y: 0,
                    backgroundColor: 'var(--bs-white)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    duration: 0.1,
                    ease: 'power1.out',
                });

                gsap.to('.header li a:not(.on)', {
                    color: 'var(--bs-black)',
                    duration: 0.1,
                });
            },
            onLeaveBack: () => {
                // 스크롤 업 시 투명 배경
                gsap.to('.header', {
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    duration: 0.1,
                    ease: 'power1.out',
                });

                gsap.to('.header li a:not(.on)', {
                    color: 'var(--bs-white)',
                    duration: 0.1,
                });
            },
        });
    }
}

// ==================== 6. 모달 관리 ====================
function initModal() {
    const modal = document.getElementById('consultationModal');
    if (!modal) return;

    const closeBtn = document.getElementById('closeBtn');
    const submitBtn = document.getElementById('submitBtn');
    const modalBg = modal.querySelector('.modal_bg');

    const agreeAllCheckbox = document.getElementById('agree_all_consult');
    const agreeTwoCheckbox = document.getElementById('agree_two_consult');
    const agreeThirdCheckbox = document.getElementById('agree_third_consult');

    // 모달 열기 (전역 함수)
    window.openConsultationModal = function () {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // 스크롤 방지
    };

    // 모달 닫기
    function closeConsultationModal() {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // 스크롤 복원
        resetForm();
    }

    // 폼 리셋
    function resetForm() {
        document.getElementById('consultType').value = '';
        document.getElementById('inputName').value = '';
        document.getElementById('inputPhone').value = '';
        if (agreeAllCheckbox) agreeAllCheckbox.checked = false;
        if (agreeTwoCheckbox) agreeTwoCheckbox.checked = false;
        if (agreeThirdCheckbox) agreeThirdCheckbox.checked = false;
    }

    // 닫기 버튼 이벤트
    if (closeBtn) closeBtn.addEventListener('click', closeConsultationModal);
    // 배경 클릭 시 닫기
    if (modalBg) modalBg.addEventListener('click', closeConsultationModal);

    // 전체 동의 체크박스 로직
    if (agreeAllCheckbox) {
        agreeAllCheckbox.addEventListener('change', () => {
            const isChecked = agreeAllCheckbox.checked;
            if (agreeTwoCheckbox) agreeTwoCheckbox.checked = isChecked;
            if (agreeThirdCheckbox) agreeThirdCheckbox.checked = isChecked;
        });
    }

    // 개별 체크박스 변경 시 전체 동의 체크박스 업데이트
    [agreeTwoCheckbox, agreeThirdCheckbox].forEach((checkbox) => {
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                if (agreeAllCheckbox) {
                    agreeAllCheckbox.checked = agreeTwoCheckbox.checked && agreeThirdCheckbox.checked;
                }
            });
        }
    });

    // 제출 버튼 이벤트
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const consultType = document.getElementById('consultType').value;
            const name = document.getElementById('inputName').value;
            const phone = document.getElementById('inputPhone').value;

            // 유효성 검사
            if (!consultType) {
                alert('상담신청 항목을 선택해주세요.');
                return;
            }

            if (!name.trim()) {
                alert('이름을 입력해주세요.');
                return;
            }

            if (!phone.trim()) {
                alert('휴대폰 번호를 입력해주세요.');
                return;
            }

            if (!agreeTwoCheckbox.checked || !agreeThirdCheckbox.checked) {
                alert('필수 약관에 동의해주세요.');
                return;
            }

            console.log('상담신청:', { consultType, name, phone });
            alert('상담 신청이 완료되었습니다.');
            closeConsultationModal();
        });
    }

    // ESC 키로 모달 닫기 (once 옵션으로 중복 방지)
    document.addEventListener(
        'keydown',
        (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeConsultationModal();
            }
        },
        { once: false }
    );
}

// ==================== 7. 애니메이션 초기화 (페이지별 분기) ====================
function initAnimations() {
    // 페이지별로 해당하는 애니메이션만 실행
    if (document.querySelector('.main')) {
        initMainAnimations();
    }

    if (document.querySelector('.fc_recruit')) {
        initFCAnimations();
    }

    if (document.querySelector('.branch_recruit')) {
        initBranchAnimations();
    }

    if (document.querySelector('.center_recruit')) {
        initCenterAnimations();
    }
}

// ==================== 8. 메인 페이지 애니메이션 ====================
function initMainAnimations() {
    initPointAnimation();
}

// 포인트 섹션 3D 회전 애니메이션
function initPointAnimation() {
    const pointTexts = gsap.utils.toArray('.point .ani_text p').slice(0, 4);
    if (pointTexts.length === 0) return;

    // 화면 크기별 회전 반지름 계산
    function getPointRadius() {
        const screenWidth = window.innerWidth;
        if (screenWidth <= 480) return 70;
        if (screenWidth <= 768) return 75;
        if (screenWidth <= 1200) return 100;
        return 120;
    }

    let radius = getPointRadius();
    const totalTexts = pointTexts.length;

    // 텍스트 초기 위치 설정
    function initializePointTexts() {
        const currentRadius = getPointRadius();
        pointTexts.forEach((text, index) => {
            const angle = (index / (totalTexts - 1)) * Math.PI;
            const y = Math.sin(angle) * currentRadius;
            const z = Math.cos(angle) * currentRadius;

            gsap.set(text, {
                y: y,
                z: z,
                rotateX: -((angle * 180) / Math.PI),
            });
        });
    }

    initializePointTexts();

    // 스크롤에 따른 회전 애니메이션
    ScrollTrigger.create({
        trigger: '.point',
        start: 'top top',
        end: 'center top',
        scrub: 1,
        markers: false,
        onUpdate: (self) => {
            const progress = self.progress;
            const rotationProgress = progress * (totalTexts - 1);

            pointTexts.forEach((text, index) => {
                // 각도 계산
                const baseAngle = (index / (totalTexts - 1)) * Math.PI;
                const currentAngle = baseAngle - (rotationProgress * Math.PI) / (totalTexts - 1);

                // 3D 좌표 계산
                const y = Math.sin(currentAngle) * radius;
                const z = Math.cos(currentAngle) * radius;
                const rotateX = -((currentAngle * 180) / Math.PI);

                // 정규화된 각도로 포커스 여부 판단
                const normalizedAngle = ((currentAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
                const isFocus = normalizedAngle < 0.3 || normalizedAngle > Math.PI * 2 - 0.3;

                // 위치 적용
                gsap.set(text, {
                    y: y,
                    z: z,
                    rotateX: rotateX,
                });

                // 포커스 클래스 토글
                if (isFocus) {
                    text.classList.add('focus');
                } else {
                    text.classList.remove('focus');
                }
            });
        },
        pinSpacing: false,
    });
}

// ==================== 9. FC 모집 페이지 애니메이션 ====================
function initFCAnimations() {
    // 영업기법 섹션 순차 애니메이션
    const technicBalancedTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.fc_recruit .technic .content',
            start: ANIMATION_CONFIG.triggerStart,
            toggleActions: ANIMATION_CONFIG.toggleActions,
        },
    });

    technicBalancedTl
        .from('.fc_recruit .technic .content .left', {
            opacity: 0,
            x: -60,
            duration: 0.9,
            ease: 'power2.out',
        })
        .from(
            '.fc_recruit .technic .content .mid',
            {
                opacity: 0,
                x: -60,
                duration: 0.9,
                ease: 'power2.out',
            },
            0.25 // 0.25초 뒤 시작
        )
        .from(
            '.fc_recruit .technic .content .right',
            {
                opacity: 0,
                x: -60,
                duration: 0.9,
                ease: 'power2.out',
            },
            0.5 // 0.5초 뒤 시작
        )
        .from(
            '.fc_recruit .technic .bottom',
            {
                opacity: 0,
                y: 60,
                duration: 1.0,
                ease: 'power2.out',
            },
            0.75 // 0.75초 뒤 시작
        );
}

// ==================== 10. 지사장 모집 페이지 애니메이션 ====================
function initBranchAnimations() {
    // 필요 시 추가
}

// ==================== 11. 센터장 모집 페이지 애니메이션 ====================
function initCenterAnimations() {
    // 비전 섹션 그래프 애니메이션
    gsap.from('.center_recruit .vision .graph', {
        scrollTrigger: {
            trigger: '.center_recruit .vision .graph',
            start: ANIMATION_CONFIG.triggerStart,
            toggleActions: ANIMATION_CONFIG.toggleActions,
        },
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
    });

    // 그래프 최소 높이 설정
    gsap.set('.center_recruit .vision .graph', {
        minHeight: '350px',
    });

    // 그래프 막대 애니메이션
    gsap.fromTo(
        '.center_recruit .vision .graph .stick',
        {
            scaleY: 0,
            transformOrigin: 'bottom',
        },
        {
            scrollTrigger: {
                trigger: '.center_recruit .vision .graph',
                start: ANIMATION_CONFIG.triggerStart,
                toggleActions: ANIMATION_CONFIG.toggleActions,
            },
            scaleY: 1,
            duration: 1.2,
            stagger: 0.15, // 순차 애니메이션 간격
            delay: 0.3,
            ease: 'power2.out',
        }
    );

    // 그래프 텍스트 페이드 인
    gsap.from('.center_recruit .vision .graph .s_wrap h5', {
        scrollTrigger: {
            trigger: '.center_recruit .vision .graph',
            start: ANIMATION_CONFIG.triggerStart,
            toggleActions: ANIMATION_CONFIG.toggleActions,
        },
        opacity: 0,
        duration: 0.8,
        delay: 1.5,
        ease: 'power2.out',
    });
}

// ==================== 12. 추가 이벤트 리스너 ====================
// 페이지 로드 완료 시 배경 이미지 재시도
window.addEventListener('load', () => {
    const pointBox = document.querySelector('.point_box');
    if (pointBox && !pointBox.classList.contains('bg-loaded')) {
        aggressivePreloadImages();
    }
});

// 페이지 가시성 변경 시 배경 이미지 재시도
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        const pointBox = document.querySelector('.point_box');
        if (pointBox && !pointBox.classList.contains('bg-loaded')) {
            aggressivePreloadImages();
        }
    }
});
