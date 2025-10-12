gsap.registerPlugin(ScrollTrigger);

// 헤더 스크롤 애니메이션
// ScrollTrigger.create({
//     start: '20px top',
//     onEnter: () => {
//         gsap.to('.header', {
//             y: 0,
//             backgroundColor: 'var(--bs-white)',
//             boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
//             duration: 0.1,
//             ease: 'power1.out',
//         });

//         gsap.to('.header li a:not(.on)', {
//             color: 'var(--bs-black)',
//             duration: 0.1,
//         });
//     },
//     onLeaveBack: () => {
//         gsap.to('.header', {
//             backgroundColor: 'transparent',
//             boxShadow: 'none',
//             duration: 0.1,
//             ease: 'power1.out',
//         });

//         gsap.to('.header li a:not(.on)', {
//             color: 'var(--bs-white)',
//             duration: 0.1,
//         });
//     },
// });

gsap.registerPlugin(ScrollTrigger);

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

// business 섹션 애니메이션
gsap.from('.business h3', {
    scrollTrigger: {
        trigger: '.business h3',
        start: 'top 90%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 60,
    duration: 1,
    ease: 'power2.out',
});

gsap.from('.business .item', {
    scrollTrigger: {
        trigger: '.business .card',
        start: 'top 75%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 50,
    duration: 1,
    stagger: 0.2,
    ease: 'power3.out',
});

// point 섹션 핀 고정
ScrollTrigger.create({
    trigger: '.point',
    start: 'top top',
    end: '+=300%',
    pin: true,
    pinSpacing: true, // true로 변경
});

// 3D 원통형 회전 애니메이션
const pointTexts = gsap.utils.toArray('.point .ani_text p');
const radius = 90;
const totalTexts = pointTexts.length;

// 초기 위치 설정
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
    trigger: '.point',
    start: 'top top',
    end: '+=300%',
    scrub: 1,
    onUpdate: (self) => {
        const progress = self.progress;
        const rotationProgress = progress * (totalTexts - 1);

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
    pinSpacing: false, // false로 변경!
});

// system 섹션 애니메이션
gsap.from('.system h3', {
    scrollTrigger: {
        trigger: '.system',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 50,
    duration: 1,
});

gsap.from('.system .item', {
    scrollTrigger: {
        trigger: '.system .card',
        start: 'top 75%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 50,
    duration: 1,
    stagger: 0.2,
    ease: 'power3.out',
});

// ====================== FC 모집 페이지 애니메이션 ====================== //

// FC 텍스트 섹션 애니메이션 (아래에서 위로 페이드인)
gsap.from('.fc_recruit .fc_text .container', {
    scrollTrigger: {
        trigger: '.fc_recruit .fc_text .container',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 80,
    duration: 1.2,
    ease: 'power2.out',
});

// 영업기법 영역 타이틀 애니메이션
gsap.from('.fc_recruit .technic .t_title', {
    scrollTrigger: {
        trigger: '.fc_recruit .technic .t_title',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 60,
    duration: 1,
    ease: 'power2.out',
});

// 영업기법 영역 애니메이션
// (1) 왼쪽 박스 - 왼쪽에서 오른쪽으로 페이드인
gsap.from('.fc_recruit .technic .content .left', {
    scrollTrigger: {
        trigger: '.fc_recruit .technic .content',
        start: 'top 75%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    x: -80,
    duration: 0.8,
    ease: 'power2.out',
});

// (2) 중간 화살표 - 왼쪽에서 오른쪽으로 페이드인 (0.2초 후)
gsap.from('.fc_recruit .technic .content .mid', {
    scrollTrigger: {
        trigger: '.fc_recruit .technic .content',
        start: 'top 75%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    x: -80,
    duration: 0.8,
    delay: 0.2,
    ease: 'power2.out',
});

// (3) 오른쪽 박스 - 왼쪽에서 오른쪽으로 페이드인 (0.4초 후)
gsap.from('.fc_recruit .technic .content .right', {
    scrollTrigger: {
        trigger: '.fc_recruit .technic .content',
        start: 'top 75%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    x: -80,
    duration: 0.8,
    delay: 0.4,
    ease: 'power2.out',
});

// (4) 하단 텍스트 - 아래에서 위로 페이드인 (0.6초 후)
gsap.from('.fc_recruit .technic .bottom', {
    scrollTrigger: {
        trigger: '.fc_recruit .technic .content',
        start: 'top 75%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 60,
    duration: 0.8,
    delay: 0.6,
    ease: 'power2.out',
});

// 실적 집중 솔루션 타이틀
gsap.from('.fc_recruit .focus .fc_title', {
    scrollTrigger: {
        trigger: '.fc_recruit .focus .fc_title',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 60,
    duration: 1,
    ease: 'power2.out',
});

// 실적 집중 솔루션 영역 애니메이션
gsap.from('.fc_recruit .focus ul li:nth-child(1)', {
    scrollTrigger: {
        trigger: '.fc_recruit .focus ul li:nth-child(1)',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 80,
    duration: 0.8,
    ease: 'power2.out',
});

gsap.from('.fc_recruit .focus ul li:nth-child(2)', {
    scrollTrigger: {
        trigger: '.fc_recruit .focus ul li:nth-child(2)',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 80,
    duration: 0.8,
    delay: 0.15,
    ease: 'power2.out',
});

gsap.from('.fc_recruit .focus ul li:nth-child(3)', {
    scrollTrigger: {
        trigger: '.fc_recruit .focus ul li:nth-child(3)',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 80,
    duration: 0.8,
    ease: 'power2.out',
});

gsap.from('.fc_recruit .focus ul li:nth-child(4)', {
    scrollTrigger: {
        trigger: '.fc_recruit .focus ul li:nth-child(4)',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 80,
    duration: 0.8,
    delay: 0.15,
    ease: 'power2.out',
});

// 직원 후기 영역 애니메이션
gsap.from('.fc_recruit .stories .card:nth-child(1)', {
    scrollTrigger: {
        trigger: '.fc_recruit .stories .card:nth-child(1)',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 80,
    duration: 0.8,
    ease: 'power2.out',
});

gsap.from('.fc_recruit .stories .card:nth-child(2)', {
    scrollTrigger: {
        trigger: '.fc_recruit .stories .card:nth-child(2)',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 80,
    duration: 0.8,
    delay: 0.15,
    ease: 'power2.out',
});

// 마지막 타이틀
gsap.from('.fc_recruit .stories .fc_title', {
    scrollTrigger: {
        trigger: '.fc_recruit .stories .fc_title',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 60,
    duration: 1,
    ease: 'power2.out',
});

// ====================== 지사장 모집 페이지 애니메이션 ====================== //

// 배너 영역 애니메이션
gsap.from('.branch_recruit .br_banner .ment', {
    scrollTrigger: {
        trigger: '.branch_recruit .br_banner',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 80,
    duration: 1.2,
    ease: 'power2.out',
});

// 지사 현황 타이틀 애니메이션
gsap.from('.branch_recruit .jisa .branch_title', {
    scrollTrigger: {
        trigger: '.branch_recruit .jisa',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 60,
    duration: 1,
    ease: 'power2.out',
});

gsap.from('.branch_recruit .jisa .sub_title', {
    scrollTrigger: {
        trigger: '.branch_recruit .jisa',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 40,
    duration: 1,
    delay: 0.2,
    ease: 'power2.out',
});

// 파트너쉽 혜택 타이틀
gsap.from('.branch_recruit .partnership .branch_title', {
    scrollTrigger: {
        trigger: '.branch_recruit .partnership',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 60,
    duration: 1,
    ease: 'power2.out',
});

// 파트너쉽 박스들 애니메이션
gsap.from('.branch_recruit .partnership .box1', {
    scrollTrigger: {
        trigger: '.branch_recruit .partnership .box1',
        start: 'top 85%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 80,
    duration: 0.8,
    ease: 'power2.out',
});

gsap.from('.branch_recruit .partnership .box2', {
    scrollTrigger: {
        trigger: '.branch_recruit .partnership .box2',
        start: 'top 85%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 80,
    duration: 0.8,
    delay: 0.15,
    ease: 'power2.out',
});

gsap.from('.branch_recruit .partnership .box3', {
    scrollTrigger: {
        trigger: '.branch_recruit .partnership .box3',
        start: 'top 85%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 80,
    duration: 0.8,
    ease: 'power2.out',
});

gsap.from('.branch_recruit .partnership .box4', {
    scrollTrigger: {
        trigger: '.branch_recruit .partnership .box4',
        start: 'top 85%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 80,
    duration: 0.8,
    delay: 0.15,
    ease: 'power2.out',
});

// 지사장 인터뷰 타이틀
gsap.from('.branch_recruit .interview .branch_title', {
    scrollTrigger: {
        trigger: '.branch_recruit .interview',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 60,
    duration: 1,
    ease: 'power2.out',
});

// 인터뷰 박스들 애니메이션
gsap.from('.branch_recruit .interview .box_wrap .box', {
    scrollTrigger: {
        trigger: '.branch_recruit .interview .box_wrap',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 80,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power2.out',
});

// 지사 개설 지원 타이틀
gsap.from('.branch_recruit .help .branch_title', {
    scrollTrigger: {
        trigger: '.branch_recruit .help',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 60,
    duration: 1,
    ease: 'power2.out',
});

// 지사 개설 지원 박스들 애니메이션
gsap.from('.branch_recruit .help .box_wrap .box', {
    scrollTrigger: {
        trigger: '.branch_recruit .help .box_wrap',
        start: 'top 85%',
        toggleActions: 'play none none reverse',
    },
    opacity: 0,
    x: -60,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power2.out',
});
