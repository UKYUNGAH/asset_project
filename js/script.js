gsap.registerPlugin(ScrollTrigger);

// 메인 포인트 섹션 iOS 깜빡임 이슈 해결
document.documentElement.style.setProperty('--point-bg-color', '#000612');

// 반응형 체크 함수
function isMobile() {
    return window.innerWidth <= 768;
}

// 수정: 등장 시점 통일 (toggleActions 추가로 재실행 가능하게)
const ANIMATION_CONFIG = {
    triggerStart: 'top 85%',
    toggleActions: 'play none none reverse', // 뷰포트 재진입 시 재실행
};

// WebP 지원 감지 함수
function supportsWebP() {
    return new Promise((resolve) => {
        const webP = new Image();
        webP.onload = webP.onerror = () => {
            resolve(webP.height === 2);
        };
        webP.src =
            'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
}

// 이미지 프리로딩 함수
async function aggressivePreloadImages() {
    const isWebPSupported = await supportsWebP();
    const bgImagePath = isWebPSupported ? '/images/point_bg.webp' : '/images/point_bg.jpg';

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
                loadFallbackImage('/images/point_bg.jpg');
            } else {
                reject(false);
            }
        };

        img.src = bgImagePath;
    });
}

// 배경 이미지 적용 함수
function applyBackgroundImage(imagePath) {
    const pointBox = document.querySelector('.point_box');
    if (!pointBox) return;

    pointBox.style.transform = 'translate3d(0,0,0)';
    pointBox.style.willChange = 'background-image';
    pointBox.style.backgroundImage = `url('${imagePath}')`;
    pointBox.classList.add('bg-loaded');

    setTimeout(() => {
        pointBox.style.willChange = 'auto';
    }, 1000);
}

// 폴백 이미지 로드
function loadFallbackImage(fallbackPath) {
    const fallbackImg = new Image();
    fallbackImg.onload = () => {
        applyBackgroundImage(fallbackPath);
    };
    fallbackImg.src = fallbackPath;
}

// DOM 로드 완료 시 실행
document.addEventListener('DOMContentLoaded', async function () {
    const pointBox = document.querySelector('.point_box');
    if (pointBox) {
        pointBox.style.backgroundColor = '#000612';
        pointBox.style.opacity = '1';
    }

    try {
        await aggressivePreloadImages();
    } catch (error) {
        console.warn('Background image preloading failed, using fallback');
    }

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

    // HEADER
    const hamBtn = document.querySelector('.ham_btn');
    const hamGnb = document.querySelector('.ham_gnb');
    const hamIcon = document.querySelector('.ham_icon');

    let isMenuOpen = false;

    if (hamBtn) {
        hamBtn.addEventListener('click', function () {
            isMenuOpen = !isMenuOpen;

            if (isMenuOpen) {
                hamGnb.classList.add('active');
                hamIcon.src = '/images/close_btn.png';
                hamIcon.alt = '메뉴 닫기';
                hamBtn.setAttribute('aria-label', '메뉴 닫기');

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
                hamGnb.classList.remove('active');
                hamIcon.src = '/images/ham_btn.png';
                hamIcon.alt = '메뉴 버튼';
                hamBtn.setAttribute('aria-label', '메뉴 열기');

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
        });

        const menuLinks = document.querySelectorAll('.ham_gnb a');
        menuLinks.forEach((link) => {
            link.addEventListener('click', () => {
                hamGnb.classList.remove('active');
                hamIcon.src = '/images/ham_btn.png';
                hamIcon.alt = '메뉴 버튼';
                hamBtn.setAttribute('aria-label', '메뉴 열기');
                isMenuOpen = false;

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
            });
        });
    }
});

// 헤더 스크롤 애니메이션 (메인 페이지에만 적용)
if (document.querySelector('.main')) {
    ScrollTrigger.create({
        start: '20px top',
        onEnter: () => {
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

// ====================== 메인 페이지 애니메이션 ====================== //

// 메인 - 비지니스 섹션 (수정: 모바일은 각 카드마다 개별 trigger)
const businessTimeline = gsap.timeline({
    scrollTrigger: {
        trigger: '.business',
        start: ANIMATION_CONFIG.triggerStart,
        toggleActions: ANIMATION_CONFIG.toggleActions,
    },
});

businessTimeline.from('.business h3', {
    y: 40,
    opacity: 0,
    duration: 1.0,
    ease: 'power2.out',
});

if (isMobile()) {
    document.querySelectorAll('.business .item').forEach((card) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: ANIMATION_CONFIG.triggerStart,
                toggleActions: ANIMATION_CONFIG.toggleActions,
            },
            y: 60,
            opacity: 0,
            scale: 0.9,
            duration: 1.2,
            ease: 'back.out(1.2)',
        });
    });
} else {
    businessTimeline.from(
        '.business .item',
        {
            y: 60,
            opacity: 0,
            scale: 0.9,
            rotation: 2,
            duration: 1.4,
            stagger: 0.2,
            ease: 'back.out(1.2)',
        },
        '-=0.6'
    );
}

// 메인 - 포인트 섹션
const pointTexts = gsap.utils.toArray('.point .ani_text p').slice(0, 4);

function getPointRadius() {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 480) {
        return 70;
    } else if (screenWidth <= 768) {
        return 75;
    } else if (screenWidth <= 1200) {
        return 100;
    }
    return 120;
}

