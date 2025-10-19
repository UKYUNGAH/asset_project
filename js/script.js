gsap.registerPlugin(ScrollTrigger);

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

// 이미지 미리 로드 및 최적화
async function preloadOptimizedImages() {
    const isWebPSupported = await supportsWebP();

    // HTML body에 WebP 지원 클래스 추가
    document.documentElement.classList.add(isWebPSupported ? 'webp' : 'no-webp');

    // 사용할 이미지 경로 결정
    const bgImagePath = isWebPSupported ? '/images/point_bg.webp' : '/images/point_bg.jpg';

    // 이미지 미리 로드
    const preloadImage = new Image();

    return new Promise((resolve) => {
        preloadImage.onload = () => {
            const pointBox = document.querySelector('.point_box');
            if (pointBox) {
                pointBox.classList.add('bg-loaded');
            }
            resolve(true);
        };

        preloadImage.onerror = () => {
            if (isWebPSupported) {
                const fallbackImage = new Image();
                fallbackImage.onload = () => {
                    const pointBox = document.querySelector('.point_box');
                    if (pointBox) {
                        pointBox.classList.add('bg-loaded');
                    }
                    resolve(true);
                };
                fallbackImage.src = '/images/point_bg.jpg';
            } else {
                resolve(false);
            }
        };

        preloadImage.src = bgImagePath;
    });
}

// DOM 로드 완료 시 실행
document.addEventListener('DOMContentLoaded', async function () {
    // 1. 즉시 WebP 감지 및 이미지 로드 시작
    preloadOptimizedImages();

    // 2. Intersection Observer로 추가 최적화
    const isMobile = window.innerWidth <= 768;
    const rootMarginValue = isMobile ? '100%' : '500px';
    const observerOptions = {
        root: null,
        rootMargin: rootMarginValue,
        threshold: 0,
    };

    const pointObserver = new IntersectionObserver(async (entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                const pointBox = entry.target.querySelector('.point_box');
                if (pointBox && !pointBox.classList.contains('bg-preloaded')) {
                    await preloadOptimizedImages();
                    pointBox.classList.add('bg-preloaded');
                }
                pointObserver.unobserve(entry.target);
                break;
            }
        }
    }, observerOptions);

    // point 섹션 관찰 시작
    const pointSection = document.querySelector('.point');
    if (pointSection) {
        pointObserver.observe(pointSection);
    }
    // 햄버거 메뉴 기능
    const hamBtn = document.querySelector('.ham_btn');
    const hamGnb = document.querySelector('.ham_gnb');
    const hamIcon = document.querySelector('.ham_icon');
    const header = document.querySelector('.header');

    let isMenuOpen = false;

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

    // 메뉴 링크 클릭 시 메뉴 닫기
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
});

// 헤더 스크롤 애니메이션 (메인 페이지에만 적용) - 유지
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
// 메인 - 비지니스 섹션
const businessTimeline = gsap.timeline({
    scrollTrigger: {
        trigger: '.business',
        start: 'top bottom',
        scrub: false,
    },
});

businessTimeline.from('.business h3', { y: 40, opacity: 0, duration: 1.2, ease: 'power2.out' }).from(
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
); // h3 애니메이션 끝나기 전에 살짝 겹치게 시작

// ====================== 메인 - 포인트 섹션 ====================== //
const pointTexts = gsap.utils.toArray('.point .ani_text p').slice(0, 4);

// 수정: 반응형 radius 계산
function getPointRadius() {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 480) {
        return 70; // 모바일 소
    } else if (screenWidth <= 768) {
        return 75; // 모바일 대
    } else if (screenWidth <= 1200) {
        return 100; // 태블릿
    }
    return 120; // 데스크톱
}

let radius = getPointRadius();
const totalTexts = pointTexts.length;

// 초기 위치 설정 - 반원형 (0 ~ π)
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

// 수정: 초기 실행
initializePointTexts();

// 수정: 리사이즈 시 반응형 업데이트
window.addEventListener('resize', () => {
    const newRadius = getPointRadius();
    if (newRadius !== radius) {
        radius = newRadius;
        initializePointTexts();
        ScrollTrigger.refresh(); // ScrollTrigger 업데이트
    }
});

