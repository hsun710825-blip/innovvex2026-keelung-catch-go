/**
 * InnoVEX 2026 智匯基隆 Catch & Go — AR 互動導覽版
 * 三引擎解鎖：URL QR 參數 | GPS 圍欄 | AR 鏡頭掃描 vendor_1~9
 */

/* -------------------------------------------------------------------------- */
/* 常數                                                                        */
/* -------------------------------------------------------------------------- */

const STORAGE_KEY = 'innoVEX2026_catch_go_state';
const PROXIMITY_METERS = 5;
const TOTAL_VENDORS = 9;
/** 全站唯一相框素材：assets/frame.png */
const FRAME_IMAGE_PATH = './assets/frame.png';

const VOTE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxhjRRNxXDqxBUET2yFe-B-R11n-npFkS3XFhHBxt2bBuwlClJwG2i4AbCOkDnXSd10/exec';

/** 正式 9 家業者資料庫 */
const VENDORS = [
  {
    id: 1,
    name: '杭特電子',
    topic: 'AI 防詐與 Edge AI 應用',
    question: 'AI 防詐也能超前部署！Edge AI 系統能針對哪種機器服務區進行異常即時告警？',
    type: 'text',
    answers: ['atm'],
    hint: '大家領現金都會去的地方',
    lat: 25.056204,
    lng: 121.6147068,
    banner: './assets/vendor_1.jpg',
    themeColor: '#1A3E95',
  },
  {
    id: 2,
    name: '茁思科技',
    topic: 'LINE 智慧人資管理',
    question: 'AI 小助手讓 HR 不再忙翻天！結合哪款通訊軟體，實現一鍵智慧打卡？',
    type: 'text',
    answers: ['line'],
    hint: null,
    lat: 25.0564938,
    lng: 121.6147937,
    banner: './assets/vendor_2.jpg',
    themeColor: '#008D36',
  },
  {
    id: 3,
    name: '順易利',
    topic: 'AI 自動化智慧品檢',
    question: 'AI 品檢速度比人眼更快！智慧檢測系統主要用於檢測哪種日常防護用品？',
    type: 'text',
    answers: ['口罩'],
    hint: null,
    lat: 25.0564446,
    lng: 121.6148228,
    banner: './assets/vendor_3.jpg',
    themeColor: '#D20A11',
  },
  {
    id: 4,
    name: '台續',
    topic: '無人機研發與教學應用',
    question: '未來科技飛向天空！展示的研發教學模組，是哪種無人載具技術？',
    type: 'text',
    answers: ['無人機'],
    hint: null,
    lat: 25.056213,
    lng: 121.6147,
    banner: './assets/vendor_4.jpg',
    themeColor: '#FFC608',
  },
  {
    id: 5,
    name: '智慧光',
    topic: '數位識別創新技術',
    question: '顛覆傳統顯示應用！帶來哪種創新的數位身分識別產品？',
    type: 'text',
    answers: ['數位識別證'],
    hint: null,
    lat: 25.056208,
    lng: 121.6147055,
    banner: './assets/vendor_5.jpg',
    themeColor: '#1A3E95',
  },
  {
    id: 6,
    name: '蔡技企業',
    topic: '大型精密機械設備',
    question: '展場最吸睛巨型設備！展現基隆在哪項硬體領域的實力？(選項：A. 精密機械 B. 紡織技術 C. 食品加工)',
    type: 'mcq',
    answers: ['a', '精密機械'],
    hint: null,
    lat: 25.0564431,
    lng: 121.6148282,
    banner: './assets/vendor_6.jpg',
    themeColor: '#008D36',
  },
  {
    id: 7,
    name: '佳音醫療',
    topic: '智慧睡眠醫療科技',
    question: '打呼也能科技解決！利用負壓技術穩定口腔中的哪個部位？',
    type: 'text',
    answers: ['舌頭'],
    hint: '品嚐美食必備器官',
    lat: 25.0562083,
    lng: 121.6147095,
    banner: './assets/vendor_7.jpg',
    themeColor: '#D20A11',
  },
  {
    id: 8,
    name: '和平島地質公園',
    topic: '永續零浪費島晝體驗',
    question: '旅遊也很永續！推出哪項從日落到日出的零浪費特色遊程？',
    type: 'text',
    answers: ['島晝會'],
    hint: '三個字，有島也有晝',
    lat: 25.0562138,
    lng: 121.6146991,
    banner: './assets/vendor_8.jpg',
    themeColor: '#FFC608',
  },
  {
    id: 9,
    name: '森田生技',
    topic: '海洋循環與全魚利用',
    question: '讓海洋資源永續循環！推動全魚利用，實踐哪種海洋資源循環概念？',
    type: 'text',
    answers: ['魚', '全魚利用'],
    hint: null,
    lat: 25.0562129,
    lng: 121.6147031,
    banner: './assets/vendor_9.jpg',
    themeColor: '#1A3E95',
  },
];

