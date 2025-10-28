// ==================== 1. 초기 설정 & 유틸리티 ====================

// 라이브러리 로드 확인 함수
function waitForLibraries() {
  return new Promise((resolve) => {
    const checkLibraries = () => {
      // GSAP과 AOS가 모두 로드되었는지 확인
      if (
        typeof gsap !== 'undefined' &&
        typeof AOS !== 'undefined' &&
        typeof ScrollTrigger !== 'undefined'
      ) {
        resolve();
      } else {
        // 100ms 후 다시 확인
        setTimeout(checkLibraries, 100);
      }
    };
    checkLibraries();
  });
}

// GSAP 플러그인 등록 (안전하게)
async function initializeGSAP() {
  await waitForLibraries();
  gsap.registerPlugin(ScrollTrigger);
  console.log('GSAP initialized successfully');
}

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
  // #ISSUE: Local file protocol (file://) 환경에서 브라우저 CORS 정책으로 인해
  // 배경 이미지 로드가 차단됩니다.
  // 서버 배포(https/http) 환경에서는 정상적으로 이미지가 로드됩니다.
  // 참고: 로컬 개발 시 Live Server 등 웹 서버 환경에서 확인 권장
  // 로컬 파일 실행 시 건너뛰기
  if (window.location.protocol === 'file:') {
    console.log('로컬 개발 환경 - 배경 이미지 로드 건너뜀');
    return;
  }

  const isWebPSupported = await supportsWebP();
  const bgImagePath = isWebPSupported
    ? './images/point_bg.webp'
    : './images/point_bg.jpg';

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
        loadFallbackImage('./images/point_bg.jpg'); // PNG 대신 JPG
      } else {
        reject(false);
      }
    };

    img.src = bgImagePath;
  });
}