let radius = getPointRadius();
const totalTexts = pointTexts.length;

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

window.addEventListener('resize', () => {
    const newRadius = getPointRadius();
    if (newRadius !== radius) {
        radius = newRadius;
        initializePointTexts();
        ScrollTrigger.refresh();
    }
});

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
            const baseAngle = (index / (totalTexts - 1)) * Math.PI;
            const currentAngle = baseAngle - (rotationProgress * Math.PI) / (totalTexts - 1);

            const y = Math.sin(currentAngle) * radius;
            const z = Math.cos(currentAngle) * radius;
            const rotateX = -((currentAngle * 180) / Math.PI);
            const rotateY = Math.cos(currentAngle) * 20;

            const normalizedAngle = ((currentAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            const isFocus = normalizedAngle < 0.3 || normalizedAngle > Math.PI * 2 - 0.3;

            gsap.set(text, {
                y: y,
                z: z,
                rotateX: rotateX,
            });

            if (isFocus) {
                text.classList.add('focus');
            } else {
                text.classList.remove('focus');
            }
        });
    },
    pinSpacing: false,
});

// 메인 - 시스템 섹션 (수정: 모바일은 각 카드마다 개별 trigger)
if (isMobile()) {
    document.querySelectorAll('.system .item').forEach((card) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: ANIMATION_CONFIG.triggerStart,
                toggleActions: ANIMATION_CONFIG.toggleActions,
            },
            opacity: 0,
            y: 80,
            scale: 0.9,
            duration: 1.2,
            ease: 'power3.out',
        });
    });
} else {
    gsap.from('.system .item', {
        scrollTrigger: {
            trigger: '.system .card',
            start: ANIMATION_CONFIG.triggerStart,
            toggleActions: ANIMATION_CONFIG.toggleActions,
        },
        opacity: 0,
        y: 80,
        duration: 1.2,
        ease: 'power3.out',
    });
}

// ====================== FC 모집 페이지 ====================== //

gsap.from('.fc_recruit .fc_text .container', {
    scrollTrigger: {
        trigger: '.fc_recruit .fc_text .container',
        start: ANIMATION_CONFIG.triggerStart,
        toggleActions: ANIMATION_CONFIG.toggleActions,
    },
    opacity: 0,
    y: 50,
    scale: 0.95,
    duration: 1.6,
    ease: 'power3.out',
});

gsap.from('.fc_recruit .technic .t_title', {
    scrollTrigger: {
        trigger: '.fc_recruit .technic .t_title',
        start: ANIMATION_CONFIG.triggerStart,
        toggleActions: ANIMATION_CONFIG.toggleActions,
    },
    opacity: 0,
    y: 40,
    scale: 0.9,
    duration: 1.2,
    ease: 'elastic.out(1, 0.5)',
});

const technicTl = gsap.timeline({
    scrollTrigger: {
        trigger: '.fc_recruit .technic .content',
        start: ANIMATION_CONFIG.triggerStart,
        toggleActions: ANIMATION_CONFIG.toggleActions,
    },
});