/* -------------------------------------------------------------------------- */
/* 狀態管理                                                                    */
/* -------------------------------------------------------------------------- */

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return {
      completedIds: Array.isArray(parsed.completedIds)
        ? parsed.completedIds.filter((id) => id >= 1 && id <= TOTAL_VENDORS)
        : [],
      votingDone: Boolean(parsed.votingDone),
      votePayload: parsed.votePayload ?? null,
      allQuizDone: Boolean(parsed.allQuizDone),
    };
  } catch {
    return defaultState();
  }
}

function defaultState() {
  return { completedIds: [], votingDone: false, votePayload: null, allQuizDone: false };
}

function saveState(s) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

let state = loadState();
let currentVendor = null;
let geoWatchId = null;
let html5QrCode = null;
let facingMode = 'environment';
let enginesLocked = false;
let geoPaused = false;
let frameImage = null;
let frameImageReady = false;

const geoTriggeredThisSession = new Set();
const arTriggeredThisSession = new Set();

/* -------------------------------------------------------------------------- */
/* DOM                                                                         */
/* -------------------------------------------------------------------------- */

const screens = {
  home: document.getElementById('screen-home'),
  success: document.getElementById('screen-success'),
  voting: document.getElementById('screen-voting'),
  bonus: document.getElementById('screen-bonus'),
};

const vendorGrid = document.getElementById('vendor-grid');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const vendorBg = document.getElementById('vendor-bg');
const geoStatus = document.getElementById('geo-status');
const arStatus = document.getElementById('ar-status');
const arFallback = document.getElementById('ar-fallback');
const cameraControls = document.getElementById('camera-controls');

const quizModal = document.getElementById('quiz-modal');
const quizVendorName = document.getElementById('quiz-vendor-name');
const quizVendorTopic = document.getElementById('quiz-vendor-topic');
const quizQuestion = document.getElementById('quiz-question');
const quizTextArea = document.getElementById('quiz-text-area');
const quizMcqArea = document.getElementById('quiz-mcq-area');
const quizAnswerInput = document.getElementById('quiz-answer-input');
const quizFeedback = document.getElementById('quiz-feedback');
const hintToast = document.getElementById('hint-toast');
const hintText = document.getElementById('hint-text');

const photoModal = document.getElementById('photo-modal');
const photoPreview = document.getElementById('photo-preview');
const btnDownloadPhoto = document.getElementById('btn-download-photo');

const debugPanel = document.getElementById('debug-panel');
const debugToggle = document.getElementById('debug-toggle');
const debugBody = document.getElementById('debug-body');
const debugButtons = document.getElementById('debug-buttons');

const votingForm = document.getElementById('voting-form');
const votingCheckboxes = document.getElementById('voting-checkboxes');
const voteError = document.getElementById('vote-error');

/* -------------------------------------------------------------------------- */
/* Haversine 距離（公尺）                                                      */
/* -------------------------------------------------------------------------- */

const EARTH_RADIUS_M = 6371000;

