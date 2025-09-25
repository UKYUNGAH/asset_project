gsap.registerPlugin(ScrollTrigger);

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

gsap.from('.business h3', {
    scrollTrigger: {
        trigger: '.business h3', // h3 자체 기준
        start: 'top 90%', // h3의 top이 뷰포트 80% 지점에 왔을 때 시작
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
    stagger: 0.2, // 카드 순서대로
    ease: 'power3.out',
});