// ==================== 4. DOM 초기화 (DOMContentLoaded) ====================
document.addEventListener('DOMContentLoaded', async function () {
  // 라이브러리 로드 대기
  try {
    await initializeGSAP();
    console.log('All libraries loaded successfully');
  } catch (error) {
    console.error('Failed to load libraries:', error);
    return; // 라이브러리 로드 실패시 실행 중단
  }

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

  // 4-6. AOS 초기화 (안전하게)
  // AOS 라이브러리가 로드되었는지 확인 후 초기화
  if (typeof AOS !== 'undefined') {
    AOS.init(AOS_CONFIG);
    console.log('AOS initialized successfully');
  } else {
    console.error('AOS library not loaded');
  }

  // 4-7. GSAP 애니메이션 초기화 (Non-blocking)
  // requestAnimationFrame으로 메인 스레드 차단 방지
  requestAnimationFrame(() => {
    if (typeof gsap !== 'undefined') {
      initAnimations();
      console.log('GSAP animations initialized');
    } else {
      console.error('GSAP library not loaded');
    }
  });

  // 4-8. 통합 resize 이벤트 (throttle 적용)
  // 모든 resize 관련 로직을 한 곳에서 처리
  const handleResize = throttle(() => {
    // 라이브러리가 로드되었는지 확인 후 새로고침
    if (typeof AOS !== 'undefined') {
      AOS.refresh(); // AOS 새로고침
    }
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh(); // ScrollTrigger 새로고침
    }
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
      hamIcon.src = './images/close_btn.png';
      hamIcon.alt = '메뉴 닫기';
      hamBtn.setAttribute('aria-label', '메뉴 닫기');

      // 메인 페이지에서는 헤더 배경 변경 (GSAP 안전 체크)
      if (document.querySelector('.main') && typeof gsap !== 'undefined') {
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
    hamIcon.src = './images/ham_btn.png';
    hamIcon.alt = '메뉴 버튼';
    hamBtn.setAttribute('aria-label', '메뉴 열기');
    isMenuOpen = false;

    // 메인 페이지 + 스크롤 최상단일 때 투명 헤더로 복원 (GSAP 안전 체크)
    if (
      document.querySelector('.main') &&
      window.scrollY < 20 &&
      typeof gsap !== 'undefined'
    ) {
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
  if (document.querySelector('.main') && typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create({
      start: '20px top',
      onEnter: () => {
        // 스크롤 다운 시 흰색 배경 (GSAP 안전 체크)
        if (typeof gsap !== 'undefined') {
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
        }
      },
      onLeave: () => {
        // 스크롤 업 시 헤더 숨기기 (GSAP 안전 체크)
        if (typeof gsap !== 'undefined') {
          gsap.to('.header', {
            y: -80,
            duration: 0.1,
            ease: 'power1.out',
          });
        }
      },
      onEnterBack: () => {
        // 역방향 스크롤 시 헤더 보이기 (GSAP 안전 체크)
        if (typeof gsap !== 'undefined') {
          gsap.to('.header', {
            y: 0,
            backgroundColor: 'var(--bs-white)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            duration: 0.1,
            ease: 'power1.out',
          });
        }
      },
      onLeaveBack: () => {
        // 최상단 복원 시 투명 헤더 (GSAP 안전 체크)
        if (typeof gsap !== 'undefined') {
          gsap.to('.header', {
            y: 0,
            backgroundColor: 'transparent',
            boxShadow: 'none',
            duration: 0.1,
            ease: 'power1.out',
          });

          gsap.to('.header li a:not(.on)', {
            color: 'var(--bs-white)',
            duration: 0.1,
          });
        }
      },
    });
  }
}

// ==================== 6. 모달 관리 ====================
// 전역 함수로 모달 열기 (HTML에서 onclick으로 호출)
function openConsultationModal() {
  const modal = document.getElementById('consultationModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // 스크롤 방지
  }
}

// 전역 함수로 모달 닫기
function closeConsultationModal() {
  const modal = document.getElementById('consultationModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // 스크롤 복원

    // 폼 초기화
    const form = modal.querySelector('form');
    if (form) {
      form.reset();
    }

    // 개별 필드 초기화
    const consultType = document.getElementById('consultType');
    const inputName = document.getElementById('inputName');
    const inputPhone = document.getElementById('inputPhone');
    const checkboxes = modal.querySelectorAll('input[type="checkbox"]');

    if (consultType) consultType.value = '';
    if (inputName) inputName.value = '';
    if (inputPhone) inputPhone.value = '';
    checkboxes.forEach((checkbox) => (checkbox.checked = false));
  }
}

function initModal() {
  const modal = document.getElementById('consultationModal');
  const closeBtn = document.getElementById('closeBtn');
  const modalBg = modal?.querySelector('.modal_bg');
  const submitBtn = document.getElementById('submitBtn');

  // 체크박스 요소들
  const agreeAllCheckbox = document.getElementById('agree_all_consult');
  const agreeTwoCheckbox = document.getElementById('agree_two_consult');
  const agreeThirdCheckbox = document.getElementById('agree_third_consult');

  // 전체 동의 체크박스 기능
  if (agreeAllCheckbox && agreeTwoCheckbox && agreeThirdCheckbox) {
    agreeAllCheckbox.addEventListener('change', function () {
      const isChecked = this.checked;
      agreeTwoCheckbox.checked = isChecked;
      agreeThirdCheckbox.checked = isChecked;
    });

    // 개별 체크박스 변경 시 전체 동의 상태 업데이트
    [agreeTwoCheckbox, agreeThirdCheckbox].forEach((checkbox) => {
      checkbox.addEventListener('change', function () {
        agreeAllCheckbox.checked =
          agreeTwoCheckbox.checked && agreeThirdCheckbox.checked;
      });
    });
  }

  // 닫기 버튼 클릭
  if (closeBtn) {
    closeBtn.addEventListener('click', closeConsultationModal);
  }

  // 배경 클릭 시 모달 닫기
  if (modalBg) {
    modalBg.addEventListener('click', closeConsultationModal);
  }

  // 제출 버튼 클릭
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

  // ESC 키로 모달 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('active')) {
      closeConsultationModal();
    }
  });
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
  // GSAP 라이브러리 확인
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.error('GSAP or ScrollTrigger not loaded');
    return;
  }

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
        const currentAngle =
          baseAngle - (rotationProgress * Math.PI) / (totalTexts - 1);

        // 3D 좌표 계산
        const y = Math.sin(currentAngle) * radius;
        const z = Math.cos(currentAngle) * radius;
        const rotateX = -((currentAngle * 180) / Math.PI);

        // 정규화된 각도로 포커스 여부 판단
        const normalizedAngle =
          ((currentAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const isFocus =
          normalizedAngle < 0.3 || normalizedAngle > Math.PI * 2 - 0.3;

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
  // GSAP 라이브러리 확인
  if (typeof gsap === 'undefined') {
    console.error('GSAP not loaded for FC animations');
    return;
  }

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
  console.log('Branch animations initialized');
}

// ==================== 11. 센터장 모집 페이지 애니메이션 ====================
function initCenterAnimations() {
  // GSAP 라이브러리 확인
  if (typeof gsap === 'undefined') {
    console.error('GSAP not loaded for Center animations');
    return;
  }

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

// ==================== 13. 오류 처리 ====================
// 스크립트 로딩 실패 시 폴백
window.addEventListener('error', (event) => {
  if (event.target.tagName === 'SCRIPT') {
    console.error('Script loading failed:', event.target.src);
    // 필요하다면 폴백 로직 추가
  }
});

// 전역 오류 핸들러
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