function haversineDistanceMeters(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* -------------------------------------------------------------------------- */
/* 三引擎：暫停 / 恢復 / URL 清除                                              */
/* -------------------------------------------------------------------------- */

/** 題目 Modal 開啟時鎖定三引擎，關閉後恢復（掃描暫停但保留視訊畫面） */
function pauseEngines() {
  enginesLocked = true;
  geoPaused = true;
  try {
    if (html5QrCode?.isScanning) html5QrCode.pause(false);
  } catch {
    /* 掃描器尚未就緒 */
  }
}

function resumeEngines() {
  enginesLocked = false;
  geoPaused = false;
  try {
    if (html5QrCode?.isScanning) html5QrCode.resume();
  } catch {
    /* 掃描器尚未就緒 */
  }
}

/** 清除 URL 參數，避免重新整理重複觸發引擎 A */
function clearUrlParams() {
  const url = new URL(window.location.href);
  url.searchParams.delete('vendor');
  url.searchParams.delete('id');
  const clean = url.pathname + (url.search ? url.search : '') + url.hash;
  window.history.replaceState({}, '', clean);
}

/** 引擎 A：解析 ?vendor=1 或 ?id=1 */
function parseUrlVendorParam() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('vendor') ?? params.get('id');
  const id = parseInt(raw, 10);
  return id >= 1 && id <= TOTAL_VENDORS ? id : null;
}

/** 從 QR 解碼文字解析廠商 ID（引擎 A URL + 引擎 C vendor_N） */
function parseVendorFromQrText(text) {
  if (!text) return null;

  const trimmed = text.trim();

  // 引擎 C：純文字 vendor_1 ~ vendor_9
  const tagMatch = trimmed.match(/^vendor_([1-9])$/i);
  if (tagMatch) return Number(tagMatch[1]);

  // 引擎 A：QR 內含完整網址含參數
  try {
    const url = new URL(trimmed);
    const raw = url.searchParams.get('vendor') ?? url.searchParams.get('id');
    const id = parseInt(raw, 10);
    if (id >= 1 && id <= TOTAL_VENDORS) return id;
  } catch {
    /* 非 URL 格式 */
  }

  return null;
}

/**
 * 統一觸發答題（三引擎 + Debug + 手動）
 * @param {number} vendorId
 * @param {'url'|'geo'|'ar'|'manual'|'debug'} source
 */
function triggerVendor(vendorId, source) {
  if (enginesLocked || quizModal.open) return;

  const vendor = getVendorById(vendorId);
  if (!vendor) return;

  if (isVendorCompleted(vendorId) && source !== 'manual') return;

  if (source === 'geo') geoTriggeredThisSession.add(vendorId);
  if (source === 'ar') arTriggeredThisSession.add(vendorId);

  clearUrlParams();
  pauseEngines();
  openQuiz(vendorId, source);
}

/* -------------------------------------------------------------------------- */
/* AR 視訊 + 引擎 C（html5-qrcode）                                            */
/* -------------------------------------------------------------------------- */

function getQrScanConfig() {
  return {
    fps: 10,
    qrbox: (viewWidth, viewHeight) => ({
      width: Math.floor(viewWidth * 0.88),
      height: Math.floor(viewHeight * 0.55),
    }),
    aspectRatio: 1.0,
  };
}

function onQrScanSuccess(decodedText) {
  if (enginesLocked || quizModal.open) return;

  const vendorId = parseVendorFromQrText(decodedText);
  if (!vendorId) return;
  if (arTriggeredThisSession.has(vendorId)) return;

  triggerVendor(vendorId, 'ar');
}

function onQrScanFailure() {
  /* 掃描中常態性失敗，忽略即可 */
}