technicTl
    .from('.fc_recruit .technic .content .left', {
        opacity: 0,
        x: -80,
        rotationY: -20,
        duration: 0.8,
        ease: 'back.out(1.4)',
    })
    .from(
        '.fc_recruit .technic .content .mid',
        {
            opacity: 0,
            scale: 0.5,
            rotation: 180,
            duration: 0.6,
            ease: 'back.out(2)',
        },
        '-=0.3'
    )
    .from(
        '.fc_recruit .technic .content .right',
        {
            opacity: 0,
            x: 80,
            rotationY: 20,
            duration: 0.8,
            ease: 'back.out(1.4)',
        },
        '-=0.4'
    )
    .from(
        '.fc_recruit .technic .bottom',
        {
            opacity: 0,
            y: 50,
            scale: 0.9,
            duration: 1,
            ease: 'power2.out',
        },
        '-=0.2'
    );

// FC - 실적 집중 영역 (수정: 모바일은 각 카드마다 개별 trigger)
if (isMobile()) {
    document.querySelectorAll('.fc_recruit .focus ul li').forEach((card) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: ANIMATION_CONFIG.triggerStart,
                toggleActions: ANIMATION_CONFIG.toggleActions,
            },
            opacity: 0,
            y: 80,
            scale: 0.9,
            duration: 1.0,
            ease: 'back.out(1.2)',
        });
    });
} else {
    gsap.from('.fc_recruit .focus ul li', {
        scrollTrigger: {
            trigger: '.fc_recruit .focus ul',
            start: ANIMATION_CONFIG.triggerStart,
            toggleActions: ANIMATION_CONFIG.toggleActions,
        },
        opacity: 0,
        y: 80,
        scale: 0.8,
        rotationX: 15,
        duration: 1.2,
        stagger: {
            amount: 1,
            from: 'start',
            ease: 'power2.inOut',
        },
        ease: 'back.out(1.3)',
    });
}

// FC - 직원 후기 (수정: 모바일은 각 카드마다 개별 trigger + 텍스트 뷰포트)
if (isMobile()) {
    document.querySelectorAll('.fc_recruit .stories .card').forEach((card) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: ANIMATION_CONFIG.triggerStart,
                toggleActions: ANIMATION_CONFIG.toggleActions,
            },
            opacity: 0,
            y: 80,
            scale: 0.9,
            duration: 1.2,
            ease: 'power3.out',
        });
    });

    gsap.from('.fc_recruit .stories .fc_title', {
        scrollTrigger: {
            trigger: '.fc_recruit .stories .fc_title',
            start: ANIMATION_CONFIG.triggerStart,
            toggleActions: ANIMATION_CONFIG.toggleActions,
        },
        opacity: 0,
        y: 40,
        scale: 0.95,
        duration: 1.4,
        ease: 'power2.out',
    });
} else {
    const storiesTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.fc_recruit .stories .card_wrap',
            start: ANIMATION_CONFIG.triggerStart,
            toggleActions: ANIMATION_CONFIG.toggleActions,
        },
    });

    storiesTl
        .from('.fc_recruit .stories .card', {
            opacity: 0,
            y: 100,
            scale: 0.9,
            rotationX: 10,
            duration: 1.4,
            stagger: 0.3,
            ease: 'power3.out',
        })
        .from(
            '.fc_recruit .stories .fc_title',
            {
                opacity: 0,
                y: 40,
                scale: 0.95,
                duration: 1.6,
                ease: 'power2.out',
            },
            '-=0.5'
        );
}

// ====================== 지사장 모집 페이지 ====================== //

// 지사 현황 섹션 (원본 유지)
function getJisaAnimationEnd() {
    return 'center top';
}

const jisaTimeline = gsap.timeline({
    scrollTrigger: {
        trigger: '.branch_recruit .jisa',
        start: 'top top',
        end: getJisaAnimationEnd(),
        scrub: 1,
        markers: false,
        pin: true,
    },
});

jisaTimeline.to(
    '.branch_recruit .jisa',
    {
        backgroundColor: 'rgba(0, 0, 0, 0.255)',
        duration: 0.5,
        ease: 'power2.inOut',
    },
    0
);

