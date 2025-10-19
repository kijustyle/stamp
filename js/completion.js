// 미션 정보 정의
const MISSION_INFO = {
  'peace-gate': { name: '평화의 문', image: 'peace-gate' },
  'hidden-land': { name: '숨겨진 땅', image: 'hidden-land' },
  'wind-hill': { name: '바람의 언덕', image: 'wind-hill' },
  'flowers': { name: '철책의 꽃', image: 'flowers' },
  'peace-bridge': { name: '평화의 다리', image: 'peace-bridge' },
  'millennium': { name: '천연기념물', image: 'millennium' },
  'forgotten-village': { name: '잊혀진 마을', image: 'forgotten-village' },
  'iron-horse': { name: '철마의 꿈', image: 'iron-horse' },
  'peace-promise': { name: '평화의 약속', image: 'peace-promise' },
  'nature-secret': { name: '자연의 비밀', image: 'nature-secret' },
  'peace-path': { name: '평화의 길', image: 'peace-path' }
};

const MISSION_SECTIONS = Object.keys(MISSION_INFO);

// 자동 업데이트 인터벌 ID
let autoUpdateInterval = null;

// 화면 전환 함수들
function showMainCompletion() {
  document.getElementById('main-completion').style.display = 'block';
  document.getElementById('success-celebration').style.display = 'none';
  document.getElementById('insufficient-message').style.display = 'none';
}

function showSuccessCelebration() {
  document.getElementById('main-completion').style.display = 'none';
  document.getElementById('success-celebration').style.display = 'block';
  document.getElementById('insufficient-message').style.display = 'none';
}

function showInsufficientMessage() {
  document.getElementById('main-completion').style.display = 'none';
  document.getElementById('success-celebration').style.display = 'none';
  document.getElementById('insufficient-message').style.display = 'block';
}

// 스탬프 클릭 핸들러
function handleStampClick(missionId, isCompleted) {
  if (!isCompleted) {
    // 미완료 스탬프 클릭 시 해당 섹션으로 이동
    scrollToSection(missionId);
    
    // 시각적 피드백 추가
    const stampItem = event.currentTarget;
    stampItem.style.transform = 'scale(0.95)';
    setTimeout(() => {
      stampItem.style.transform = '';
    }, 150);
  }
}

// 스탬프 컬렉션 업데이트
function updateStampsCollection() {
  const progress = getProgress();
  const container = document.getElementById('stamps-collection');
  container.innerHTML = '';
  
  MISSION_SECTIONS.forEach(missionId => {
    const mission = MISSION_INFO[missionId];
    const isCompleted = progress[missionId] && progress[missionId].completed;
    
    const stampItem = document.createElement('div');
    stampItem.className = `stamp-item ${!isCompleted ? 'clickable' : ''}`;
    
    // 클릭 이벤트 추가 (미완료인 경우에만)
    if (!isCompleted) {
      stampItem.addEventListener('click', (event) => handleStampClick(missionId, isCompleted));
      stampItem.style.cursor = 'pointer';
      
      // 호버 효과를 위한 추가 스타일
      stampItem.addEventListener('mouseenter', () => {
        if (!isCompleted) {
          stampItem.style.transform = 'scale(1.05)';
          stampItem.style.transition = 'transform 0.2s ease';
        }
      });
      
      stampItem.addEventListener('mouseleave', () => {
        if (!isCompleted) {
          stampItem.style.transform = '';
        }
      });
    }
    
    const stampImage = document.createElement('img');
    stampImage.className = `stamp-image ${isCompleted ? 'completed' : ''}`;
    stampImage.src = `img/stamps/${mission.image}${isCompleted ? '_complete' : ''}.png`;
    stampImage.alt = mission.name;
    
    // 툴팁 추가
    stampImage.title = isCompleted ? 
      `✅ ${mission.name} (완료)` : 
      `🔄 ${mission.name} (클릭하여 이동)`;
    
    // 이미지 로드 실패 시 폴백
    stampImage.onerror = function() {
      this.style.display = 'none';
      const fallback = document.createElement('div');
      fallback.style.cssText = `
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 1.2rem;
        color: white;
        background: ${isCompleted ? '#28a745' : '#ccc'};
        opacity: ${isCompleted ? '1' : '0.4'};
        border: 2px solid ${isCompleted ? '#28a745' : '#e9ecef'};
        transition: all 0.3s ease;
      `;
      fallback.textContent = mission.name.charAt(0);
      fallback.title = stampImage.title; // 툴팁 유지
      stampItem.replaceChild(fallback, this);
    };
    
    stampItem.appendChild(stampImage);
    container.appendChild(stampItem);
  });
}

// 완료 수 업데이트
function updateCompletedCount() {
  const progress = getProgress();

  console.log(progress);
  
  const completedCount = MISSION_SECTIONS.filter(sectionId => 
    progress[sectionId] && progress[sectionId].completed
  ).length;
  
  // document.getElementById('completed-missions').textContent = completedCount;
  return completedCount;
}