async function startArCamera() {
  if (!window.Html5Qrcode) {
    arStatus.textContent = 'AR：html5-qrcode 載入失敗';
    arFallback.hidden = false;
    return;
  }

  html5QrCode = new Html5Qrcode('ar-scanner');

  try {
    await html5QrCode.start(
      { facingMode },
      getQrScanConfig(),
      onQrScanSuccess,
      onQrScanFailure,
    );
    arFallback.hidden = true;
    arStatus.textContent = `AR：${facingMode === 'environment' ? '後置' : '前置'}鏡頭運行中`;
  } catch (err) {
    arStatus.textContent = `AR 錯誤：${err.message || err}`;
    arFallback.hidden = false;
  }
}

async function flipCamera() {
  if (!html5QrCode || enginesLocked || quizModal.open) return;

  facingMode = facingMode === 'environment' ? 'user' : 'environment';

  try {
    if (html5QrCode.isScanning) {
      await html5QrCode.stop();
    }
    await startArCamera();
  } catch (err) {
    arStatus.textContent = `翻轉失敗：${err.message || err}`;
  }
}

function getArVideoElement() {
  return document.querySelector('#ar-scanner video');
}

/* -------------------------------------------------------------------------- */
/* 拍照 + 相框合成（固定使用 assets/frame.png）                               */
/* -------------------------------------------------------------------------- */

/** 載入並快取唯一相框圖 */
function loadFrameImage() {
  return new Promise((resolve, reject) => {
    if (frameImageReady && frameImage?.complete && frameImage.naturalWidth > 0) {
      resolve(frameImage);
      return;
    }

    frameImage = new Image();
    frameImage.onload = () => {
      frameImageReady = true;
      resolve(frameImage);
    };
    frameImage.onerror = () => {
      frameImageReady = false;
      reject(new Error('無法載入相框 assets/frame.png'));
    };
    frameImage.src = FRAME_IMAGE_PATH;
  });
}

function preloadFrameImage() {
  loadFrameImage().catch(() => {
    /* 初始化預載失敗時，快門再重試 */
  });
}

async function capturePhotoWithFrame() {
  const video = getArVideoElement();
  if (!video || video.readyState < 2) {
    alert('相機尚未就緒，請稍後再試');
    return;
  }

  let frame;
  try {
    frame = await loadFrameImage();
  } catch {
    alert('相框載入失敗，請確認 assets/frame.png 存在');
    return;
  }

  const w = video.videoWidth;
  const h = video.videoHeight;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(video, 0, 0, w, h);
  ctx.drawImage(frame, 0, 0, w, h);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  photoPreview.src = dataUrl;
  btnDownloadPhoto.href = dataUrl;
  photoModal.showModal();
}

/* -------------------------------------------------------------------------- */
/* 畫面切換                                                                    */
/* -------------------------------------------------------------------------- */

function showScreen(name) {
  Object.entries(screens).forEach(([key, el]) => {
    const active = key === name;
    el.classList.toggle('screen--active', active);
    el.hidden = !active;
  });
  clearVendorBackground();
  cameraControls.classList.toggle('is-hidden', name !== 'home');
}

function resolveInitialScreen() {
  if (state.votingDone) {
    showScreen('bonus');
    return;
  }
  if (state.allQuizDone || state.completedIds.length >= TOTAL_VENDORS) {
    state.allQuizDone = true;
    saveState(state);
    showScreen('success');
    return;
  }
  showScreen('home');
}

/* -------------------------------------------------------------------------- */
/* 廠商背景                                                                    */
/* -------------------------------------------------------------------------- */

function applyVendorBackground(vendor) {
  const img = new Image();
  img.onload = () => {
    vendorBg.style.backgroundImage = `url("${vendor.banner}")`;
    vendorBg.classList.add('is-active');
  };
  img.onerror = () => {
    vendorBg.style.background = `linear-gradient(160deg, ${vendor.themeColor}88, transparent)`;
    vendorBg.classList.add('is-active');
  };
  img.src = vendor.banner;
}

function clearVendorBackground() {
  vendorBg.classList.remove('is-active');
  vendorBg.style.backgroundImage = '';
  vendorBg.style.background = '';
}

