// ============================================
// AI Game Maker - Web UI JavaScript - ProjectGen
// Every game MUST be generated from video frames (multi-fps)
// ============================================

let gameMakerState = {
    isGenerating: false,
    currentGame: null,
    currentProjectId: null,
    videoStream: null,
    generationResults: [],
    motionStats: {},
    systemStatus: 'ready',
    projects: []
};

const elements = {
    systemStatus: document.getElementById('systemStatus'),
    videoInput: document.getElementById('videoInput'),
    videoCanvas: document.getElementById('videoCanvas'),
    videoOverlay: document.getElementById('videoOverlay'),
    generateBtn: document.getElementById('generateBtn'),
    stopBtn: document.getElementById('stopBtn'),
    generationStatus: document.getElementById('generationStatus'),
    generationProgress: document.getElementById('generationProgress'),
    progressFill: document.getElementById('progressFill'),
    framesProcessed: document.getElementById('framesProcessed'),
    objectsDetected: document.getElementById('objectsDetected'),
    generationTime: document.getElementById('generationTime'),
    runGameBtn: document.getElementById('runGameBtn'),
    exportGameBtn: document.getElementById('exportGameBtn'),
    saveGameBtn: document.getElementById('saveGameBtn'),
    gameInfo: document.getElementById('gameInfo'),
    gameTitle: document.getElementById('gameTitle'),
    gameGenre: document.getElementById('gameGenre'),
    gameTheme: document.getElementById('gameTheme'),
    gameLevels: document.getElementById('gameLevels'),
    gameCanvas: document.getElementById('gameCanvas'),
    visualizationOverlay: document.getElementById('visualizationOverlay'),
    creativitySlider: document.getElementById('creativitySlider'),
    creativityValue: document.getElementById('creativityValue'),
    numLevelsInput: document.getElementById('numLevelsInput'),
    gameGenreSelect: document.getElementById('gameGenreSelect'),
    videoSourceSelect: document.getElementById('videoSourceSelect'),
    frameSkipInput: document.getElementById('frameSkipInput'),
    fpsInput: document.getElementById('fpsInput'),
    durationInput: document.getElementById('durationInput'),
    resolutionSelect: document.getElementById('resolutionSelect'),
    projectNameInput: document.getElementById('projectNameInput'),
    videoUploadInput: document.getElementById('videoUploadInput'),
    projectsList: document.getElementById('projectsList'),
    activeProjectInfo: document.getElementById('activeProjectInfo'),
    motionPatterns: document.getElementById('motionPatterns'),
    motionHistory: document.getElementById('motionHistory'),
    motionProfiles: document.getElementById('motionProfiles'),
    gamesGenerated: document.getElementById('gamesGenerated'),
    creativityLevel: document.getElementById('creativityLevel'),
    totalGenerations: document.getElementById('totalGenerations'),
    avgGenerationTime: document.getElementById('avgGenerationTime'),
    avgFramesProcessed: document.getElementById('avgFramesProcessed'),
    historyList: document.getElementById('historyList'),
    savedGamesList: document.getElementById('savedGamesList'),
    exportModal: document.getElementById('exportModal'),
    saveModal: document.getElementById('saveModal'),
    exportFilename: document.getElementById('exportFilename'),
    saveFilename: document.getElementById('saveFilename'),
    toastContainer: document.getElementById('toastContainer')
};

function init() {
    console.log('Initializing AI Game Maker ProjectGen...');
    setupEventListeners();
    setupSliders();
    checkSystemStatus();
    refreshProjects();
    switchTab('projects');
    showToast('ProjectGen ready — every game from video generation', 'info');
}

function setupEventListeners() {
    if (elements.creativitySlider) {
        elements.creativitySlider.addEventListener('input', function() {
            elements.creativityValue.textContent = this.value;
            if (elements.creativityLevel) elements.creativityLevel.textContent = this.value;
        });
    }
}
function setupSliders() {
    if (elements.creativitySlider && elements.creativityValue) elements.creativityValue.textContent = elements.creativitySlider.value;
}