// 스크롤에 따른 회전
const isMobile = window.innerWidth <= 768;
ScrollTrigger.create({
    trigger: '.point', // point 섹션 진입 기준
    start: 'top top', // 수정: point가 화면 100vh에 도달했을 때 시작
    end: 'center top', // 수정: 롤링 완료 후 마지막 상태 유지
    scrub: isMobile ? false : 1, // 모바일에서 scrub false로 렉 줄임
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

// 메인 - 시스템 섹션
gsap.from('.system .item', {
    scrollTrigger: {
        trigger: '.system .card',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 80,
    duration: 1.2,
    ease: 'power3.out',
});

// ====================== FC 모집 페이지 애니메이션 ====================== //
// FC 모집 - 텍스트 섹션
gsap.from('.fc_recruit .fc_text .container', {
    scrollTrigger: {
        trigger: '.fc_recruit .fc_text .container',
        start: 'top 90%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 80,
    scale: 0.95,
    duration: 1.2,
    ease: 'power2.out',
});

// FC 모집 - 영업기법 영역
const technicTl = gsap.timeline({
    scrollTrigger: {
        trigger: '.fc_recruit .technic',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
    },
});

technicTl
    .from('.fc_recruit .technic .t_title', {
        opacity: 0,
        y: 40,
        scale: 0.9,
        duration: 0.8,
        ease: 'power2.out',
    })
    .from(
        '.fc_recruit .technic .content .left',
        {
            opacity: 0,
            x: -80,
            rotationY: -20,
            duration: 0.8,
            ease: 'back.out(1.4)',
        },
        '-=0.4'
    )
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

// FC 모집 - 실적 집중 영역
gsap.from('.fc_recruit .focus ul li', {
    scrollTrigger: {
        trigger: '.fc_recruit .focus ul',
        start: 'top 75%',
        toggleActions: 'play none none reverse',
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

// FC 모집 - 직원 후기
const storiesTl = gsap.timeline({
    scrollTrigger: {
        trigger: '.fc_recruit .stories .card_wrap',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
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

// ====================== 지사장 모집 페이지 애니메이션 ====================== //
// 지사장 모집 - 지사 현황 섹션 (jisa)
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

// 지사장 모집 - 파트너십 섹션
gsap.from('.branch_recruit .partnership .branch_title', {
    scrollTrigger: {
        trigger: '.branch_recruit .partnership',
        start: 'top 85%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 40,
    scale: 0.9,
    duration: 1.4,
    ease: 'elastic.out(1, 0.6)',
});

const partnershipTl = gsap.timeline({
    scrollTrigger: {
        trigger: '.branch_recruit .partnership .box_wrap',
        start: 'top 85%',
        toggleActions: 'play none none reverse',
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

// 지사장 모집 - 인터뷰 섹션
gsap.from('.branch_recruit .interview .branch_title', {
    scrollTrigger: {
        trigger: '.branch_recruit .interview',
        start: 'top 85%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 30,
    scale: 0.95,
    duration: 1.2,
    ease: 'power2.out',
});

gsap.from('.branch_recruit .interview .box_wrap .box', {
    scrollTrigger: {
        trigger: '.branch_recruit .interview .box_wrap',
        start: 'top 85%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 80,
    rotationY: 15,
    scale: 0.9,
    duration: 1.2,
    ease: 'back.out(1.2)',
});

// 지사장 모집 - 지사 개설 지원 섹션
gsap.from('.branch_recruit .help .box_wrap .box', {
    scrollTrigger: {
        trigger: '.branch_recruit .help .box_wrap',
        start: 'top 85%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    x: -120,
    rotationY: -10,
    duration: 1.4,
    stagger: 0.2,
    ease: 'power3.out',
});

// ====================== 센터장 모집 페이지 애니메이션 ====================== //
// 센터장 모집 - 하는 일 섹션
gsap.from('.center_recruit .job .box_wrap .item', {
    scrollTrigger: {
        trigger: '.center_recruit .job .box_wrap',
        start: 'top 75%',
        toggleActions: 'play none none reverse',
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

// 센터장 모집 - 텍스트 섹션
gsap.from('.center_recruit .center_text h3', {
    scrollTrigger: {
        trigger: '.center_recruit .center_text',
        start: 'top 70%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 60,
    scale: 0.9,
    duration: 2.2,
    ease: 'power2.out',
});

// 센터장 모집 - 차별점 섹션
gsap.from('.center_recruit .different .icon_wrap .item', {
    scrollTrigger: {
        trigger: '.center_recruit .different .icon_wrap',
        start: 'top 75%',
        toggleActions: 'play none none reverse',
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

// 차별점 하단 텍스트
gsap.from('.center_recruit .different h4', {
    scrollTrigger: {
        trigger: '.center_recruit .different h4',
        start: 'top 75%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 40,
    scale: 0.95,
    duration: 1.8,
    ease: 'power3.out',
});

// 센터장 모집 - 비전 섹션
gsap.from('.center_recruit .vision .count', {
    scrollTrigger: {
        trigger: '.center_recruit .vision .count',
        start: 'top 75%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    scale: 0.7,
    rotationY: 10,
    duration: 1.6,
    ease: 'elastic.out(1, 0.6)',
});

// 그래프 애니메이션
gsap.from('.center_recruit .vision .graph', {
    scrollTrigger: {
        trigger: '.center_recruit .vision .graph',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
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
            start: 'top 75%',
            toggleActions: 'play none none reverse',
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
        start: 'top 75%',
        toggleActions: 'play none none reverse',
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
        start: 'top 75%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 20,
    duration: 0.6,
    stagger: 0.1,
    delay: 0.8,
    ease: 'power2.out',
});

// 센터장 모집 - 센터 개설 지원 섹션
gsap.from('.center_recruit .backup h3', {
    scrollTrigger: {
        trigger: '.center_recruit .backup',
        start: 'top 85%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 40,
    scale: 0.9,
    duration: 1.4,
    ease: 'power2.out',
});

gsap.from('.center_recruit .backup ul li', {
    scrollTrigger: {
        trigger: '.center_recruit .backup ul',
        start: 'top 75%',
        toggleActions: 'play none none reverse',
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

// 센터장 모집 - 센터장 인터뷰 섹션
gsap.from('.center_recruit .interview .box_wrap .box', {
    scrollTrigger: {
        trigger: '.center_recruit .interview .box_wrap',
        start: 'top 75%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 80,
    rotationY: -15,
    scale: 0.9,
    duration: 1.3,
    ease: 'power3.out',
});

// 페이지 로드 완료 시 추가 체크
window.addEventListener('load', () => {
    const pointBox = document.querySelector('.point_box');
    if (pointBox && !pointBox.classList.contains('bg-loaded')) {
        preloadOptimizedImages();
    }
});
