gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.create({
    start: '20px top',
    onEnter: () => {
        gsap.to('.header', {
            y: 0,
            backgroundColor: 'var(--bs-white)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            duration: 0.1, // 전환 속도 빠르게
            ease: 'power1.out', // 가벼운 easing
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
            color: 'var(--bs-white)', // 원래 색으로 확실히 복원
            duration: 0.1,
        });
    },
});