jisaTimeline.to(
    '.branch_recruit .jisa img',
    {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
    },
    0.2
);

jisaTimeline.from(
    '.branch_recruit .jisa .title',
    {
        opacity: 0,
        y: 100,
        duration: 0.7,
        ease: 'power3.out',
    },
    0.3
);

// 지사장 - 파트너십 (수정: 모바일은 각 카드마다 개별 trigger)
gsap.from('.branch_recruit .partnership .branch_title', {
    scrollTrigger: {
        trigger: '.branch_recruit .partnership',
        start: ANIMATION_CONFIG.triggerStart,
        toggleActions: ANIMATION_CONFIG.toggleActions,
    },
    opacity: 0,
    y: 40,
    scale: 0.9,
    duration: 1.2,
    ease: 'elastic.out(1, 0.6)',
});

if (isMobile()) {
    document.querySelectorAll('.branch_recruit .partnership .box_wrap .box').forEach((card) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: ANIMATION_CONFIG.triggerStart,
                toggleActions: ANIMATION_CONFIG.toggleActions,
            },
            opacity: 0,
            y: 60,
            scale: 0.9,
            duration: 1.0,
            ease: 'back.out(1.3)',
        });
    });
} else {
    const partnershipTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.branch_recruit .partnership .box_wrap',
            start: ANIMATION_CONFIG.triggerStart,
            toggleActions: ANIMATION_CONFIG.toggleActions,
        },
    });

    partnershipTl
        .from('.branch_recruit .partnership .box1', {
            opacity: 0,
            y: 60,
            x: -30,
            rotation: -5,
            duration: 1,
            ease: 'back.out(1.4)',
        })
        .from(
            '.branch_recruit .partnership .box2',
            {
                opacity: 0,
                y: 60,
                x: 30,
                rotation: 5,
                duration: 1,
                ease: 'back.out(1.4)',
            },
            '-=0.7'
        )
        .from(
            '.branch_recruit .partnership .box3',
            {
                opacity: 0,
                y: 60,
                x: -30,
                rotation: -5,
                duration: 1,
                ease: 'back.out(1.4)',
            },
            '-=0.7'
        )
        .from(
            '.branch_recruit .partnership .box4',
            {
                opacity: 0,
                y: 60,
                x: 30,
                rotation: 5,
                duration: 1,
                ease: 'back.out(1.4)',
            },
            '-=0.7'
        );
}

// 지사장 - 인터뷰 (수정: 모바일은 각 카드마다 개별 trigger)
gsap.from('.branch_recruit .interview .branch_title', {
    scrollTrigger: {
        trigger: '.branch_recruit .interview',
        start: ANIMATION_CONFIG.triggerStart,
        toggleActions: ANIMATION_CONFIG.toggleActions,
    },
    opacity: 0,
    y: 30,
    scale: 0.95,
    duration: 1.2,
    ease: 'power2.out',
});

if (isMobile()) {
    document.querySelectorAll('.branch_recruit .interview .box_wrap .box').forEach((card) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: ANIMATION_CONFIG.triggerStart,
                toggleActions: ANIMATION_CONFIG.toggleActions,
            },
            opacity: 0,
            y: 80,
            scale: 0.9,
            duration: 1.2,
            stagger: 0.3,
            ease: 'back.out(1.2)',
        });
    });
} else {
    gsap.from('.branch_recruit .interview .box_wrap .box', {
        scrollTrigger: {
            trigger: '.branch_recruit .interview .box_wrap',
            start: ANIMATION_CONFIG.triggerStart,
            toggleActions: ANIMATION_CONFIG.toggleActions,
        },
        opacity: 0,
        y: 80,
        rotationY: 15,
        scale: 0.9,
        duration: 1.2,
        ease: 'back.out(1.2)',
    });
}

