// 섹션 블러 제어 JavaScript - js/section-control.js 새 파일로 생성

// 섹션 제어 관리자
const SectionController = {
    // 블러 처리할 섹션 ID (start, complete 제외)
    sectionIds: [
        'peace-gate', 'hidden-land', 'wind-hill', 'flowers', 
        'peace-bridge', 'millennium', 'forgotten-village', 
        'iron-horse', 'peace-promise', 'nature-secret', 
        'peace-path'
    ],
    
    // 특정 섹션 잠금 해제
    unlockSection(sectionId, withAnimation = true) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        if (withAnimation) {
            section.classList.add('unlocking');
            
            setTimeout(() => {
                section.classList.remove('unlocking');
                section.classList.add('unlocked');
                this.removeOverlay(sectionId);
                this.saveState(); // 여기서 저장
            }, 1200);
        } else {
            section.classList.add('unlocked');
            this.removeOverlay(sectionId);
            this.saveState(); // 여기서 저장
        }
        
        console.log(`섹션 해제: ${sectionId}`);
    },

    // 오버레이 제거 함수 추가
    removeOverlay(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const overlay = section.querySelector('.lock-overlay');
            if (overlay) {
                overlay.style.display = 'none';
                overlay.remove();
            }
        }
    },
    
    // 특정 섹션 잠금
    lockSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        section.classList.remove('unlocked', 'preview', 'golden-unlock', 'unlocking');
        console.log(`섹션 잠금: ${sectionId}`);
    },
    
    // 특정 섹션 미리보기 모드
    previewSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        section.classList.remove('unlocked', 'golden-unlock');
        section.classList.add('preview');
        console.log(`섹션 미리보기: ${sectionId}`);
    },
    
    // 특별한 황금 해제 효과
    goldenUnlock(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        section.classList.add('golden-unlock');
        
        setTimeout(() => {
            this.unlockSection(sectionId, true);
        }, 2000);
        
        console.log(`섹션 황금 해제: ${sectionId}`);
    },
    
    // 모든 섹션 잠금 해제
    unlockAllSections() {
        this.sectionIds.forEach(id => {
            this.unlockSection(id, false);
        });
        console.log('모든 섹션 해제됨');
    },
    
    // 모든 섹션 잠금
    lockAllSections() {
        this.sectionIds.forEach(id => {
            this.lockSection(id);
        });
        console.log('모든 섹션 잠금됨');
    },
    
    // 순차적 섹션 해제 (스토리 진행용)
    unlockSequentially(sectionIds, delay = 1000) {
        sectionIds.forEach((id, index) => {
            setTimeout(() => {
                this.unlockSection(id, true);
            }, index * delay);
        });
    },
    
    // 섹션 상태 확인
    isSectionUnlocked(sectionId) {
        const section = document.getElementById(sectionId);
        return section ? section.classList.contains('unlocked') : false;
    },
    
    // 해제된 섹션 수 카운트
    getUnlockedCount() {
        return this.sectionIds.filter(id => this.isSectionUnlocked(id)).length;
    },
    
    // 섹션 상태 저장 (로컬스토리지)
    saveState() {
        // 기존 저장된 상태 불러오기
        let state = {};
        const savedState = localStorage.getItem('dmz-section-states');
        if (savedState) {
            try {
                state = JSON.parse(savedState);
            } catch (error) {
                console.error('기존 상태 로드 실패:', error);
                state = {};
            }
        }
        
        // 현재 상태 업데이트 (기존 상태 유지하면서 추가)
        this.sectionIds.forEach(id => {
            const section = document.getElementById(id);
            if (section) {
                // 이미 저장된 unlocked 상태가 있으면 유지
                const wasUnlocked = state[id]?.unlocked || false;
                const isCurrentlyUnlocked = section.classList.contains('unlocked');
                
                state[id] = {
                    unlocked: wasUnlocked || isCurrentlyUnlocked, // OR 연산으로 누적
                    preview: section.classList.contains('preview'),
                    golden: section.classList.contains('golden-unlock')
                };
            }
        });
        
        localStorage.setItem('dmz-section-states', JSON.stringify(state));
        console.log('섹션 상태 저장됨 (누적):', state);
    },
    
    // 섹션 상태 로드 (로컬스토리지)
    loadState() {
        const savedState = localStorage.getItem('dmz-section-states');
        if (!savedState) return;
        
        try {
            const state = JSON.parse(savedState);
            
            this.sectionIds.forEach(id => {
                const section = document.getElementById(id);
                const sectionState = state[id];
                
                if (section && sectionState) {
                    if (sectionState.unlocked) {
                        section.classList.add('unlocked');
                        this.removeOverlay(id); // 오버레이도 제거
                    }
                    if (sectionState.preview) {
                        section.classList.add('preview');
                    }
                    if (sectionState.golden) {
                        section.classList.add('golden-unlock');
                    }
                }
            });
            
            console.log('섹션 상태 로드됨:', state);
        } catch (error) {
            console.error('섹션 상태 로드 실패:', error);
        }
    },
    
    // 상태 초기화
    resetState() {
        this.lockAllSections();
        localStorage.removeItem('dmz-section-states');
        console.log('섹션 상태 초기화됨');
    }
};

// 특별한 제어 함수들 (개발자 도구나 특수 조건에서 사용)
window.DevControls = {
    // 치트 코드: 모든 섹션 해제
    unlockAll: () => SectionController.unlockAllSections(),
    
    // 특정 섹션 해제
    unlock: (id) => SectionController.unlockSection(id),
    
    // 특정 섹션 잠금
    lock: (id) => SectionController.lockSection(id),
    
    // 미리보기 모드
    preview: (id) => SectionController.previewSection(id),
    
    // 황금 해제
    golden: (id) => SectionController.goldenUnlock(id),
    
    // 상태 저장
    save: () => SectionController.saveState(),
    
    // 상태 로드
    load: () => SectionController.loadState(),
    
    // 초기화
    reset: () => SectionController.resetState(),
    
    // 상태 확인
    status: () => {
        console.log('섹션 상태:');
        SectionController.sectionIds.forEach(id => {
            const unlocked = SectionController.isSectionUnlocked(id);
            console.log(`${id}: ${unlocked ? '🔓 해제됨' : '🔒 잠김'}`);
        });
        console.log(`총 해제된 섹션: ${SectionController.getUnlockedCount()}/${SectionController.sectionIds.length}`);
    }
};

// DOM 로드 완료 후 상태 로드
document.addEventListener('DOMContentLoaded', function() {
    // Complete 섹션 블러 강제 제거 (안전장치)
    const completeSection = document.getElementById('complete');
    if (completeSection) {
        completeSection.classList.remove('unlocked', 'preview', 'golden-unlock', 'unlocking');
        completeSection.style.filter = 'none';
        completeSection.style.webkitFilter = 'none';
        console.log('Complete 섹션 블러 제거 완료');
    }
    
    // 저장된 상태가 있으면 로드
    SectionController.loadState();
    
    // 개발 모드에서만 콘솔에 제어 방법 출력
    if (localStorage.getItem('dev-mode') === 'true') {
        console.log('🎮 개발자 제어 명령어:');
        console.log('DevControls.unlockAll() - 모든 섹션 해제');
        console.log('DevControls.unlock("section-id") - 특정 섹션 해제');
        console.log('DevControls.status() - 현재 상태 확인');
    }
});

// 페이지 떠날 때 상태 저장
window.addEventListener('beforeunload', function() {
    SectionController.saveState();
});