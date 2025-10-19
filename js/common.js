const SECTIONS = [
  'start',
  'peace-gate',
  'hidden-land',
  'wind-hill',
  'flowers',
  'peace-bridge',
  'millennium',
  'forgotten-village',
  'iron-horse',
  'peace-promise',
  'nature-secret',
  'peace-path',
  'complete',
]

// 로컬스토리지에서 진행상황 불러오기
function getProgress() {
  const saved = localStorage.getItem('dmz-tour-progress')
  return saved ? JSON.parse(saved) : {}
}

// 진행상황 저장
function saveProgress(sectionId, completed = true) {
  const progress = getProgress()
  progress[sectionId] = {
    completed: completed,
    timestamp: Date.now(),
  }
  localStorage.setItem('dmz-tour-progress', JSON.stringify(progress))
  updateProgressBadges()
}

// 진행상황 배지 업데이트
function updateProgressBadges() {
  const progress = getProgress()
  SECTIONS.forEach((sectionId) => {
    const section = document.getElementById(sectionId)
    if (section && progress[sectionId]?.completed) {
      let badge = section.querySelector('.completed-badge')
      if (!badge) {
        badge = document.createElement('div')
        badge.className = 'completed-badge'
        badge.textContent = '완료 ✓'
        section.appendChild(badge)
      }
    }
  })
}

// 폭죽 효과
function createFireworks() {
  const fireworksContainer = document.createElement('div')
  fireworksContainer.className = 'fireworks'
  document.body.appendChild(fireworksContainer)

  const colors = [
    '#ff6b6b',
    '#4ecdc4',
    '#45b7d1',
    '#96ceb4',
    '#feca57',
    '#ff9ff3',
    '#f368e0',
  ]

  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const firework = document.createElement('div')
      firework.className = 'firework'
      firework.style.left = Math.random() * 100 + '%'
      firework.style.top = Math.random() * 100 + '%'
      firework.style.background =
        colors[Math.floor(Math.random() * colors.length)]
      firework.style.animationDelay = Math.random() * 0.5 + 's'
      fireworksContainer.appendChild(firework)

      setTimeout(() => firework.remove(), 1500)
    }, i * 30)
  }

  setTimeout(() => fireworksContainer.remove(), 3000)
}

// 퀴즈 초기화
function initializeQuizzes() {
  const quizzes = document.querySelectorAll('.answer-list[data-quiz]')
  const progress = getProgress()

  quizzes.forEach((quiz) => {
    const quizId = quiz.getAttribute('data-quiz')
    const correctAnswer = parseInt(quiz.getAttribute('data-correct'))
    const resultDiv = document.getElementById(`quiz-result-${quizId}`)

    // 이미 완료된 퀴즈라면 결과 표시
    if (progress[quizId]?.completed) {
      const answers = quiz.querySelectorAll('li')
      answers.forEach((answer, index) => {
        answer.classList.add('disabled')
        if (index === correctAnswer) {
          answer.classList.add('correct')
        }
      })

      if (progress[quizId].userAnswer === correctAnswer) {
        resultDiv.className = 'quiz-result correct'
        resultDiv.innerHTML = '🎉 정답입니다! 훌륭해요!'
      } else {
        resultDiv.className = 'quiz-result incorrect'
        resultDiv.innerHTML = `😅 아쉽네요. 정답은 "${answers[correctAnswer].textContent}"입니다.`
      }
      resultDiv.style.display = 'block'
      return
    }

    // 퀴즈 이벤트 리스너 추가
    quiz.addEventListener('click', (e) => {
      if (
        e.target.tagName === 'LI' &&
        !e.target.classList.contains('disabled') &&
        !e.target.classList.contains('incorrect')
      ) {
        const userAnswer = parseInt(e.target.getAttribute('data-answer'))
        const answers = quiz.querySelectorAll('li')

        if (userAnswer === correctAnswer) {
          // 정답 - 모든 답변 비활성화하고 완료 처리
          answers.forEach((answer) => answer.classList.add('disabled'))
          e.target.classList.add('correct')
          resultDiv.className = 'quiz-result correct'
          resultDiv.innerHTML = '🎉 정답입니다! 훌륭해요!'
          createFireworks()

          setTimeout(() => {
            alert('🎊 축하합니다! 정답을 맞추셨어요! 🎊')
          }, 500)

          // 진행상황 저장 (정답일 때만)
          saveProgress(quizId, true)
          const progress = getProgress()
          progress[quizId].userAnswer = userAnswer
          localStorage.setItem('dmz-tour-progress', JSON.stringify(progress))

          if (typeof updateProgress === 'function') {
            updateProgress(quizId, { 
              type: 'quiz', 
              score: 100,
              result: 'correct',
              userAnswer: userAnswer,
              correctAnswer: correctAnswer
            });
          }

        } else {
          // 오답 - 선택한 답변만 비활성화하고 계속 진행 가능
          e.target.classList.add('incorrect')
          e.target.classList.add('disabled')
          resultDiv.className = 'quiz-result incorrect'
          resultDiv.innerHTML = '😅 다시 시도해보세요! 다른 답을 선택해주세요.'

          // 남은 선택지가 있는지 확인
          const remainingOptions = Array.from(answers).filter(
            (answer) =>
              !answer.classList.contains('disabled') &&
              !answer.classList.contains('incorrect')
          )

          if (remainingOptions.length === 1) {
            // 마지막 남은 선택지가 정답일 경우 힌트 제공
            resultDiv.innerHTML =
              '😅 힌트: 이제 마지막 선택지만 남았어요! 한 번 더 도전해보세요!'
          }
        }

        resultDiv.style.display = 'block'
      }
    })
  })
}