function switchTab(tabName) {
    const tabs = ['projects','world','settings', 'ai', 'research', 'history'];
    tabs.forEach(tab => {
        const el = document.getElementById(tab + 'Tab');
        if (el) el.classList.add('hidden');
        const btn = document.querySelector(`[data-tab="${tab}"]`);
        if (btn) btn.classList.remove('active');
    });
    const target = document.getElementById(tabName + 'Tab');
    if (target) target.classList.remove('hidden');
    const btn = document.querySelector(`[data-tab="${tabName}"]`);
    if (btn) btn.classList.add('active');
    if (tabName === 'ai') refreshMotionStats();
    else if (tabName === 'research') refreshResearchStats();
    else if (tabName === 'history') { refreshHistory(); loadSavedGames(); }
    else if (tabName === 'projects') refreshProjects();
    else if (tabName === 'world') loadWorldPreview();
}

async function checkSystemStatus() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        gameMakerState.systemStatus = data.system;
        const statusDot = elements.systemStatus.querySelector('.status-dot');
        const statusText = elements.systemStatus.querySelector('.status-text');
        if (data.system === 'running') {
            statusDot.classList.remove('warning', 'error');
            statusText.textContent = 'Ready • ProjectGen';
        } else {
            statusDot.classList.add('warning');
            statusText.textContent = data.system;
        }
        if(elements.generateBtn) elements.generateBtn.disabled = gameMakerState.isGenerating;
        if(elements.stopBtn) elements.stopBtn.disabled = !gameMakerState.isGenerating;
        if(elements.runGameBtn) elements.runGameBtn.disabled = !data.has_game;
        if(elements.exportGameBtn) elements.exportGameBtn.disabled = !data.has_game;
        if(elements.saveGameBtn) elements.saveGameBtn.disabled = !data.has_game;
        checkGenerationStatus();
    } catch (error) {
        console.error('Error checking system status:', error);
    }
}
async function checkGenerationStatus() {
    try {
        const response = await fetch('/api/generation/status');
        const data = await response.json();
        gameMakerState.isGenerating = data.is_generating;
        if(elements.generateBtn) elements.generateBtn.disabled = data.is_generating;
        if(elements.stopBtn) elements.stopBtn.disabled = !data.is_generating;
        if (data.last_generation) {
            gameMakerState.lastGeneration = data.last_generation;
            if (data.last_generation.success && data.last_generation.game_design) {
                gameMakerState.currentGame = data.last_generation.game_design;
                updateGameInfo();
                drawGamePreview();
                // also refresh projects because a new project was created
                refreshProjects();
            }
            updateGenerationStats(data.last_generation);
        }
    } catch (error) { console.error(error); }
}

async function startCamera() {
    try {
        const resolution = elements.resolutionSelect.value;
        const [width, height] = resolution.split('x').map(Number);
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: width }, height: { ideal: height } }, audio: false });
        gameMakerState.videoStream = stream;
        elements.videoInput.srcObject = stream;
        elements.videoOverlay.classList.add('hidden');
        setupVideoProcessing();
        showToast('Camera started — ready to Generate Project from live motion', 'success');
    } catch (error) { showToast('Could not access camera', 'error'); }
}
function stopCamera() {
    if (gameMakerState.videoStream) {
        gameMakerState.videoStream.getTracks().forEach(track => track.stop());
        gameMakerState.videoStream = null;
        elements.videoInput.srcObject = null;
        elements.videoOverlay.classList.remove('hidden');
        showToast('Camera stopped', 'info');
    }
}
function setupVideoProcessing() {
    const video = elements.videoInput;
    const canvas = elements.videoCanvas;
    function resizeCanvas() { canvas.width = video.videoWidth; canvas.height = video.videoHeight; }
    video.addEventListener('loadedmetadata', resizeCanvas);
    function processFrame() {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        requestAnimationFrame(processFrame);
    }
    processFrame();
}

async function handleVideoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const projectName = elements.projectNameInput.value.trim() || file.name.replace(/\.[^/.]+$/, "");
    const duration = parseFloat(elements.durationInput.value) || 5.0;
    showToast(`Uploading ${file.name} → creating ProjectGen...`, 'info');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_name', projectName);
    formData.append('duration', duration);
    try {
        gameMakerState.isGenerating = true;
        elements.generateBtn.disabled = true;
        elements.generationStatus.querySelector('.status-text').textContent = 'Uploading video → ProjectGen...';
        const resp = await fetch('/api/projects/upload', { method: 'POST', body: formData });
        const data = await resp.json();
        if (data.status === 'started') {
            showToast('Video uploaded — Project generation started', 'success');
            pollGeneration();
        } else showToast(data.error || 'Upload failed', 'error');
    } catch(e){ showToast('Upload error', 'error'); console.error(e); }
}