/* -------------------------------------------------------------------------- */
/* 首頁網格                                                                    */
/* -------------------------------------------------------------------------- */

function isVendorCompleted(vendorId) {
  return state.completedIds.includes(vendorId);
}

function markVendorCompleted(vendorId) {
  if (!state.completedIds.includes(vendorId)) {
    state.completedIds.push(vendorId);
    state.completedIds.sort((a, b) => a - b);
    saveState(state);
  }
}

function renderVendorGrid() {
  vendorGrid.innerHTML = '';
  VENDORS.forEach((vendor) => {
    const done = isVendorCompleted(vendor.id);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `vendor-btn ${done ? 'vendor-btn--done' : 'vendor-btn--locked'}`;
    btn.dataset.vendorId = String(vendor.id);
    btn.innerHTML = `
      <span class="vendor-btn__num">${vendor.id}</span>
      <span class="vendor-btn__icon"><i class="fa-solid ${done ? 'fa-circle-check' : 'fa-lock'}"></i></span>
      <span class="vendor-btn__name">${vendor.name}</span>`;
    btn.addEventListener('click', () => triggerVendor(vendor.id, 'manual'));
    vendorGrid.appendChild(btn);
  });
  updateProgress();
}

function updateProgress() {
  const count = state.completedIds.length;
  progressFill.style.width = `${(count / TOTAL_VENDORS) * 100}%`;
  progressText.textContent = `${count}/${TOTAL_VENDORS}`;
}

/* -------------------------------------------------------------------------- */
/* 答題 Modal                                                                  */
/* -------------------------------------------------------------------------- */

function getVendorById(id) {
  return VENDORS.find((v) => v.id === id);
}

function openQuiz(vendorId, source = 'manual') {
  const vendor = getVendorById(vendorId);
  if (!vendor) return;

  if (isVendorCompleted(vendor.id)) {
    if (source === 'manual') flashToastOnGrid(vendor.id, '此關已完成 ✓');
    resumeEngines();
    return;
  }

  currentVendor = vendor;
  quizVendorName.textContent = vendor.name;
  quizVendorTopic.textContent = vendor.topic;
  quizQuestion.textContent = vendor.question;

  quizFeedback.hidden = true;
  quizFeedback.className = 'quiz-feedback';
  hintToast.hidden = true;
  quizAnswerInput.value = '';
  document.querySelectorAll('input[name="mcq"]').forEach((r) => { r.checked = false; });

  const isMcq = vendor.type === 'mcq';
  quizTextArea.hidden = isMcq;
  quizMcqArea.hidden = !isMcq;
  document.getElementById('btn-hint').style.display = vendor.hint ? 'inline-flex' : 'none';

  applyVendorBackground(vendor);
  quizModal.showModal();
}

function closeQuiz() {
  quizModal.close();
  currentVendor = null;
  clearVendorBackground();
  resumeEngines();
}

function normalizeAnswer(str) {
  return str.trim().toLowerCase().replace(/\s+/g, '');
}

function checkAnswer(vendor, rawInput) {
  return vendor.answers.some((ans) => normalizeAnswer(ans) === normalizeAnswer(rawInput));
}

function submitAnswer() {
  if (!currentVendor) return;

  let userAnswer = '';
  if (currentVendor.type === 'mcq') {
    const selected = document.querySelector('input[name="mcq"]:checked');
    if (!selected) {
      showQuizFeedback('請選擇一個選項', false);
      return;
    }
    userAnswer = selected.value;
  } else {
    userAnswer = quizAnswerInput.value;
    if (!userAnswer.trim()) {
      showQuizFeedback('請輸入答案', false);
      return;
    }
  }

  if (checkAnswer(currentVendor, userAnswer)) {
    showQuizFeedback('答對了！🎉', true);
    markVendorCompleted(currentVendor.id);
    renderVendorGrid();
    setTimeout(() => {
      closeQuiz();
      if (state.completedIds.length >= TOTAL_VENDORS) {
        state.allQuizDone = true;
        saveState(state);
        showScreen('success');
      }
    }, 1200);
  } else {
    showQuizFeedback('答案不正確，請再試一次', false);
  }
}

