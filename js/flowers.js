function executeFlowersScript() {

    const existingFlowers = document.getElementById('flowers');
    if (existingFlowers) {
        existingFlowers.innerHTML = '';
    }

    const stage = document.getElementById('stage');
    const svg   = document.getElementById('overlay');
    const layer = document.getElementById('flowers');
    const done  = document.getElementById('complete');

    const fx = document.getElementById('fx');
    const ctx = fx.getContext('2d');

    // 목표 개수 고정 (10개)
    const TARGET = 10;
    let opened = 0;
    

    // 네가 제공한 4개의 꽃 이미지 경로
    const FLOWER_SOURCES = [
        'img/flower_1.png',
        'img/flower_2.png',
        'img/flower_3.png',
        'img/flower_4.png'
    ];
    let imagePool = [];

    // 캔버스 리사이즈
    function resizeFX(){
        fx.width  = stage.clientWidth * devicePixelRatio;
        fx.height = stage.clientHeight * devicePixelRatio;
        fx.style.width  = stage.clientWidth + 'px';
        fx.style.height = stage.clientHeight + 'px';
    }
    window.addEventListener('resize', resizeFX, {passive:true});
    resizeFX();

    // CSS 변수 숫자 읽기
    function getCss(name, fallback){
        const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        const n = Number(v); return Number.isFinite(n) ? n : fallback;
    }
    function rand(min,max){ return Math.random()*(max-min)+min; }
    function randInt(min,max){ return Math.floor(rand(min,max+1)); }

    // 포인터 좌표 -> SVG 좌표
    function toSVGPoint(x,y){
        const pt = new DOMPoint(x,y);
        const ctm = svg.getScreenCTM().inverse();
        return pt.matrixTransform(ctm);
    }

    // ===== 이미지 프리로드 =====
    Promise.allSettled(
        FLOWER_SOURCES.map(src => new Promise(res=>{
        const im = new Image();
        im.onload = ()=>res({ok:true, img:im});
        im.onerror = ()=>res({ok:false});
        im.src = src;
        }))
    ).then(results=>{
        imagePool = results.filter(r=>r.value && r.value.ok).map(r=>r.value.img);
        // 이미지 로드 완료 후 자동 개화 시작
        startAutoBlooming();
    });

    // ===== 자동 개화 시작 =====
    function startAutoBlooming(){
        // 2초 후 모든 꽃이 동시에 피어나기
        setTimeout(() => {
        for(let i = 0; i < TARGET; i++){
            if(opened < TARGET) {
            plantRandomly();
            }
        }
        }, 2000); // 2초 대기 후 모든 꽃 동시 개화
    }

    // 꽃 위치를 저장할 배열 (겹침 방지용)
    const usedPositions = [];
    const MIN_DISTANCE = 80; // 꽃 간 최소 거리

    // ===== 화면 하단 70% 영역에 겹치지 않게 꽃 심기 =====
    function plantRandomly(){
        if(opened >= TARGET) return;
        if(imagePool.length === 0) return;

        let attempts = 0;
        let clientX, clientY;
        
        // 겹치지 않는 위치를 찾을 때까지 시도 (최대 50번)
        do {
        // 화면 하단 70% 영역에서 랜덤 위치 선택
        const margin = 60; // 화면 가장자리에서 여백
        clientX = rand(margin, stage.clientWidth - margin);
        clientY = rand(stage.clientHeight * 0.3, stage.clientHeight - margin); // 높이의 30% 아래부터
        attempts++;
        } while (attempts < 50 && isPositionTooClose(clientX, clientY));
        
        // 사용된 위치에 추가
        usedPositions.push({x: clientX, y: clientY});
        
        plantAt(clientX, clientY);
    }

    // 다른 꽃들과 너무 가까운지 확인
    function isPositionTooClose(x, y) {
        return usedPositions.some(pos => {
        const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        return distance < MIN_DISTANCE;
        });
    }

    // ===== 센터-아웃 개화: 마스크+스케일 애니메이션 =====
    function plantAt(clientX, clientY){
        if(opened >= TARGET) return;
        if(imagePool.length === 0) return;

        const p = toSVGPoint(clientX, clientY);
        const pick = imagePool[randInt(0, imagePool.length-1)];

        // 그룹 생성
        const g = document.createElementNS('http://www.w3.org/2000/svg','g');
        g.setAttribute('filter','url(#softShadow)');
        layer.appendChild(g);

        // 고정 기준 크기
        const base = rand(80, 120);
        const scaleTarget = rand(0.7, 1.0);
        const rot   = rand(-8, 8);

        // 이미지 노드
        const img = document.createElementNS('http://www.w3.org/2000/svg','image');
        img.setAttributeNS('http://www.w3.org/1999/xlink','href', pick.src);
        img.setAttribute('width', base);
        img.setAttribute('height', base);
        img.setAttribute('x', -base/2);
        img.setAttribute('y', -base/2);
        img.setAttribute('preserveAspectRatio','xMidYMid meet');

        // 마스크(원형) - 중심에서 반경이 커지며 드러남
        const maskId = 'm' + Math.random().toString(36).slice(2);
        const mask = document.createElementNS('http://www.w3.org/2000/svg','mask');
        mask.setAttribute('id', maskId);

        const maskCircle = document.createElementNS('http://www.w3.org/2000/svg','circle');
        maskCircle.setAttribute('cx','0');
        maskCircle.setAttribute('cy','0');
        maskCircle.setAttribute('r','0');
        maskCircle.setAttribute('fill','#fff');
        mask.appendChild(maskCircle);
        svg.querySelector('defs')?.appendChild(mask) || (()=>{
        const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
        svg.prepend(defs); defs.appendChild(mask);
        })();

        // 이미지에 마스크 적용
        img.setAttribute('mask', `url(#${maskId})`);
        g.appendChild(img);

        // 초기 트랜스폼(opacity 0, 아주 작게)
        g.style.opacity = '0';
        g.setAttribute('transform', `translate(${p.x},${p.y}) scale(0.15) rotate(${rot})`);

        // 애니메이션: 5초 동안 천천히 피어나기
        const D_OPA = 1000;   // opacity 트랜지션(ms) - 1초
        const D_SCL = 5000;   // scale 트랜지션(ms) - 5초  
        const D_MSK = 5000;   // 마스크 반경 확장(ms) - 5초
        const rTarget = Math.sqrt((base/2)**2 + (base/2)**2);

        // opacity + scale easing
        requestAnimationFrame(()=>{
        g.style.transition = `opacity ${D_OPA}ms ease, transform ${D_SCL}ms cubic-bezier(.2,1.2,.2,1)`;
        g.style.opacity = '1';
        g.setAttribute('transform', `translate(${p.x},${p.y}) scale(${scaleTarget*1.03}) rotate(${rot})`);
        setTimeout(()=>{
            g.setAttribute('transform', `translate(${p.x},${p.y}) scale(${scaleTarget}) rotate(${rot})`);
        }, D_SCL);
        });

        // 마스크 반경은 JS로 부드럽게 확대
        const t0 = performance.now();
        (function growMask(now){
        const t = Math.min(1, (now - t0) / D_MSK);
        const ease = t<0.5 ? 2*t*t : -1+(4-2*t)*t;
        const r = rTarget * ease;
        maskCircle.setAttribute('r', String(r));
        if(t < 1) requestAnimationFrame(growMask);
        })(t0);

        // 미세 흔들림(자연스러움)
        sway(g, p.x, p.y, scaleTarget, rot);

        // 진행/완료
        opened += 1;
        if (opened >= TARGET) setTimeout(complete, 6000); // 완료 지연시간도 늘림
    }

    // 미세 흔들림
    function sway(node, x, y, scale, rot){
        const phase = Math.random()*Math.PI*2;
        (function loop(){
        if (!document.body.contains(node)) return;
        const t = performance.now()/1000 + phase;
        const dx = Math.sin(t*0.7)*1.2;
        const dy = Math.cos(t*0.9)*0.8;
        node.setAttribute('transform',`translate(${x+dx},${y+dy}) scale(${scale}) rotate(${rot})`);
        requestAnimationFrame(loop);
        })();
    }

    // 완료 처리
    function complete(){
        document.getElementById('complete').style.display='grid';
        confetti();
        // 외부 연동 이벤트/콜백
        stage.dispatchEvent(new CustomEvent('garden:complete', {detail:{ total: opened, target: TARGET }}));
        if (typeof window.onGardenComplete === 'function'){
        window.onGardenComplete({ total: opened, target: TARGET });
        }
    }

    // 간단 콘페티
    function confetti(){
        resizeFX();
        const pieces=[];
        for(let i=0;i<700;i++){
        pieces.push({
            x: fx.width/2 + (Math.random()*80-40),
            y: fx.height*0.55,
            vx: Math.random()*6-3,
            vy: - (4+Math.random()*5),
            g: 0.08 + Math.random()*0.08,
            s: 2 + Math.random()*2,
            a: 1,
            r: Math.random()*Math.PI
        });
        }
        function step(){
        ctx.clearRect(0,0,fx.width,fx.height);
        for(const p of pieces){
            p.vy += p.g; p.x += p.vx; p.y += p.vy; p.r += 0.1; p.a -= 0.007;
            ctx.globalAlpha = Math.max(0,p.a);
            ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.r);
            ctx.fillRect(-p.s/2,-p.s/2,p.s,p.s); ctx.restore();
        }
        ctx.globalAlpha = 1;
        if (pieces.some(p=>p.a>0 && p.y<fx.height+20)) requestAnimationFrame(step);
        }
        step();
        setTimeout(()=>ctx.clearRect(0,0,fx.width,fx.height), 2600);
    }

}