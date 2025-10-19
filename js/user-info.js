// js/user-info.js - 새 파일로 생성

// Google Sheets 데이터 관리
const SheetsManager = {
    // Google Apps Script 웹앱 URL (2단계에서 받은 URL로 교체)
    SCRIPT_URL: 'https://script.google.com/macros/s/AKfycby50yfTUR_tCcJc_zRGWu7NPkTYQLLjy-DiqZZ-jRqMD6Vw1a0D1h2bPwzw5LMBvsADvw/exec',
    
    // JSONP 요청 헬퍼 함수
    jsonpRequest(url, params) {
        return new Promise((resolve, reject) => {
            const callbackName = `jsonp_callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // 콜백 함수 생성
            window[callbackName] = (data) => {
                resolve(data);
                // 정리
                document.head.removeChild(script);
                delete window[callbackName];
            };
            
            // 파라미터에 콜백 추가
            params.callback = callbackName;
            const queryString = new URLSearchParams(params).toString();
            const fullUrl = `${url}?${queryString}`;
            
            // 스크립트 태그 생성
            const script = document.createElement('script');
            script.src = fullUrl;
            script.onerror = () => {
                reject(new Error('JSONP request failed'));
                document.head.removeChild(script);
                delete window[callbackName];
            };
            
            // 타임아웃 설정
            setTimeout(() => {
                if (window[callbackName]) {
                    reject(new Error('JSONP request timeout'));
                    document.head.removeChild(script);
                    delete window[callbackName];
                }
            }, 10000);
            
            document.head.appendChild(script);
        });
    },
    
    // 사용자 등록 (JSONP 방식)
    async registerUser(userInfo) {
        try {
            const params = {
                action: 'register',
                name: userInfo.name,
                contact: userInfo.contact,
                region: userInfo.region,
                registeredAt: userInfo.registeredAt,
                status: 'started'
            };
            
            const result = await this.jsonpRequest(this.SCRIPT_URL, params);
            
            if (result.success) {
                console.log('사용자 등록 성공:', result.rowId);
                localStorage.setItem('dmz-user-row-id', result.rowId);
                return result;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('사용자 등록 실패:', error);
            return { success: false, error: error.message };
        }
    },
    
    // 진행상황 업데이트 (JSONP 방식)
    async updateUserProgress(progressData) {
        const rowId = localStorage.getItem('dmz-user-row-id');
        if (!rowId) return { success: false, error: 'No user row ID' };
        
        try {
            const params = {
                action: 'update',
                rowId: rowId,
                section: progressData.section,
                completedAt: progressData.completedAt
            };
            
            const result = await this.jsonpRequest(this.SCRIPT_URL, params);
            return result;
        } catch (error) {
            console.error('진행상황 업데이트 실패:', error);
            return { success: false, error: error.message };
        }
    },
    
    // 최종 완료 정보 업데이트 (JSONP 방식)
    async updateCompletion(completionData) {
        const rowId = localStorage.getItem('dmz-user-row-id');
        if (!rowId) return { success: false, error: 'No user row ID' };
        
        try {
            const params = {
                action: 'complete',
                rowId: rowId,
                completedAt: formatDateTime(),
                completionRate: completionData.completionRate,
                finalScore: completionData.finalScore
            };
            
            const result = await this.jsonpRequest(this.SCRIPT_URL, params);
            return result;
        } catch (error) {
            console.error('완료 정보 업데이트 실패:', error);
            return { success: false, error: error.message };
        }
    }
};

// 사용자 정보 관리 모듈
const UserInfoManager = {
    // 로컬스토리지 키
    STORAGE_KEY: 'dmz-user-info',
    
    // 사용자 정보 확인
    hasUserInfo() {
        const userInfo = localStorage.getItem(this.STORAGE_KEY);
        return userInfo !== null && userInfo !== '';
    },
    
    // 사용자 정보 저장
    saveUserInfo(userInfo) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userInfo));
    },
    
    // 사용자 정보 불러오기
    getUserInfo() {
        const userInfo = localStorage.getItem(this.STORAGE_KEY);
        return userInfo ? JSON.parse(userInfo) : null;
    },
    
    // 사용자 정보 삭제
    clearUserInfo() {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem('dmz-user-row-id');
    }
};

// 사용자 정보 확인 및 모달 표시
function checkUserInfo() {
    if (!UserInfoManager.hasUserInfo()) {
        showUserInfoModal();
    } else {
        // 사용자 정보가 있으면 이벤트 진행
        console.log('기존 사용자 정보:', UserInfoManager.getUserInfo());
    }
}

// 사용자 정보 입력 모달 표시
function showUserInfoModal() {
    const modal = document.getElementById('userInfoModal');
    if (modal) {
        modal.style.display = 'flex';
        
        // 모달 애니메이션
        setTimeout(() => {
            modal.querySelector('.modal-container').style.animation = 'modalSlideIn 0.3s ease-out';
        }, 10);
    }
}

// 사용자 정보 입력 모달 숨기기
function hideUserInfoModal() {
    const modal = document.getElementById('userInfoModal');
    if (modal) {
        modal.querySelector('.modal-container').style.animation = 'modalSlideOut 0.3s ease-in';
        
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// 입력 유효성 검사
function validateUserInfo() {
    const userName = document.getElementById('userName').value.trim();
    const userContact = document.getElementById('userContact').value.trim();
    const userRegion = document.getElementById('userRegion').value;
    const errorElement = document.getElementById('userInfoError');
    
    // 에러 메시지 초기화
    errorElement.style.display = 'none';
    
    if (!userName || !userContact || !userRegion) {
        errorElement.textContent = '모든 항목을 입력해주세요.';
        errorElement.style.display = 'block';
        return false;
    }
    
    if (userName.length < 2) {
        errorElement.textContent = '이름은 2글자 이상 입력해주세요.';
        errorElement.style.display = 'block';
        return false;
    }
    
    return true;
}

// 사용자 정보 저장 및 이벤트 시작 (수정된 버전)
async function saveUserInfoAndStart() {
    if (!validateUserInfo()) {
        return;
    }
    
    const userInfo = {
        name: document.getElementById('userName').value.trim(),
        contact: document.getElementById('userContact').value.trim(),
        region: document.getElementById('userRegion').value,
        registeredAt: formatDateTime(),
        eventStarted: true
    };
    
    // 로컬스토리지에 저장
    UserInfoManager.saveUserInfo(userInfo);
    
    // Google Sheets에 등록 시도
    showLoadingMessage();
    
    const result = await SheetsManager.registerUser(userInfo);
    
    if (result.success) {
        showSuccessMessage('온라인 등록이 완료되었습니다!');
        console.log('온라인 등록 성공 - Row ID:', result.rowId);
    } else {
        showSuccessMessage('로컬 등록이 완료되었습니다.');
        console.warn('온라인 등록 실패:', result.error);
    }
    
    setTimeout(() => {
        hideUserInfoModal();
    }, 1500);
}

// 로딩 메시지 표시
function showLoadingMessage() {
    const modalBody = document.querySelector('#userInfoModal .modal-body');
    modalBody.innerHTML = `
        <div class="discovery-message">
            <div style="font-size: 48px; margin-bottom: 15px;">⏳</div>
            <p class="discovery-text">등록 중...</p>
            <p class="discovery-subtext">
                잠시만 기다려주세요
            </p>
        </div>
    `;
    document.getElementById('startEventBtn').style.display = 'none';
}

// 성공 메시지 표시
function showSuccessMessage() {
    const modalBody = document.querySelector('#userInfoModal .modal-body');
    const originalContent = modalBody.innerHTML;
    
    modalBody.innerHTML = `
        <div class="discovery-message">
            <div style="font-size: 48px; margin-bottom: 15px;">🎉</div>
            <p class="discovery-text">환영합니다!</p>
            <p class="discovery-subtext">
                DMZ 평화 여정이 시작됩니다<br>
                잠시 후 첫 번째 미션으로 이동합니다
            </p>
        </div>
    `;
    
    // 시작 버튼 숨기기
    document.getElementById('startEventBtn').style.display = 'none';
    
    // 원본 내용 복구 (나중에 재사용을 위해)
    setTimeout(() => {
        modalBody.innerHTML = originalContent;
        document.getElementById('startEventBtn').style.display = 'block';
    }, 2000);
}

// 사용자 정보 초기화 함수 (개발용)
function resetUserInfo() {
    if (confirm('사용자 정보를 초기화하시겠습니까?\n다시 정보 입력 화면이 나타납니다.')) {
        UserInfoManager.clearUserInfo();
        location.reload();
    }
}

// 진행상황 업데이트 함수 (퀴즈 완료, AR 체험 등에서 호출)
function updateProgress(sectionId, data = {}) {
    const progressData = {
        section: sectionId,
        completedAt: sectionId === 'peace-promise' ? data.note : formatDateTime(),
        type: data.type || 'section',
        score: data.score || null,
        ...data
    };
    
    // 로컬 진행상황도 저장
    const localProgress = JSON.parse(localStorage.getItem('dmz-progress') || '{}');
    localProgress[sectionId] = progressData;
    localStorage.setItem('dmz-progress', JSON.stringify(localProgress));
    
    // 비동기로 온라인 업데이트 (사용자 경험에 영향 없이)
    SheetsManager.updateUserProgress(progressData).then(result => {
        if (result.success) {
            console.log(`진행상황 업데이트 성공: ${sectionId}`);
        } else {
            console.warn(`진행상황 업데이트 실패: ${sectionId}`, result.error);
        }
    }).catch(console.error);
}

function formatDateTime(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 최종 완주 시 호출할 함수
function completeEvent(completionStats) {
    const completionData = {
        totalSections: completionStats.total || 11,
        completedSections: completionStats.completed || 0,
        completionRate: completionStats.completed ? 
            Math.round((completionStats.completed / (completionStats.total || 11)) * 100) : 0,
        finalScore: completionStats.score || 0
    };
    
    // 로컬에도 완료 정보 저장
    localStorage.setItem('dmz-completion', JSON.stringify(completionData));
    
    SheetsManager.updateCompletion(completionData).then(result => {
        if (result.success) {
            console.log('최종 완료 정보 업데이트 성공', completionData);
        } else {
            console.warn('최종 완료 정보 업데이트 실패', result.error);
        }
    }).catch(console.error);
}

// 개발자용 함수들
window.DataManager = {
    // 현재 사용자 정보 확인
    getUserInfo: () => UserInfoManager.getUserInfo(),
    
    // 진행상황 확인
    getProgress: () => JSON.parse(localStorage.getItem('dmz-progress') || '{}'),
    
    // 완료 정보 확인
    getCompletion: () => JSON.parse(localStorage.getItem('dmz-completion') || '{}'),
    
    // 수동 진행상황 업데이트
    updateProgress: (sectionId, data) => updateProgress(sectionId, data),
    
    // 수동 완료 처리
    completeEvent: (stats) => completeEvent(stats),
    
    // 온라인 상태 확인
    checkOnlineStatus: async () => {
        const rowId = localStorage.getItem('dmz-user-row-id');
        return { 
            hasRowId: !!rowId, 
            rowId: rowId,
            scriptUrl: SheetsManager.SCRIPT_URL 
        };
    }
};

// 모달 애니메이션 CSS 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: scale(0.7) translateY(-50px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }
    
    @keyframes modalSlideOut {
        from {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
        to {
            opacity: 0;
            transform: scale(0.7) translateY(-50px);
        }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', function() {
    checkUserInfo();
    
    // ✨ 새로 추가: 기존 완료된 섹션들의 블러 해제
    loadCompletedSectionsAndUnlock();
});

// 기존 완료된 섹션들 로드 및 블러 해제
function loadCompletedSectionsAndUnlock() {
    // SectionController 로드 대기
    setTimeout(() => {
        if (typeof SectionController !== 'undefined') {
            // 로컬 진행상황 확인
            const localProgress = JSON.parse(localStorage.getItem('dmz-progress') || '{}');
            
            // 완료된 섹션들의 블러 해제
            Object.keys(localProgress).forEach(sectionId => {
                if (localProgress[sectionId].completedAt) {
                    SectionController.unlockSection(sectionId, false); // 애니메이션 없이
                    console.log(`페이지 로드 시 섹션 ${sectionId} 블러 해제`);
                }
            });
        }
    }, 200);
}