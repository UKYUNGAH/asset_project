gsap.registerPlugin(ScrollTrigger);

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
gsap.from('.business h3', {
    scrollTrigger: {
        trigger: '.business h3',
        start: 'top 85%', // 조금 더 일찍 시작
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 40, // 이동거리 줄임
    scale: 0.95, // 살짝 스케일 효과 추가
    duration: 1.8, // 더 여유롭게
    ease: 'power2.out',
});

gsap.from('.business .item', {
    scrollTrigger: {
        trigger: '.business .card',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 60,
    scale: 0.9,
    rotation: 2,
    duration: 1.4,
    stagger: {
        amount: 0.6,
        from: 'start',
        ease: 'power2.inOut',
    },
    ease: 'back.out(1.2)',
});

// 메인 - 롤링 섹션
const pointTexts = gsap.utils.toArray('.point .ani_text p');
const radius = 90;
const totalTexts = pointTexts.length;

// 초기 위치
pointTexts.forEach((text, index) => {
    const angle = (index / totalTexts) * Math.PI * 2;
    const y = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;

    gsap.set(text, {
        y: y,
        z: z,
        rotateX: -((angle * 180) / Math.PI),
    });
});

// 스크롤에 따른 회전
ScrollTrigger.create({
    trigger: '.business',
    start: 'bottom 20%',
    end: '+=150%',
    scrub: 1,
    onUpdate: (self) => {
        const progress = self.progress;
        const rotationProgress = progress * (totalTexts + 1);

        pointTexts.forEach((text, index) => {
            const baseAngle = (index / totalTexts) * Math.PI * 2;
            const currentAngle = baseAngle - (rotationProgress * Math.PI * 2) / totalTexts;

            const y = Math.sin(currentAngle) * radius;
            const z = Math.cos(currentAngle) * radius;
            const rotateX = -((currentAngle * 180) / Math.PI);

            const isFocus =
                Math.abs(currentAngle % (Math.PI * 2)) < 0.5 ||
                Math.abs(currentAngle % (Math.PI * 2)) > Math.PI * 2 - 0.5;

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
        start: 'top 70%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 50,
    scale: 0.95,
    duration: 2, // 더 길게
    ease: 'power3.out',
});

// FC 모집 - 영업기법 섹션
gsap.from('.fc_recruit .technic .t_title', {
    scrollTrigger: {
        trigger: '.fc_recruit .technic .t_title',
        start: 'top 75%',
        toggleActions: 'play none none reverse',
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
        start: 'top 80%',
        toggleActions: 'play none none reverse',
    },
});

// 왼쪽 박스
technicTl
    .from('.fc_recruit .technic .content .left', {
        opacity: 0,
        x: -80,
        rotationY: -20,
        duration: 0.8,
        ease: 'back.out(1.4)',
    })
    // 중간 화살표
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
    // 오른쪽 박스
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
    // 하단 텍스트
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
// 지사장 모집 - 지사 현황 섹션
gsap.from('.branch_recruit .jisa', {
    scrollTrigger: {
        trigger: '.branch_recruit .jisa',
        start: 'top 70%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 50,
    scale: 0.95,
    duration: 1.8,
    ease: 'power3.out',
});

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

// 인터뷰 박스 - 3D 효과로 적용
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
    duration: 2.2, // 더 길게
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
        start: 'top 85%',
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
        start: 'top 85%',
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