// 지사장 - 개설 지원 (수정: 모바일은 각 카드마다 개별 trigger)
if (isMobile()) {
    document.querySelectorAll('.branch_recruit .help .box_wrap .box').forEach((card) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: ANIMATION_CONFIG.triggerStart,
                toggleActions: ANIMATION_CONFIG.toggleActions,
            },
            opacity: 0,
            y: 80,
            scale: 0.9,
            duration: 1.0,
            ease: 'back.out(1.2)',
        });
    });
} else {
    gsap.from('.branch_recruit .help .box_wrap .box', {
        scrollTrigger: {
            trigger: '.branch_recruit .help .box_wrap',
            start: ANIMATION_CONFIG.triggerStart,
            toggleActions: ANIMATION_CONFIG.toggleActions,
        },
        opacity: 0,
        x: -120,
        rotationY: -10,
        duration: 1.4,
        stagger: 0.2,
        ease: 'power3.out',
    });
}

// ====================== 센터장 모집 페이지 ====================== //

// 센터장 - 하는 일 (수정: 모바일은 각 카드마다 개별 trigger)
if (isMobile()) {
    document.querySelectorAll('.center_recruit .job .box_wrap .item').forEach((card) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: ANIMATION_CONFIG.triggerStart,
                toggleActions: ANIMATION_CONFIG.toggleActions,
            },
            opacity: 0,
            y: 80,
            scale: 0.9,
            duration: 1.2,
            ease: 'back.out(1.3)',
        });
    });
} else {
    gsap.from('.center_recruit .job .box_wrap .item', {
        scrollTrigger: {
            trigger: '.center_recruit .job .box_wrap',
            start: ANIMATION_CONFIG.triggerStart,
            toggleActions: ANIMATION_CONFIG.toggleActions,
        },
        opacity: 0,
        y: 80,
        scale: 0.85,
        rotationY: 20,
        duration: 1.4,
        stagger: {
            amount: 0.6,
            from: 'center',
            ease: 'power2.out',
        },
        ease: 'back.out(1.3)',
    });
}

// 센터장 - 텍스트
gsap.from('.center_recruit .center_text h3', {
    scrollTrigger: {
        trigger: '.center_recruit .center_text',
        start: ANIMATION_CONFIG.triggerStart,
        toggleActions: ANIMATION_CONFIG.toggleActions,
    },
    opacity: 0,
    y: 60,
    scale: 0.9,
    duration: 1.6,
    ease: 'power2.out',
});

// 센터장 - 차별점 (수정: 모바일은 각 카드마다 개별 trigger)
if (isMobile()) {
    document.querySelectorAll('.center_recruit .different .icon_wrap .item').forEach((card) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: ANIMATION_CONFIG.triggerStart,
                toggleActions: ANIMATION_CONFIG.toggleActions,
            },
            opacity: 0,
            scale: 0.5,
            y: 60,
            duration: 1.2,
            ease: 'back.out(1.3)',
        });
    });
} else {
    gsap.from('.center_recruit .different .icon_wrap .item', {
        scrollTrigger: {
            trigger: '.center_recruit .different .icon_wrap',
            start: ANIMATION_CONFIG.triggerStart,
            toggleActions: ANIMATION_CONFIG.toggleActions,
        },
        opacity: 0,
        scale: 0.3,
        rotation: 180,
        y: 80,
        duration: 1.6,
        stagger: {
            amount: 0.8,
            from: 'center',
            ease: 'back.inOut(2)',
        },
        ease: 'elastic.out(1, 0.5)',
    });
}

gsap.from('.center_recruit .different h4', {
    scrollTrigger: {
        trigger: '.center_recruit .different h4',
        start: ANIMATION_CONFIG.triggerStart,
        toggleActions: ANIMATION_CONFIG.toggleActions,
    },
    opacity: 0,
    y: 40,
    scale: 0.95,
    duration: 1.4,
    ease: 'power3.out',
});

// 센터장 - 비전
gsap.from('.center_recruit .vision .count', {
    scrollTrigger: {
        trigger: '.center_recruit .vision .count',
        start: ANIMATION_CONFIG.triggerStart,
        toggleActions: ANIMATION_CONFIG.toggleActions,
    },
    opacity: 0,
    scale: 0.7,
    rotationY: 10,
    duration: 1.2,
    ease: 'elastic.out(1, 0.6)',
});

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

gsap.set('.center_recruit .vision .graph', {
    minHeight: '350px',
});