// AR 체험 완료 처리
function completeARExperience(sectionId, note) {

  saveProgress(sectionId, true)

  const section = document.getElementById(sectionId)
  if (section) {
    const button = section.querySelector('.ar-btn')
    if (button && button.textContent.includes('AR체험')) {
      button.textContent = '✅ AR체험 완료'
      button.style.background = '#4CAF50'
    }
  }

  if (typeof updateProgress === 'function') {
    updateProgress(sectionId, { 
      type: 'ar',
      platform: 'web',
      note: note
    });
  }

}

// AR 버튼 이벤트 추가
function initializeARButtons() {
  const progress = getProgress()
  const arButtons = document.querySelectorAll('.ar-btn')

  arButtons.forEach((button) => {
    const section = button.closest('.section')
    const sectionId = section?.id

    if (sectionId && button.textContent.includes('AR체험')) {
      // 이미 완료된 경우
      if (progress[sectionId]?.completed) {
        button.textContent = '✅ AR체험 완료'
        button.style.background = '#4CAF50'
      }
    }
  })
}

// 부드러운 스크롤 함수
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId)
  if (section) {
    section.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
    updateNavDots(sectionId)
  }
}

// 네비게이션 도트 업데이트
function updateNavDots(activeSectionId) {
  const dots = document.querySelectorAll('.nav-dot')

  dots.forEach((dot, index) => {
    dot.classList.remove('active')
    if (SECTIONS[index] === activeSectionId) {
      dot.classList.add('active')
    }
  })
}

// 완주 인증서 공유 함수
function shareResult() {
  const progress = getProgress()
  const completedCount = Object.values(progress).filter(
    (p) => p.completed
  ).length

  if (navigator.share) {
    navigator
      .share({
        title: '2025 DMZ 오픈레이스 완주!',
        text: `광복 80주년 기념 DMZ 평화 스탬프 투어를 완주했습니다! (${completedCount}/11 완료) 🏆`,
        url: window.location.href,
      })
      .catch(console.error)
  } else {
    const text =
      `2025 DMZ 오픈레이스 완주! 광복 80주년 기념 평화 스탬프 투어 (${completedCount}/11 완료) 🏆 ` +
      window.location.href
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert('링크가 클립보드에 복사되었습니다!')
      })
      .catch(() => {
        alert('공유 기능을 사용할 수 없습니다.')
      })
  }
}