function showQuizFeedback(message, isCorrect) {
  quizFeedback.hidden = false;
  quizFeedback.textContent = message;
  quizFeedback.className = `quiz-feedback ${isCorrect ? 'is-correct' : 'is-wrong'}`;
}

function showHint() {
  if (!currentVendor?.hint) return;
  hintText.textContent = currentVendor.hint;
  hintToast.hidden = false;
}

function flashToastOnGrid(vendorId, msg) {
  const btn = vendorGrid.querySelector(`[data-vendor-id="${vendorId}"]`);
  if (!btn) return;
  const el = document.createElement('span');
  el.className = 'vendor-flash';
  el.textContent = msg;
  el.style.cssText =
    'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,141,54,0.88);color:#fff;font-size:0.68rem;border-radius:0.75rem;padding:4px;';
  btn.style.position = 'relative';
  btn.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

/* -------------------------------------------------------------------------- */
/* 引擎 B：GPS                                                                 */
/* -------------------------------------------------------------------------- */

function findNearestVendorInRange(lat, lng) {
  let nearest = null;
  let minDist = Infinity;

  VENDORS.forEach((vendor) => {
    if (isVendorCompleted(vendor.id)) return;
    const dist = haversineDistanceMeters(lat, lng, vendor.lat, vendor.lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = { vendor, dist };
    }
  });

  return nearest && nearest.dist <= PROXIMITY_METERS ? nearest.vendor : null;
}

function onPositionUpdate(position) {
  if (geoPaused || enginesLocked || quizModal.open) return;

  const { latitude, longitude, accuracy } = position.coords;
  geoStatus.textContent = `GPS：${latitude.toFixed(5)}, ${longitude.toFixed(5)} (±${Math.round(accuracy)}m)`;

  const vendor = findNearestVendorInRange(latitude, longitude);
  if (!vendor || geoTriggeredThisSession.has(vendor.id)) return;

  triggerVendor(vendor.id, 'geo');
}

function onPositionError(err) {
  const messages = { 1: '拒絕定位', 2: '無法取得位置', 3: '定位逾時' };
  geoStatus.textContent = `GPS 錯誤：${messages[err.code] || err.message}`;
}

function startGeolocationWatch() {
  if (!navigator.geolocation) {
    geoStatus.textContent = '不支援 Geolocation';
    return;
  }
  geoWatchId = navigator.geolocation.watchPosition(onPositionUpdate, onPositionError, {
    enableHighAccuracy: true,
    maximumAge: 3000,
    timeout: 15000,
  });
}

/* -------------------------------------------------------------------------- */
/* Debug 面板                                                                  */
/* -------------------------------------------------------------------------- */

function buildDebugPanel() {
  VENDORS.forEach((vendor) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = `${vendor.id}. ${vendor.name.slice(0, 4)}`;
    btn.title = vendor.name;
    btn.addEventListener('click', () => {
      geoTriggeredThisSession.delete(vendor.id);
      arTriggeredThisSession.delete(vendor.id);
      triggerVendor(vendor.id, 'debug');
    });
    debugButtons.appendChild(btn);
  });
}

debugToggle.addEventListener('click', () => {
  const open = debugBody.hidden;
  debugBody.hidden = !open;
  debugPanel.classList.toggle('is-open', open);
  debugToggle.setAttribute('aria-expanded', String(open));
});

/* -------------------------------------------------------------------------- */
/* 票選 → Google 試算表                                                        */
/* -------------------------------------------------------------------------- */

function renderVotingForm() {
  votingCheckboxes.innerHTML = '';
  VENDORS.forEach((vendor) => {
    const label = document.createElement('label');
    label.className = 'vote-option';
    label.innerHTML = `
      <input type="checkbox" name="vote" value="${vendor.id}" />
      <span>${vendor.id}. ${vendor.name}｜${vendor.topic}</span>`;
    votingCheckboxes.appendChild(label);
  });
}