gsap.fromTo(
    '.center_recruit .vision .graph .stick',
    { scaleY: 0, transformOrigin: 'bottom' },
    {
        scrollTrigger: {
            trigger: '.center_recruit .vision .graph',
            start: ANIMATION_CONFIG.triggerStart,
            toggleActions: ANIMATION_CONFIG.toggleActions,
        },
        scaleY: 1,
        duration: 1.2,
        stagger: 0.15,
        delay: 0.3,
        ease: 'power2.out',
    }
);

gsap.from('.center_recruit .vision .graph .s_wrap h5', {
    scrollTrigger: {
        trigger: '.center_recruit .vision .graph',
        start: ANIMATION_CONFIG.triggerStart,
        toggleActions: ANIMATION_CONFIG.toggleActions,
    },
    opacity: 0,
    y: -20,
    duration: 0.8,
    stagger: 0.15,
    delay: 0.6,
    ease: 'power2.out',
});

gsap.from('.center_recruit .vision .graph .bottom h6', {
    scrollTrigger: {
        trigger: '.center_recruit .vision .graph',
        start: ANIMATION_CONFIG.triggerStart,
        toggleActions: ANIMATION_CONFIG.toggleActions,
    },
    opacity: 0,
    y: 20,
    duration: 0.6,
    stagger: 0.1,
    delay: 0.8,
    ease: 'power2.out',
});

// 센터장 - 센터 개설 지원 (수정: 모바일은 각 카드마다 개별 trigger)
if (isMobile()) {
    document.querySelectorAll('.center_recruit .backup ul li').forEach((card) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: ANIMATION_CONFIG.triggerStart,
                toggleActions: ANIMATION_CONFIG.toggleActions,
            },
            opacity: 0,
            y: 80,
            scale: 0.9,
            duration: 1.2,
            ease: 'back.out(1.2)',
        });
    });
} else {
    gsap.from('.center_recruit .backup ul li', {
        scrollTrigger: {
            trigger: '.center_recruit .backup ul',
            start: ANIMATION_CONFIG.triggerStart,
            toggleActions: ANIMATION_CONFIG.toggleActions,
        },
        opacity: 0,
        y: 100,
        scale: 0.8,
        rotationX: 15,
        duration: 1.4,
        stagger: {
            amount: 0.8,
            from: 'start',
            ease: 'power2.out',
        },
        ease: 'back.out(1.2)',
    });
}

gsap.from('.center_recruit .backup h3', {
    scrollTrigger: {
        trigger: '.center_recruit .backup',
        start: ANIMATION_CONFIG.triggerStart,
        toggleActions: ANIMATION_CONFIG.toggleActions,
    },
    opacity: 0,
    y: 40,
    scale: 0.9,
    duration: 1.2,
    ease: 'power2.out',
});

// 공통 인터뷰 섹션 (수정: 모바일은 각 카드마다 개별 trigger)
if (isMobile()) {
    document.querySelectorAll('.common_interview .box_wrap .box').forEach((card) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: ANIMATION_CONFIG.triggerStart,
                toggleActions: ANIMATION_CONFIG.toggleActions,
            },
            opacity: 0,
            y: 80,
            scale: 0.9,
            duration: 1.2,
            ease: 'back.out(1.2)',
        });
    });
}

// 센터장 인터뷰 (PC만 - 모바일은 이미 위에 있음)
if (!isMobile()) {
    gsap.from('.center_recruit .interview .box_wrap .box', {
        scrollTrigger: {
            trigger: '.center_recruit .interview .box_wrap',
            start: ANIMATION_CONFIG.triggerStart,
            toggleActions: ANIMATION_CONFIG.toggleActions,
        },
        opacity: 0,
        y: 80,
        rotationY: -15,
        scale: 0.9,
        duration: 1.3,
        ease: 'power3.out',
    });
}

// 페이지 로드 완료 시 추가 체크
window.addEventListener('load', () => {
    const pointBox = document.querySelector('.point_box');
    if (pointBox && !pointBox.classList.contains('bg-loaded')) {
        aggressivePreloadImages();
    }
});

// 페이지 가시성 변경 시 재시도
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        const pointBox = document.querySelector('.point_box');
        if (pointBox && !pointBox.classList.contains('bg-loaded')) {
            aggressivePreloadImages();
        }
    }
});
