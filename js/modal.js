function showArModal() {
    const modal = document.getElementById('arModal');
    modal.classList.add('active');
    
    // 입력 필드 초기화
    document.getElementById('visitNote').value = '';
}

// 모달 닫기 함수
function closeModal() {
    const modal = document.getElementById('arModal');
    modal.classList.remove('active');
}

// 방문 확인 함수
function confirmVisit() {
    const visitNote = document.getElementById('visitNote').value.trim();
    
    if (visitNote === '') {
        alert('소감을 입력해주세요.');
        return;
    }
    
    // 기존 dmz-tour-progress 가져오기
    const existingProgress = JSON.parse(localStorage.getItem('dmz-tour-progress') || '{}');
    
    // peace-bridge 섹션 완료 상태 업데이트 + 메시지 저장
    existingProgress['peace-promise'] = {
        completed: true,
        timestamp: Date.now(),
        note: visitNote,  // 사용자 메시지 저장
        dateString: new Date().toLocaleString('ko-KR')
    };
    
    // localStorage에 저장
    localStorage.setItem('dmz-tour-progress', JSON.stringify(existingProgress));
    
    // 모달 닫기
    closeModal();
    
    // 부모 창에 완료 메시지 전송 (메시지 포함)
    if (window.opener) {
        window.opener.postMessage({
            type: 'AR_COMPLETE',
            sectionId: 'peace-promise',
            note: visitNote,  // 메시지도 함께 전송
            timestamp: Date.now()
        }, '*');
    }
    
    // 성공 메시지 후 이동
    setTimeout(() => {
        alert('방문 기록이 저장되었습니다. 다음 단계로 이동합니다.');
        window.location.href = 'bridge.html';
    }, 500);
}

// 모달 외부 클릭 시 닫기
document.getElementById('arModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