async function submitVoteToSheet(payload) {
  const response = await fetch(VOTE_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...payload, userAgent: navigator.userAgent }),
  });
  const text = await response.text();
  try {
    const data = JSON.parse(text);
    if (data.ok) return data;
    throw new Error(data.error || '寫入失敗');
  } catch (parseErr) {
    if (text.includes('"ok":true') || text.includes('"ok": true')) return { ok: true };
    if (parseErr instanceof SyntaxError) throw new Error('伺服器回應格式異常');
    throw parseErr;
  }
}

votingForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  voteError.hidden = true;

  const selected = [...votingCheckboxes.querySelectorAll('input[name="vote"]:checked')].map(
    (el) => Number(el.value),
  );
  const other = document.getElementById('vote-other').value.trim();

  if (selected.length < 1 || selected.length > 3) {
    voteError.hidden = false;
    voteError.textContent = '請勾選 1 至 3 項廠商';
    return;
  }

  const payload = { selectedVendorIds: selected, other, submittedAt: new Date().toISOString() };
  const submitBtn = votingForm.querySelector('button[type="submit"]');
  const prevLabel = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = '送出中…';

  try {
    await submitVoteToSheet(payload);
    state.votingDone = true;
    state.votePayload = payload;
    saveState(state);
    showScreen('bonus');
  } catch (err) {
    voteError.hidden = false;
    voteError.textContent = err.message?.includes('fetch')
      ? '網路連線失敗，請確認網路後再試'
      : `送出失敗：${err.message || '請稍後再試'}`;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = prevLabel;
  }
});

votingCheckboxes.addEventListener('change', () => {
  const count = votingCheckboxes.querySelectorAll('input[name="vote"]:checked').length;
  if (count > 3) {
    voteError.hidden = false;
    voteError.textContent = '最多只能選擇 3 項';
    const last = votingCheckboxes.querySelector('input[name="vote"]:checked:last-of-type');
    if (last) last.checked = false;
  } else {
    voteError.hidden = true;
  }
});

/* -------------------------------------------------------------------------- */
/* 事件綁定                                                                    */
/* -------------------------------------------------------------------------- */

document.getElementById('btn-continue-explore').addEventListener('click', () => showScreen('voting'));
document.getElementById('btn-back-home').addEventListener('click', () => showScreen('home'));
document.getElementById('quiz-close').addEventListener('click', closeQuiz);
document.getElementById('btn-submit-answer').addEventListener('click', submitAnswer);
document.getElementById('btn-hint').addEventListener('click', showHint);
document.getElementById('hint-close').addEventListener('click', () => { hintToast.hidden = true; });
document.getElementById('btn-flip-camera').addEventListener('click', flipCamera);
document.getElementById('btn-shutter').addEventListener('click', capturePhotoWithFrame);
document.getElementById('photo-close').addEventListener('click', () => photoModal.close());

quizAnswerInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') submitAnswer();
});

quizModal.addEventListener('cancel', (e) => { e.preventDefault(); closeQuiz(); });
quizModal.addEventListener('click', (e) => { if (e.target === quizModal) closeQuiz(); });
photoModal.addEventListener('click', (e) => { if (e.target === photoModal) photoModal.close(); });

/* -------------------------------------------------------------------------- */
/* 初始化                                                                      */
/* -------------------------------------------------------------------------- */

async function init() {
  buildDebugPanel();
  renderVendorGrid();
  renderVotingForm();
  resolveInitialScreen();
  preloadFrameImage();
  startGeolocationWatch();

  await startArCamera();

  // 引擎 A：URL 參數自動解鎖
  const urlVendorId = parseUrlVendorParam();
  if (urlVendorId) {
    setTimeout(() => triggerVendor(urlVendorId, 'url'), 600);
  }
}

init();