// 가장 가까운 섹션으로 스냅
function snapToNearestSection() {
  const sections = document.querySelectorAll('.section')
  const scrollPos = window.scrollY
  let closestSection = null
  let minDistance = Infinity

  sections.forEach((section) => {
    // complete 섹션이 아닌 경우에만 스냅 대상으로 고려
    if (section.id !== 'complete') {
      const sectionTop = section.offsetTop
      const distance = Math.abs(scrollPos - sectionTop)

      if (distance < minDistance) {
        minDistance = distance
        closestSection = section
      }
    }
  })

  // complete 섹션에 있는지 확인
  const completeSection = document.getElementById('complete')
  if (completeSection) {
    const completeTop = completeSection.offsetTop
    const completeDistance = Math.abs(scrollPos - completeTop)

    // complete 섹션에 가장 가까우면서 어느 정도 가까운 거리에 있다면 complete로 스냅
    if (
      completeDistance < 200 &&
      (closestSection === null || completeDistance < minDistance)
    ) {
      closestSection = completeSection
      minDistance = completeDistance
    }
  }

  if (closestSection && minDistance > 50) {
    closestSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }
}

// 스크롤 이벤트 처리
let isScrolling = false
let scrollTimeout

// window.addEventListener('scroll', () => {
//   if (!isScrolling) {
//     const sections = document.querySelectorAll('.section')
//     const scrollPos = window.scrollY + window.innerHeight / 2

//     sections.forEach((section) => {
//       const top = section.offsetTop
//       const bottom = top + section.offsetHeight

//       if (scrollPos >= top && scrollPos <= bottom) {
//         updateNavDots(section.id)
//       }
//     })
//   }

//   clearTimeout(scrollTimeout)
//   scrollTimeout = setTimeout(() => {
//     if (!isScrolling) {
//       snapToNearestSection()
//     }
//   }, 150)
// })

// 휠 이벤트로 섹션별 스크롤 제어
let wheelTimeout
let isWheelScrolling = false

// window.addEventListener(
//   'wheel',
//   (e) => {
//     if (isWheelScrolling) return

//     clearTimeout(wheelTimeout)
//     wheelTimeout = setTimeout(() => {
//       const sections = document.querySelectorAll('.section')
//       const currentScroll = window.scrollY
//       let currentSectionIndex = -1

//       sections.forEach((section, index) => {
//         const sectionTop = section.offsetTop
//         const sectionBottom = sectionTop + section.offsetHeight

//         if (
//           currentScroll >= sectionTop - window.innerHeight / 2 &&
//           currentScroll < sectionBottom - window.innerHeight / 2
//         ) {
//           currentSectionIndex = index
//         }
//       })

//       if (Math.abs(e.deltaY) > 10) {
//         isWheelScrolling = true

//         if (e.deltaY > 0 && currentSectionIndex < sections.length - 1) {
//           sections[currentSectionIndex + 1].scrollIntoView({
//             behavior: 'smooth',
//             block: 'start',
//           })
//         } else if (e.deltaY < 0 && currentSectionIndex > 0) {
//           sections[currentSectionIndex - 1].scrollIntoView({
//             behavior: 'smooth',
//             block: 'start',
//           })
//         }

//         setTimeout(() => {
//           isWheelScrolling = false
//         }, 1000)
//       }
//     }, 50)
//   },
//   { passive: true }
// )

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  updateNavDots('start')
  updateProgressBadges()
  initializeQuizzes()
  initializeARButtons()
})

// 링크 클릭 시 부드러운 스크롤 적용
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault()
    const targetId = this.getAttribute('href').substring(1)
    scrollToSection(targetId)
  })
})

// JavaScript 추가 부분 (common.js에 추가할 함수들)

// 초기화 모달 표시
function showResetModal() {
  document.getElementById('resetModal').style.display = 'block'
}

// 초기화 모달 숨기기
function hideResetModal() {
  document.getElementById('resetModal').style.display = 'none'
}

