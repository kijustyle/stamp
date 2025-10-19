// URL 파라미터 섹션 해제 관리 - js/url-unlock.js 새 파일로 생성

const URLSectionUnlock = {
    // 섹션 ID와 URL 해시 매핑
    sectionHashMap: {
        'start': 'start',
        'peace-gate': 'peace-gate',
        'hidden-land': 'hidden-land', 
        'wind-hill': 'wind-hill',
        'flowers': 'flowers',
        'peace-bridge': 'peace-bridge',
        'millennium': 'millennium',
        'forgotten-village': 'forgotten-village',
        'iron-horse': 'iron-horse',
        'peace-promise': 'peace-promise',
        'nature-secret': 'nature-secret',
        'peace-path': 'peace-path',
        'complete': 'complete'
    },

    // URL에서 파라미터 추출
    getURLParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const hash = window.location.hash.replace('#', '');
        
        return {
            section: urlParams.get('section') || hash || null,
            unlock: urlParams.get('unlock'),
            preview: urlParams.get('preview'),
            golden: urlParams.get('golden')
        };
    },

    // URL 파라미터에 따른 섹션 처리
    processURLParameters() {
        const params = this.getURLParameters();
        
        console.log('URL 파라미터:', params);

        // 특정 섹션이 지정된 경우
        if (params.section && this.sectionHashMap[params.section]) {
            const sectionId = params.section;
            
            // 해당 섹션으로 스크롤
            this.scrollToSection(sectionId);
            
            // 해제 타입에 따른 처리
            if (params.golden === 'true') {
                // 황금 해제
                SectionController.goldenUnlock(sectionId);
                this.removeOverlay(sectionId); // 추가
                this.showUnlockNotification(sectionId, 'golden');
            } else if (params.preview === 'true') {
                // 미리보기 모드
                SectionController.previewSection(sectionId);
                // preview는 오버레이 유지
            } else if (params.unlock !== 'false') {
                // 기본 해제 (unlock=false가 아닌 경우)
                SectionController.unlockSection(sectionId, true);
                this.removeOverlay(sectionId); // 추가
                this.showUnlockNotification(sectionId, 'unlock');
            }
        }

        // 다중 섹션 해제 (unlock 파라미터로 콤마 구분)
        if (params.unlock && params.unlock !== 'false' && params.unlock !== 'true') {
            const sectionsToUnlock = params.unlock.split(',');
            sectionsToUnlock.forEach(sectionId => {
                if (this.sectionHashMap[sectionId.trim()]) {
                    SectionController.unlockSection(sectionId.trim(), false);
                    this.removeOverlay(sectionId.trim()); // 추가
                }
            });
            this.showMultiUnlockNotification(sectionsToUnlock.length);
        }

        // 전체 해제
        if (params.unlock === 'all') {
            SectionController.unlockAllSections();
            this.removeAllOverlays(); // 추가
            this.showUnlockNotification('all', 'unlock');
        }
    },

    // 오버레이 제거 함수 추가
    removeOverlay(sectionId) {
        setTimeout(() => {
            const section = document.getElementById(sectionId);
            if (section) {
                const overlay = section.querySelector('.lock-overlay');
                if (overlay) {
                    overlay.style.display = 'none';
                    overlay.remove(); // 완전히 DOM에서 제거
                }
            }
        }, 100);
    },

    // 모든 오버레이 제거
    removeAllOverlays() {
        setTimeout(() => {
            const allOverlays = document.querySelectorAll('.lock-overlay');
            allOverlays.forEach(overlay => {
                overlay.style.display = 'none';
                overlay.remove();
            });
        }, 100);
    },

    // 섹션으로 부드럽게 스크롤
    scrollToSection(sectionId) {
        // 약간의 지연 후 스크롤 (페이지 로딩 완료 대기)
        setTimeout(() => {
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // 해시 업데이트 (히스토리에 추가하지 않고)
                history.replaceState(null, null, `#${sectionId}`);
            }
        }, 500);
    },

    // 해제 알림 표시
    showUnlockNotification(sectionId, type) {
        const messages = {
            'unlock': '🔓 섹션이 해제되었습니다!',
            'preview': '👀 미리보기 모드가 활성화되었습니다!',
            'golden': '✨ 특별한 황금 해제가 적용되었습니다!',
            'all': '🎉 모든 섹션이 해제되었습니다!'
        };

        this.createNotification(messages[type] || '섹션이 업데이트되었습니다!', type);
    },

    // 다중 해제 알림
    showMultiUnlockNotification(count) {
        this.createNotification(`🔓 ${count}개 섹션이 해제되었습니다!`, 'unlock');
    },

    // 알림 생성
    createNotification(message, type) {
        // 기존 알림 제거
        const existingNotification = document.querySelector('.url-unlock-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `url-unlock-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        document.body.appendChild(notification);

        // 3초 후 자동 제거
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.add('fade-out');
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    },

    // URL 생성 헬퍼 함수들
    generateSectionURL(sectionId, options = {}) {
        const baseURL = 'https://stamp.softshell.co.kr/';
        const params = new URLSearchParams();

        if (options.unlock !== false) params.set('unlock', 'true');
        if (options.preview) params.set('preview', 'true');
        if (options.golden) params.set('golden', 'true');

        const queryString = params.toString();
        const hash = `#${sectionId}`;
        
        return `${baseURL}${queryString ? '?' + queryString : ''}${hash}`;
    },

    // 공유용 URL 생성
    generateShareURLs() {
        const urls = {};
        
        Object.keys(this.sectionHashMap).forEach(sectionId => {
            urls[sectionId] = {
                unlock: this.generateSectionURL(sectionId, { unlock: true }),
                preview: this.generateSectionURL(sectionId, { preview: true }),
                golden: this.generateSectionURL(sectionId, { golden: true })
            };
        });

        return urls;
    }
};

// URL 해시 변경 감지
window.addEventListener('hashchange', function() {
    const hash = window.location.hash.replace('#', '');
    if (hash && URLSectionUnlock.sectionHashMap[hash]) {
        URLSectionUnlock.scrollToSection(hash);
    }
});

// 페이지 로드 시 URL 파라미터 처리
document.addEventListener('DOMContentLoaded', function() {
    // SectionController가 로드될 때까지 대기
    setTimeout(() => {
        URLSectionUnlock.processURLParameters();
    }, 100);
});

// 개발자용 URL 생성 도구
window.URLGenerator = {
    // 특정 섹션 해제 URL
    unlock: (sectionId) => URLSectionUnlock.generateSectionURL(sectionId, { unlock: true }),
    
    // 미리보기 URL
    preview: (sectionId) => URLSectionUnlock.generateSectionURL(sectionId, { preview: true }),
    
    // 황금 해제 URL
    golden: (sectionId) => URLSectionUnlock.generateSectionURL(sectionId, { golden: true }),
    
    // 모든 섹션 URL 생성
    all: () => URLSectionUnlock.generateShareURLs(),
    
    // 콘솔에 모든 URL 출력
    show: () => {
        console.log('🔗 섹션별 URL 목록:');
        const urls = URLSectionUnlock.generateShareURLs();
        Object.keys(urls).forEach(sectionId => {
            console.log(`\n📍 ${sectionId}:`);
            console.log(`  해제: ${urls[sectionId].unlock}`);
            console.log(`  미리보기: ${urls[sectionId].preview}`);
            console.log(`  황금: ${urls[sectionId].golden}`);
        });
    }
};

// 브라우저 뒤로가기/앞으로가기 처리
window.addEventListener('popstate', function(event) {
    setTimeout(() => {
        URLSectionUnlock.processURLParameters();
    }, 100);
});