// 완주 인증 확인
function verifyCompletion() {
  const completedCount = updateCompletedCount();
  
  if (completedCount >= 7) {
    // 성공 - 축하 효과와 함께
    document.getElementById('final-completed').textContent = completedCount;
    showSuccessCelebration();
    createCelebrationEffects();

    completeEvent && completeEvent({
    total: 11,
    completed: completedCount,
    score: Math.round((completedCount / 11) * 100)
  });
  
  } else {
    // 실패 - 부족한 정보 표시
    document.getElementById('current-completed').textContent = completedCount;
    document.getElementById('needed-more').textContent = 7 - completedCount;
    showInsufficientMessage();
  }
}

// 첫 번째 미완료 미션으로 이동
function goToFirstIncomplete() {
  const progress = getProgress();
  
  for (const missionId of MISSION_SECTIONS) {
    if (!progress[missionId] || !progress[missionId].completed) {
      scrollToSection(missionId);
      return;
    }
  }
  
  // 모든 미션이 완료되었다면 첫 번째 미션으로
  scrollToSection('peace-gate');
}

// 축하 효과 생성
function createCelebrationEffects() {
  const container = document.getElementById('celebration-effects');
  
  // 폭죽 효과
  createFireworks(container);
  
  // 색종이 효과
  createConfetti(container);
  
  // 3초 후 효과 제거
  setTimeout(() => {
    container.innerHTML = '';
  }, 3000);
}

function createFireworks(container) {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#feca57', '#ff9ff3', '#f368e0'];
  
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const firework = document.createElement('div');
      firework.className = 'firework-burst';
      firework.style.left = Math.random() * 100 + '%';
      firework.style.top = Math.random() * 100 + '%';
      firework.style.background = colors[Math.floor(Math.random() * colors.length)];
      firework.style.animationDelay = Math.random() * 0.5 + 's';
      container.appendChild(firework);
      
      setTimeout(() => firework.remove(), 2000);
    }, i * 50);
  }
}

function createConfetti(container) {
  const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#feca57', '#ff9ff3'];
  
  for (let i = 0; i < 100; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
      container.appendChild(confetti);
      
      setTimeout(() => confetti.remove(), 4000);
    }, i * 20);
  }
}

// 완주 공유
function shareCompletion() {
  const completedCount = updateCompletedCount();
  const shareText = `🏆 2025 DMZ 오픈레이스 완주! 광복 80주년 기념 평화 스탬프 투어를 완주했습니다! (${completedCount}/11 완료) 🕊️`;
  
  if (navigator.share) {
    navigator.share({
      title: '2025 DMZ 오픈레이스 완주!',
      text: shareText,
      url: window.location.href,
    }).catch(console.error);
  } else {
    navigator.clipboard.writeText(shareText + ' ' + window.location.href).then(() => {
      alert('🎉 완주 인증 메시지가 클립보드에 복사되었습니다!');
    }).catch(() => {
      alert('공유 기능을 사용할 수 없습니다.');
    });
  }
}

// 자동 업데이트 함수
function autoUpdateStamps() {
  console.log('🔄 스탬프 현황 자동 업데이트 중...');
  updateStampsCollection();
  updateCompletedCount();
}

// 자동 업데이트 시작
function startAutoUpdate() {
  if (autoUpdateInterval) {
    clearInterval(autoUpdateInterval);
  }
  
  autoUpdateInterval = setInterval(autoUpdateStamps, 10000); // 10초마다 업데이트
  console.log('✅ 스탬프 자동 업데이트 시작 (10초 간격)');
}

// 자동 업데이트 중지
function stopAutoUpdate() {
  if (autoUpdateInterval) {
    clearInterval(autoUpdateInterval);
    autoUpdateInterval = null;
    console.log('⏹️ 스탬프 자동 업데이트 중지');
  }
}

// 페이지 가시성 변경 시 자동 업데이트 제어
function handleVisibilityChange() {
  if (document.hidden) {
    stopAutoUpdate();
  } else {
    startAutoUpdate();
    // 페이지가 다시 보여질 때 즉시 한 번 업데이트
    autoUpdateStamps();
  }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
  showMainCompletion();
  updateStampsCollection();
  updateCompletedCount();
  
  // 자동 업데이트 시작
  startAutoUpdate();
  
  // 페이지 가시성 변경 감지
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', function() {
  stopAutoUpdate();
});

// 진행상황 변경 시 업데이트 (기존 saveProgress 함수가 있다면 확장)
if (typeof window.saveProgress === 'function') {
  const originalSaveProgress = window.saveProgress;
  window.saveProgress = function(sectionId, completed = true) {
    originalSaveProgress(sectionId, completed);
    updateStampsCollection();
    updateCompletedCount();
  };
} else {
  // saveProgress 함수가 없다면 전역으로 등록
  window.saveProgress = saveProgress;
}