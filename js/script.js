// 1. DOMContentLoaded 안에서 실행되는 코드들
document.addEventListener('DOMContentLoaded', () => {
    // 1-1. 셀렉트 박스 active 클래스 토글
    document.querySelectorAll('.select_css').forEach((select) => {
        select.addEventListener('change', () => {
            if (select.value) {
                select.classList.add('active');
            } else {
                select.classList.remove('active');
            }
        });
    });

    // 1-2. 전체 동의 체크박스 제어
    const agreeAll = document.getElementById('agree_all');
    const checkboxes = document.querySelectorAll(".checkbox_wrap input[type='checkbox']:not(#agree_all)");

    agreeAll?.addEventListener('change', () => {
        checkboxes.forEach((checkbox) => {
            checkbox.checked = agreeAll.checked;
        });
    });

    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', () => {
            const allChecked = Array.from(checkboxes).every((chk) => chk.checked);
            agreeAll.checked = allChecked;
        });
    });

    // 1-3. 휴대폰 번호 숫자만 입력
    document.getElementById('phone_number')?.addEventListener('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
});

// 2. window.onload (input 높이 맞춤)
window.addEventListener('load', () => {
    const inputList = document.querySelector('.input_list');
    const clickBtn = document.querySelector('.click_btn');

    if (inputList && clickBtn) {
        const listHeight = inputList.offsetHeight;
        clickBtn.style.height = listHeight + 'px';
    }
});

// 3. 햄버거 메뉴 토글
const hamBtn = document.querySelector('.ham_btn');
const hamGnb = document.querySelector('.ham_gnb');
const hamIcon = document.querySelector('.ham_icon');

function toggleMenu() {
    const isOpen = hamGnb.classList.contains('active');

    hamGnb.classList.toggle('active');

    if (!isOpen) {
        hamIcon.src = '/images/close_btn.png';
        hamIcon.alt = '닫기 버튼';
        hamBtn.setAttribute('aria-label', '메뉴 닫기');
    } else {
        hamIcon.src = '/images/ham_btn.png';
        hamIcon.alt = '메뉴 버튼';
        hamBtn.setAttribute('aria-label', '메뉴 열기');
    }
}

hamBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
});

document.addEventListener('click', (e) => {
    const isMenuOpen = hamGnb.classList.contains('active');
    const clickedOutside = !hamBtn.contains(e.target) && !hamGnb.contains(e.target);

    if (isMenuOpen && clickedOutside) {
        toggleMenu();
    }
});