// 진행상황 완전 초기화
function resetProgress() {
  // 확인 메시지
  if (
    !confirm(
      '정말로 모든 진행상황을 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다.'
    )
  ) {
    return
  }

  // 로컬스토리지 완전 삭제
  localStorage.removeItem('dmz-tour-progress')

  // 모든 완료 배지 제거
  document.querySelectorAll('.completed-badge').forEach((badge) => {
    badge.remove()
  })

  // 모든 퀴즈 상태 초기화
  document.querySelectorAll('.answer-list[data-quiz]').forEach((quiz) => {
    const answers = quiz.querySelectorAll('li')
    answers.forEach((answer) => {
      answer.className = ''
      answer.style.pointerEvents = 'auto'
    })
  })

  // 모든 퀴즈 결과 숨기기 및 초기화
  document.querySelectorAll('.quiz-result').forEach((result) => {
    result.style.display = 'none'
    result.className = 'quiz-result'
    result.innerHTML = ''
  })

  // 모든 AR 버튼 초기화
  document.querySelectorAll('.ar-btn').forEach((button) => {
    if (button.textContent.includes('완료')) {
      button.textContent = button.textContent.replace(
        '✅ AR체험 완료',
        'AR체험 시작'
      )
      button.style.background =
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }
  })

  // 모달 숨기기
  hideResetModal()

  // 퀴즈와 AR 버튼 재초기화
  initializeQuizzes()
  initializeARButtons()

  alert(
    '🔄 모든 진행상황이 초기화되었습니다!\n처음부터 다시 시작하실 수 있습니다.'
  )

  // 시작 페이지로 이동
  scrollToSection('start')
}

// 모달 외부 클릭 시 닫기 (기존 DOMContentLoaded 이벤트에 추가)
window.onclick = function (event) {
  const modal = document.getElementById('resetModal')
  if (event.target === modal) {
    hideResetModal()
  }
}

// 기존 initializeQuizzes 함수 수정 (퀴즈 재초기화를 위해)
function resetQuizState(quiz, quizId) {
  // 기존 이벤트 리스너 제거를 위해 복제
  const newQuiz = quiz.cloneNode(true)
  quiz.parentNode.replaceChild(newQuiz, quiz)

  // 모든 답변 상태 초기화
  const answers = newQuiz.querySelectorAll('li')
  answers.forEach((answer) => {
    answer.className = ''
    answer.style.pointerEvents = 'auto'
  })

  // 결과 초기화
  const resultDiv = document.getElementById(`quiz-result-${quizId}`)
  if (resultDiv) {
    resultDiv.style.display = 'none'
    resultDiv.className = 'quiz-result'
    resultDiv.innerHTML = ''
  }

  return newQuiz
}

function snapToNearestSection() {
  const sections = document.querySelectorAll('.section')
  const scrollPos = window.scrollY
  let closestSection = null
  let minDistance = Infinity

  sections.forEach((section) => {
    // complete 섹션이 아닌 경우에만 스냅 대상으로 고려
    if (section.id !== 'complete') {
      const sectionTop = section.offsetTop
      const distance = Math.abs(scrollPos - sectionTop)

      if (distance < minDistance) {
        minDistance = distance
        closestSection = section
      }
    }
  })

  // complete 섹션에 있는지 확인
  const completeSection = document.getElementById('complete')
  if (completeSection) {
    const completeTop = completeSection.offsetTop
    const completeDistance = Math.abs(scrollPos - completeTop)

    // complete 섹션에 가장 가까우면서 어느 정도 가까운 거리에 있다면 complete로 스냅
    if (
      completeDistance < 200 &&
      (closestSection === null || completeDistance < minDistance)
    ) {
      closestSection = completeSection
      minDistance = completeDistance
    }
  }

  if (closestSection && minDistance > 50) {
    closestSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }
}

function showQRNotice() {
    // 부드럽게 start 섹션으로 스크롤
    const startSection = document.getElementById('start');
    if (startSection) {
        startSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
    
}