async function captureFrame() {
    if (!gameMakerState.videoStream) { showToast('Start camera first', 'warning'); return; }
    const canvas = elements.videoCanvas;
    const image = canvas.toDataURL('image/jpeg', 0.8);
    const blob = await fetch(image).then(res => res.blob());
    const formData = new FormData();
    formData.append('file', blob, 'frame.jpg');
    const projectName = elements.projectNameInput.value.trim();
    if (projectName) formData.append('project_name', projectName);
    try {
        showToast('Captured frame → creating 1-frame video Project...', 'info');
        const response = await fetch('/api/frame', { method: 'POST', body: formData });
        const data = await response.json();
        if (data.error) showToast(data.error, 'error');
        else {
            showToast(`Project created from frame: ${data.project?.project_name || 'frame-project'}`, 'success');
            gameMakerState.currentGame = data.game_design;
            updateGameInfo(); drawGamePreview(); refreshProjects();
        }
    } catch (error) { showToast('Error processing frame', 'error'); }
}

async function generateGame() {
    if (gameMakerState.isGenerating) { showToast('Generation in progress...', 'warning'); return; }
    const duration = parseFloat(elements.durationInput.value) || 5.0;
    const projectName = elements.projectNameInput.value.trim() || undefined;
    try {
        gameMakerState.isGenerating = true;
        elements.generateBtn.disabled = true;
        elements.stopBtn.disabled = false;
        elements.generationStatus.querySelector('.status-icon').textContent = '🔄';
        elements.generationStatus.querySelector('.status-text').textContent = `Generating ProjectGen from video (${duration}s, ${elements.fpsInput.value} fps)…`;
        elements.progressFill.style.width = '10%';
        const response = await fetch('/api/projects/generate', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ duration, project_name: projectName })
        });
        const data = await response.json();
        if (data.status === 'started') {
            showToast(`ProjectGen started${projectName ? ': '+projectName : ''} — processing ${duration}s video @ ${elements.fpsInput.value} fps`, 'info');
            pollGeneration();
        }
    } catch (error) {
        showToast('Error generating project', 'error');
        gameMakerState.isGenerating = false;
        elements.generateBtn.disabled = false;
        elements.stopBtn.disabled = true;
    }
}
function pollGeneration(){
    const pollInterval = setInterval(async () => {
        await checkGenerationStatus();
        if (!gameMakerState.isGenerating) {
            clearInterval(pollInterval);
            if (gameMakerState.lastGeneration && gameMakerState.lastGeneration.success) {
                elements.generationStatus.querySelector('.status-icon').textContent = '✅';
                elements.generationStatus.querySelector('.status-text').textContent = `Project created! ${gameMakerState.lastGeneration.frames_processed} frames → game`;
                elements.progressFill.style.width = '100%';
                showToast('ProjectGen complete — game generated from video!', 'success');
                refreshProjects();
            } else {
                elements.generationStatus.querySelector('.status-icon').textContent = '❌';
                elements.generationStatus.querySelector('.status-text').textContent = 'Generation failed — need video frames';
            }
        } else {
            // animate progress
            const w = parseInt(elements.progressFill.style.width) || 10;
            elements.progressFill.style.width = Math.min(90, w + 5) + '%';
        }
    }, 1000);
}
async function stopGeneration() {
    gameMakerState.isGenerating = false;
    elements.generateBtn.disabled = false;
    elements.stopBtn.disabled = true;
    showToast('Generation stopped', 'info');
}
function updateGenerationStats(generation) {
    if (generation) {
        elements.framesProcessed.textContent = generation.frames_processed || '0';
        elements.generationTime.textContent = (generation.generation_time || 0).toFixed(2) + 's';
        const progress = Math.min(100, (generation.frames_processed / Math.max(generation.frames_processed, 1) * 100));
        elements.progressFill.style.width = progress + '%';
    }
}
function updateGameInfo() {
    if (!gameMakerState.currentGame) {
        if(elements.gameTitle) elements.gameTitle.textContent = '-'; if(elements.gameGenre) elements.gameGenre.textContent = '-'; if(elements.gameTheme) elements.gameTheme.textContent = '-'; if(elements.gameLevels) elements.gameLevels.textContent = '-';
        if(elements.visualizationOverlay) elements.visualizationOverlay.classList.remove('hidden'); return;
    }
    if(elements.gameTitle) elements.gameTitle.textContent = gameMakerState.currentGame.title || '-';
    if(elements.gameGenre) elements.gameGenre.textContent = gameMakerState.currentGame.genre || '-';
    if(elements.gameTheme) elements.gameTheme.textContent = gameMakerState.currentGame.theme || '-';
    if(elements.gameLevels) elements.gameLevels.textContent = (gameMakerState.currentGame.levels || []).length || '-';
    if(elements.visualizationOverlay) elements.visualizationOverlay.classList.add('hidden');
    if(elements.runGameBtn) elements.runGameBtn.disabled = false; if(elements.exportGameBtn) elements.exportGameBtn.disabled = false; if(elements.saveGameBtn) elements.saveGameBtn.disabled = false;
    if (gameMakerState.currentProjectId && elements.activeProjectInfo) {
        elements.activeProjectInfo.innerHTML = `<b>${gameMakerState.currentGame.title}</b><br><small>${gameMakerState.currentGame.genre} • ${gameMakerState.currentGame.theme}</small><br><small style="color:#6c757d;">Project: ${gameMakerState.currentProjectId}</small>`;
    }
}
function drawGamePreview() {
    if (!gameMakerState.currentGame || !elements.gameCanvas) return;
    const canvas = elements.gameCanvas;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth || 800; canvas.height = 400;
    // preview panel background — make visible
    ctx.fillStyle = '#0f141e'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    // subtle grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth=1;
    for(let x=0;x<canvas.width;x+=32){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke(); }
    for(let y=0;y<canvas.height;y+=32){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke(); }
    // world tiles faint behind (if available)
    if(gameMakerState.currentGame.world){
        const world = gameMakerState.currentGame.world;
        const sX = canvas.width / ((world.size_tiles?.[0]||80)*32);
        const sY = canvas.height / ((world.size_tiles?.[1]||24)*32);
        ctx.save(); ctx.globalAlpha=0.45;
        Object.values(world.tilemap?.chunks||{}).forEach(ch=>{
            const [cx,cy]=ch.coord;
            ch.tiles.forEach((row,ly)=> row.forEach((td,lx)=>{
                if(td.type===0) return;
                const x=(cx*16+lx)*32*sX, y=(cy*16+ly)*32*sY;
                const col={1:'#2b3a2b',2:'#2d7d46',3:'#3a3a4a',4:'#8b1e1e'}[td.type]||'#888';
                ctx.fillStyle=col; ctx.fillRect(x,y,32*sX,32*sY);
            }));
        }); ctx.restore();
    }
    const level = gameMakerState.currentGame.levels[0];
    if (level && level.elements) {
        level.elements.forEach(element => {
            const x = element.x * (canvas.width / 640); const y = element.y * (canvas.height / 480);
            const width = Math.max(8, element.width * (canvas.width / 640)); const height = Math.max(8, element.height * (canvas.height / 480));
            let color = '#888', glow=null;
            switch (element.type) { case 'player': color = '#0d6efd'; glow='rgba(13,110,253,0.35)'; break; case 'platform': color = '#198754'; break; case 'enemy': color = '#dc3545'; glow='rgba(220,53,69,0.25)'; break; case 'collectible': color = '#ffc107'; glow='rgba(255,193,7,0.35)'; break; }
            if(glow){ ctx.fillStyle=glow; ctx.fillRect(x-3,y-3,width+6,height+6); }
            ctx.fillStyle = color; ctx.fillRect(x, y, width, height); ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth=1; ctx.strokeRect(x, y, width, height);
            ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Inter, Arial'; ctx.textAlign = 'center'; ctx.fillText(element.type, x + width/2, y + height/2 +3);
        });
    }
    // preview label
    ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.font='700 12px Inter'; ctx.textAlign='left'; ctx.fillText(`▶ PREVIEW: ${gameMakerState.currentGame.title} • ${gameMakerState.currentGame.genre}`, 12, 18);
    ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='11px Inter'; ctx.fillText(`${level?.elements?.length||0} objects • world ${gameMakerState.currentGame.world ? Object.keys(gameMakerState.currentGame.world.tilemap.chunks).length+' chunks' : ''}`, 12, 32);
    // highlight pulse on right panel
    const wrap = document.querySelector('.game-side-canvas-wrap');
    if(wrap){ wrap.style.outline='2px solid #0d6efd'; wrap.style.outlineOffset='-2px'; setTimeout(()=> wrap.style.outline='', 900); }
}
function openGenieWorld(){
    const pid = gameMakerState.currentProjectId || (gameMakerState.projects[0]?.project_id);
    const url = pid ? `/static/genie.html?pid=${pid}` : '/static/genie.html';
    window.open(url, '_blank');
    showToast('Entering Genie World — infinite chunks, explorable', 'success');
}
function runGame() {
    if (!gameMakerState.currentGame) { showToast('No project loaded', 'warning'); return; }
    localStorage.setItem('aiGameMaker_currentGame', JSON.stringify(gameMakerState.currentGame));
    if (gameMakerState.currentProjectId) localStorage.setItem('aiGameMaker_currentProject', gameMakerState.currentProjectId);
    window.open('/static/game.html', '_blank', 'width=800,height=600');
    showToast('Launching game from ProjectGen video…', 'info');
}
function exportGame() { if (!gameMakerState.currentGame) { showToast('No game to export', 'warning'); return; } elements.exportModal.classList.add('active'); }
async function confirmExport() {
    const filename = elements.exportFilename.value || 'game_design';
    try { const r=await fetch('/api/game/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({filename:filename+'.json'})}); const d=await r.json(); if(d.status==='success'){showToast('Exported', 'success'); closeModal('exportModal'); refreshProjects(); } else showToast('Error','error'); } catch(e){showToast('Error','error');}
}
function saveGame(){ if(!gameMakerState.currentGame) return; elements.saveModal.classList.add('active'); }
async function confirmSave(){ const filename=elements.saveFilename.value||'my_game'; try{ const r=await fetch('/api/game/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({filename:filename+'.json'})}); const d=await r.json(); if(d.status==='success'){showToast('Saved','success'); closeModal('saveModal'); refreshProjects(); } } catch(e){showToast('Error','error');} }

async function refreshProjects(){
    try{
        const r=await fetch('/api/projects'); const d=await r.json();
        gameMakerState.projects = d.projects || [];
        if(elements.gamesGenerated) elements.gamesGenerated.textContent = d.stats?.total_projects || gameMakerState.projects.length;
        if(elements.totalGenerations) elements.totalGenerations.textContent = d.stats?.total_projects || 0;
        if(!elements.projectsList) return;
        if(gameMakerState.projects.length===0){
            elements.projectsList.innerHTML = `<div class="history-item"><div class="history-time">—</div><div class="history-title">No projects yet — generate from video above</div></div>`;
            return;
        }
        elements.projectsList.innerHTML = gameMakerState.projects.map(p=>`
            <div class="history-item" style="flex-direction:column; align-items:flex-start; gap:6px;">
                <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                    <div>
                        <div style="font-weight:600; font-size:13px;">${p.project_name}</div>
                        <div style="font-size:11px; color:#6c757d;">${p.game_title} • ${p.game_genre} • ${p.video_meta.frames_processed} frames @ ${p.video_meta.fps}fps • ${new Date(p.created_at).toLocaleString()}</div>
                        <div style="font-size:11px; color:#0d6efd;">ID: ${p.project_id}</div>
                    </div>
                    <div style="display:flex; gap:6px;">
                        <button class="btn btn-small btn-primary" onclick="loadProject('${p.project_id}')">Load</button>
                        <button class="btn btn-small" onclick="deleteProject('${p.project_id}')">🗑️</button>
                    </div>
                </div>
            </div>
        `).join('');
    }catch(e){ console.error(e); }
}
async function loadProject(projectId){
    try{
        const r=await fetch(`/api/projects/${projectId}/load`,{method:'POST'});
        const d=await r.json();
        if(d.status==='success'){
            gameMakerState.currentProjectId = projectId;
            gameMakerState.currentGame = d.game;
            updateGameInfo(); drawGamePreview();
            if(elements.activeProjectInfo) elements.activeProjectInfo.innerHTML = `<b>${d.game.title}</b><br><small>${d.game.genre} • ${d.game.theme}</small><br><small style="color:#6c757d;">${projectId}</small><br><small style="color:#6c757d;">Video: ${d.game.metadata?.source_scene || 'video'} • ${projectId}</small>`;
            showToast(`Project loaded: ${d.game.title}`, 'success');
            loadWorldPreview();
        } else showToast('Load failed','error');
    }catch(e){ showToast('Error loading project','error'); }
}
async function deleteProject(projectId){
    if(!confirm('Delete project '+projectId+'?')) return;
    try{ const r=await fetch(`/api/projects/${projectId}`,{method:'DELETE'}); const d=await r.json(); if(d.status==='deleted'){showToast('Deleted','info'); refreshProjects(); }}catch(e){showToast('Delete failed','error');}
}

async function loadSavedGames(){ /* backwards compat */ if(elements.savedGamesList) elements.savedGamesList.innerHTML = `<div class="saved-game-item"><div class="saved-game-name">Use Projects tab — all games are Projects from video</div></div>`; }
async function loadGame(filename){ showToast('Use Projects tab to load video-generated Projects','info'); }
async function applySettings(){
    const config={ video_source: parseInt(elements.videoSourceSelect.value)||0, target_fps: parseFloat(elements.fpsInput.value)||10.0, frame_skip: parseInt(elements.frameSkipInput.value)||1, creativity: parseFloat(elements.creativitySlider.value)||0.7, num_levels: parseInt(elements.numLevelsInput.value)||3, resolution: elements.resolutionSelect.value };
    if(elements.gameGenreSelect.value) config.game_genre=elements.gameGenreSelect.value;
    try{ const r=await fetch('/api/config',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(config)}); const d=await r.json(); if(d.status==='success') showToast('Settings applied','success'); }catch(e){showToast('Error','error');}
}
async function refreshMotionStats(){ try{ const r=await fetch('/api/motion'); const d=await r.json(); if(elements.motionPatterns) elements.motionPatterns.textContent=d.motion_patterns||'0'; if(elements.motionHistory) elements.motionHistory.textContent=d.motion_history?Object.values(d.motion_history).reduce((a,b)=>a+b,0):'0'; if(elements.motionProfiles) elements.motionProfiles.textContent=d.motion_profiles||'0'; }catch(e){}}
async function refreshResearchStats(){ try{ const r=await fetch('/api/projects'); const d=await r.json(); if(elements.totalGenerations) elements.totalGenerations.textContent=d.stats?.total_projects||0; if(elements.avgGenerationTime) elements.avgGenerationTime.textContent='~'+(d.projects[0]?.video_meta?.duration||0)+'s'; if(elements.avgFramesProcessed) elements.avgFramesProcessed.textContent=d.stats?.total_frames_processed||0; }catch(e){}}
function refreshHistory(){ if(elements.historyList) elements.historyList.innerHTML = `<div class="history-item"><div class="history-time">—</div><div class="history-title">All history is now Projects (video-gen). See Projects tab.</div></div>`; }
async function exportResearchData(){ const fn=(document.getElementById('researchFilename')?.value)||'research_data'; try{ const r=await fetch('/api/research/export',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({filename:fn+'.json'})}); const d=await r.json(); if(d.status==='success') showToast('Research exported','success'); }catch(e){showToast('Error','error');} }
async function loadWorldPreview(){
    const pid = gameMakerState.currentProjectId || (gameMakerState.projects[0]?.project_id);
    const infoEl=document.getElementById('worldInfo');
    const pre=document.getElementById('worldJsonPreview');
    if(!pid){ if(infoEl) infoEl.textContent='No world loaded — generate a Project'; if(pre) pre.textContent='—'; return; }
    try{
        const r=await fetch(`/api/projects/${pid}/world`);
        const w=await r.json();
        if(w.error){ if(infoEl) infoEl.textContent=w.error; return; }
        const chunks=Object.keys(w.tilemap?.chunks||{}).length;
        if(infoEl) infoEl.innerHTML=`<b>World ${w.size_tiles?.[0]||80}×${w.size_tiles?.[1]||24} tiles</b> • ${chunks} chunks • biome: ${w.meta?.biome||'?'} • spawn: ${w.spawn}<br><small>Tile 32px • Chunk 16×16 (512px) • culling + swept physics</small>`;
        if(pre) pre.textContent=JSON.stringify(w,null,2).slice(0,1200);
        // also draw world to canvas preview if exists
        drawWorldPreview(w);
    }catch(e){ if(infoEl) infoEl.textContent='World load failed: '+e.message; }
}
function drawWorldPreview(world){
    if(!world || !elements.gameCanvas) return;
    // overlay world tiles onto gameCanvas translucent
    const canvas=elements.gameCanvas; const ctx=canvas.getContext('2d');
    // keep existing game elements, draw tile overlay faint behind
    // simple: re-draw canvas with world tiles faint
    const scaleX=canvas.width / ((world.size_tiles?.[0]||80)*32);
    const scaleY=canvas.height / ((world.size_tiles?.[1]||24)*32);
    // draw world tiles faint
    const chunks=world.tilemap?.chunks||{};
    ctx.save(); ctx.globalAlpha=0.35;
    Object.values(chunks).forEach(ch=>{
        const [cx,cy]=ch.coord;
        ch.tiles.forEach((row,ly)=>{
            row.forEach((td,lx)=>{
                if(td.type===0) return;
                const tx=cx*16+lx, ty=cy*16+ly;
                const x=tx*32*scaleX, y=ty*32*scaleY;
                const colors={1:'#5a6e5a',2:'#4eb44e',3:'#6e6e82',4:'#c83232'};
                ctx.fillStyle=colors[td.type]||'#888';
                ctx.fillRect(x,y,32*scaleX,32*scaleY);
            });
        });
    });
    ctx.restore();
}
function addChatMsg(role, text){
    const wrap=document.getElementById('chatMessages'); if(!wrap) return;
    const bubble=document.createElement('div');
    bubble.style.cssText = role==='user' ? 'align-self:flex-end; background:#0d6efd; color:#fff; border-radius:18px 18px 4px 18px; padding:8px 12px; font-size:13px; max-width:82%;' : 'align-self:flex-start; background:#fff; border:1px solid #e9ecef; border-radius:18px 18px 18px 4px; padding:8px 12px; font-size:13px; max-width:82%;';
    bubble.textContent=text;
    wrap.appendChild(bubble);
    wrap.parentElement.scrollTop = wrap.parentElement.scrollHeight;
}
function showPreviewGenerating(text){
    if(!elements.visualizationOverlay) return;
    elements.visualizationOverlay.classList.remove('hidden');
    elements.visualizationOverlay.style.display='flex';
    elements.visualizationOverlay.innerHTML=`<div class="overlay-icon" style="font-size:28px; animation: pulse 1s infinite;">⏳</div><div class="overlay-text" style="font-size:13px; text-align:center; line-height:1.4;">${text}</div>`;
}
function hidePreview(){
    if(elements.visualizationOverlay) { elements.visualizationOverlay.classList.add('hidden'); elements.visualizationOverlay.style.display='none'; }
}
async function sendChat(){
    const inp=document.getElementById('chatPrompt'); if(!inp) return;
    const prompt=(inp.value||'').trim(); if(!prompt) return;
    addChatMsg('user', prompt);
    if(elements.projectNameInput) elements.projectNameInput.value = prompt.slice(0,60);
    inp.value='';
    // tell first where game is + show generating real on preview panel
    addChatMsg('bot','Tell first: game will appear on the right PREVIEW panel. Showing generating…');
    showPreviewGenerating('Generating REAL game & Genie world…<br><small>ProjectGen: video frames @ 10fps + AI motion + world 160×40</small>');
    if(elements.gameTitle) elements.gameTitle.textContent='Generating…';
    const isFakeReal = document.getElementById('fakeRealToggle')?.checked;
    if(isFakeReal) addChatMsg('bot','Fake-Real mode: instant demo (looks real, labeled DEMO)…');
    let attempts=0, made=false, lastErr='';
    while(attempts<5 && !made){
        attempts++;
        try{
            if(attempts>1){ addChatMsg('bot',`Retry ${attempts}/5…`); showPreviewGenerating(`Retrying… attempt ${attempts}/5<br><small>${lastErr||'retrying generation'}</small>`); }
            const r=await fetch('/api/projects/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({project_name: prompt.slice(0,60), duration: parseFloat(elements.durationInput?.value||5), fake_real: isFakeReal})});
            const d=await r.json();
            if(d.project && d.project.project_id){
                const gr=await fetch(`/api/projects/${d.project.project_id}`); const gj=await gr.json();
                if(gj.game_design && gj.game_design.levels?.[0]?.elements?.length>=4){
                    addChatMsg('bot', `Made! REAL • ${d.project.project_name} • ${d.project.game_genre} • ${d.project.video_meta.frames_processed} frames (attempt ${attempts})`);
                    gameMakerState.currentGame = gj.game_design; gameMakerState.currentProjectId = d.project.project_id;
                    updateGameInfo(); drawGamePreview(); loadWorldPreview(); refreshProjects();
                    hidePreview();
                    showPreviewGenerating('Finalizing preview…'); setTimeout(hidePreview, 600);
                    made=true; break;
                } else {
                    lastErr='not playable (elements<4)'; addChatMsg('bot',`Attempt ${attempts} made but not playable, retrying…`); showPreviewGenerating(lastErr);
                }
            } else {
                lastErr=d.error||'no project'; addChatMsg('bot',`Attempt ${attempts} failed: ${lastErr}, retrying…`); showPreviewGenerating(`Failed: ${lastErr}`);
            }
        }catch(e){ lastErr=e.message; addChatMsg('bot','Error, retrying… '+e.message); showPreviewGenerating(`Error: ${e.message}`); }
        await new Promise(r=>setTimeout(r,700));
    }
    if(!made){
        addChatMsg('bot','Tell first — why not getting: tried 5 times, no playable game. Check server http://localhost:5000/api/projects — try different prompt.');
        showPreviewGenerating('Failed to make game after 5 tries<br><small>Check console /api/status — try simpler prompt like "platformer forest"</small>');
    } else {
        setTimeout(()=> { addChatMsg('bot','Tell: game IS on the right preview panel → if you still don\'t see, scroll right panel or click 🌍 Genie World.'); hidePreview(); }, 900);
    }
}
function handleChatVideo(e){
    const f=e.target.files?.[0]; if(!f) return;
    addChatMsg('user', `📎 Video attached: ${f.name}`);
    addChatMsg('bot','Uploading video to backend… (token stays server-side)');
    handleVideoUpload({target:{files:[f]}});
    setTimeout(()=> addChatMsg('bot','Video received. Add a prompt and hit Send, or Generate will use the video directly.'), 800);
}
function toggleWorldDebug(){ showToast('World chunk borders toggled (in-game: press D)','info'); }
function closeModal(modalId){ document.getElementById(modalId).classList.remove('active'); }
function showToast(message,type='info'){ const toast=document.createElement('div'); toast.className=`toast ${type}`; const icon=type==='success'?'✅':type==='error'?'❌':'ℹ️'; toast.innerHTML=`<span class="toast-icon">${icon}</span><span class="toast-message">${message}</span>`; elements.toastContainer.appendChild(toast); setTimeout(()=>{ toast.style.animation='slideIn 0.3s ease reverse'; setTimeout(()=>toast.remove(),300); },3000); }
document.addEventListener('DOMContentLoaded', init);
document.addEventListener('DOMContentLoaded', ()=>{ elements.toastContainer.addEventListener('click',e=>{ if(e.target.classList.contains('toast')){ e.target.style.animation='slideIn 0.3s ease reverse'; setTimeout(()=>e.target.remove(),300);} }); });
setInterval(checkSystemStatus,5000); setInterval(checkGenerationStatus,2000);
