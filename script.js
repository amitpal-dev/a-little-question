/**
 * ============================================================================
 * A Little Question ❤️ — Client Application & Proposal Studio
 * Stack: Pure Vanilla JavaScript (Zero external dependencies)
 * Features:
 * - Live Proposal Customizer & Preview Studio
 * - 5 Aesthetic Themes (Rose, Lavender, Peach, Matcha, Midnight)
 * - URL Parameter Engine for Sharing Unique Links
 * - Evasive "No 🙈" Button (Touch, Hover, Keyboard Focus, Boundary Collision Avoidance)
 * - Celebratory "Yes ❤️" Screen with Rising Hearts, Falling 3D Confetti & Replay
 * ============================================================================
 */

// Default Configuration
const DEFAULT_CONFIG = {
  recipientName: "",
  senderName: "",
  question: "Will you be my girlfriend?",
  subtitle: "I've been wanting to ask you something for a while…",
  yesLabel: "Yes ❤️",
  noLabel: "No 🙈",
  successTitle: "YAY! It's a yes! 🎉",
  successMessage: "You've made me the happiest person in the world! ❤️",
  personalMessage: "",
  theme: "rose"
};

// Playful microcopy cycled on the No button as it dodges
const NO_BUTTON_PHRASES = [
  "No 🙈",
  "Are you sure? 🥺",
  "Think again! 😉",
  "Really? 🥺",
  "Nice try! 😜",
  "Wait, what? 🥺",
  "Wrong button! 💖",
  "Click the pink one! ✨",
  "Still no? 🥺",
  "You can't catch me! 🏃💨"
];

// Gen-Z Sarcastic Speech Bubble Messages (Common Pool)
const COMMON_GENZ_MESSAGES = [
  "Wrong button, bestie 😂",
  "After all those hints? 💀",
  "System error: 'No' is unavailable. Select YES to continue 🤖❤️",
  "Be so serious right now... 💀🧢",
  "Bro is really testing my patience fr fr 😭",
  "The math is not mathing rn 🤨",
  "Did your finger slip or are you playing games? 🎮👀",
  "Respectfully, that option has been revoked ✋😌",
  "Not you playing hard to get in 4K 📸💀",
  "Is that your final answer? Ask a friend first 📞😭",
  "My therapist will hear about this rejection 🛋️✍️",
  "You thought you could click that? Cute 💅",
  "Side eye... bombastic side eye 👀😒"
];

// Rare Gen-Z Easter Egg Messages (15% chance to appear, styled with extra sparkles)
const RARE_GENZ_MESSAGES = [
  "404: No button not found 💀",
  "FBI Agent watching through your camera: 'Say YES' 👁️👄👁️",
  "Plot twist: That button was just for decorative aesthetic 💅✨",
  "NASA just called: they detected zero reasons to say No 🚀🔭",
  "My delusion level right now: 📈📈📈",
  "Warning: Clicking No will void your romantic warranty ⚠️💔",
  "Error 609: Rejection algorithm failed successfully 🤖✨"
];

// Confetti palette
const CONFETTI_COLORS = [
  "#FF6B9D",
  "#FFC2D6",
  "#FFD166",
  "#B8A1FF",
  "#7ED6C0",
  "#FF85A2",
  "#FFAAA6"
];

// Floating heart emojis for celebration
const HEART_EMOJIS = ["❤️", "💖", "💕", "💗", "💓", "✨", "🌸", "🌷"];

// Ambient background floating icons per theme
const THEME_BG_ICONS = {
  rose: ["🌸", "✨", "💖", "💕", "🌷", "💗"],
  lavender: ["💜", "✨", "🔮", "🫧", "🦄", "🌸"],
  peach: ["🍑", "✨", "🧡", "🌅", "💫", "🌸"],
  matcha: ["🍵", "🌿", "🌱", "🍃", "✨", "🌸"],
  midnight: ["✨", "🌙", "⭐", "💫", "💖", "🌌"]
};

// Application State
const state = { ...DEFAULT_CONFIG };
let isRecipientMode = false;
let dodgeCount = 0;
let lastMoveTime = 0;
let isSuccessTriggered = false;
let celebrationSpawnInterval = null;
let celebrationStopTimeout = null;
let celebrationCleanupTimeout = null;
let resizeDebounceTimer = null;
let toastTimeout = null;
let lastGenzMessage = "";
let genzPopupTimeout = null;

// Cached DOM Elements
let elements = {};

/**
 * Initialize application on DOM ready
 */
document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  parseUrlParameters();
  populateFormFromState();
  applyStateToUI();
  initNoButtonPosition();
  bindEvents();
});

/**
 * Cache necessary DOM references
 */
function cacheElements() {
  elements = {
    // Proposal elements
    headline: document.getElementById("headline"),
    question: document.getElementById("question"),
    subtitle: document.getElementById("subtitle"),
    playArea: document.getElementById("play-area"),
    yesBtn: document.getElementById("yes-btn"),
    noBtn: document.getElementById("no-btn"),
    proposalScreen: document.getElementById("proposal-screen"),
    successScreen: document.getElementById("success-screen"),
    successTitle: document.getElementById("success-title"),
    successMessage: document.getElementById("success-message"),
    personalMessage: document.getElementById("personal-message"),
    signature: document.getElementById("signature"),
    replayBtn: document.getElementById("replay-btn"),
    celebrationLayer: document.getElementById("celebration-layer"),

    // Gen-Z Popup elements
    genzPopup: document.getElementById("genz-popup"),
    popupText: document.getElementById("popup-text"),
    popupBadge: document.getElementById("popup-badge"),

    // Studio & Customizer elements
    openCustomizerBtn: document.getElementById("open-customizer-btn"),
    customizerBtnText: document.getElementById("customizer-btn-text"),
    closeCustomizerBtn: document.getElementById("close-customizer-btn"),
    modalOverlay: document.getElementById("modal-overlay"),
    customizerDrawer: document.getElementById("customizer-drawer"),
    customizerForm: document.getElementById("customizer-form"),

    // Form inputs
    inputRecipient: document.getElementById("input-recipient"),
    inputSender: document.getElementById("input-sender"),
    inputQuestion: document.getElementById("input-question"),
    inputSubtitle: document.getElementById("input-subtitle"),
    inputPersonal: document.getElementById("input-personal"),
    inputSuccess: document.getElementById("input-success"),
    themeButtons: document.querySelectorAll(".theme-card"),

    // Share elements
    shareLinkInput: document.getElementById("share-link-input"),
    copyLinkBtn: document.getElementById("copy-link-btn"),
    previewLinkBtn: document.getElementById("preview-link-btn"),
    toast: document.getElementById("toast")
  };
}

/**
 * Parse URL query parameters to load personalized proposal (Recipient Mode)
 */
function parseUrlParameters() {
  const params = new URLSearchParams(window.location.search);

  // Check if personalized params exist
  const hasPersonalParams = (
    params.has("to") ||
    params.has("from") ||
    params.has("q") ||
    params.has("sub") ||
    params.has("personal") ||
    params.has("msg") ||
    params.has("theme")
  );

  if (hasPersonalParams) {
    isRecipientMode = true;
    if (params.get("to")) state.recipientName = params.get("to").trim();
    if (params.get("from")) state.senderName = params.get("from").trim();
    if (params.get("q")) state.question = params.get("q").trim();
    if (params.get("sub")) state.subtitle = params.get("sub").trim();
    if (params.get("personal")) state.personalMessage = params.get("personal").trim();
    if (params.get("msg")) state.successMessage = params.get("msg").trim();
    
    const themeVal = params.get("theme");
    if (themeVal && ["rose", "lavender", "peach", "matcha", "midnight"].includes(themeVal.toLowerCase())) {
      state.theme = themeVal.toLowerCase();
    }

    // In recipient mode, top button invites recipient to make their own
    if (elements.customizerBtnText) {
      elements.customizerBtnText.textContent = "Create your own";
    }
  }
}

/**
 * Populate Customizer form inputs with current state
 */
function populateFormFromState() {
  if (elements.inputRecipient) elements.inputRecipient.value = state.recipientName;
  if (elements.inputSender) elements.inputSender.value = state.senderName;
  if (elements.inputQuestion) elements.inputQuestion.value = state.question;
  if (elements.inputSubtitle) elements.inputSubtitle.value = state.subtitle;
  if (elements.inputPersonal) elements.inputPersonal.value = state.personalMessage;
  if (elements.inputSuccess) elements.inputSuccess.value = state.successMessage;

  // Set active theme card
  updateThemeSelectionUI(state.theme);
  updateShareableLink();
}

/**
 * Apply current state to proposal & success cards via textContent
 */
function applyStateToUI() {
  // Apply theme
  document.documentElement.setAttribute("data-theme", state.theme);
  updateAmbientHeartsTheme(state.theme);

  // Headline
  if (elements.headline) {
    elements.headline.textContent = (state.recipientName && state.recipientName.length > 0)
      ? `Hey, ${state.recipientName}!`
      : "Hey, Beautiful!";
  }

  // Question & Subtitle
  if (elements.question) {
    elements.question.textContent = (state.question && state.question.length > 0)
      ? state.question
      : DEFAULT_CONFIG.question;
  }

  if (elements.subtitle) {
    elements.subtitle.textContent = (state.subtitle && state.subtitle.length > 0)
      ? state.subtitle
      : DEFAULT_CONFIG.subtitle;
  }

  // Buttons
  if (elements.yesBtn) elements.yesBtn.textContent = state.yesLabel;
  if (elements.noBtn) elements.noBtn.textContent = state.noLabel;

  // Success Screen
  if (elements.successTitle) elements.successTitle.textContent = state.successTitle;
  if (elements.successMessage) {
    elements.successMessage.textContent = (state.successMessage && state.successMessage.length > 0)
      ? state.successMessage
      : DEFAULT_CONFIG.successMessage;
  }

  // Personal message
  if (elements.personalMessage) {
    if (state.personalMessage && state.personalMessage.length > 0) {
      elements.personalMessage.textContent = `"${state.personalMessage}"`;
      elements.personalMessage.style.display = "block";
    } else {
      elements.personalMessage.textContent = "";
      elements.personalMessage.style.display = "none";
    }
  }

  // Signature
  if (elements.signature) {
    if (state.senderName && state.senderName.length > 0) {
      elements.signature.textContent = `With all my love, ${state.senderName} ❤️`;
      elements.signature.style.display = "block";
    } else {
      elements.signature.textContent = "";
      elements.signature.style.display = "none";
    }
  }
}

/**
 * Update ambient floating background emojis to match current theme
 */
function updateAmbientHeartsTheme(theme) {
  const icons = THEME_BG_ICONS[theme] || THEME_BG_ICONS.rose;
  const heartElements = document.querySelectorAll(".bg-heart");
  heartElements.forEach((el, index) => {
    el.textContent = icons[index % icons.length];
  });
}

/**
 * Set the initial position of the No button next to Yes
 */
function initNoButtonPosition() {
  if (!elements.playArea || !elements.noBtn || !elements.yesBtn) return;

  const areaWidth = elements.playArea.clientWidth;
  const areaHeight = elements.playArea.clientHeight;
  const yesWidth = elements.yesBtn.offsetWidth;
  const yesHeight = elements.yesBtn.offsetHeight;
  const noWidth = elements.noBtn.offsetWidth;
  const gap = 20;

  const totalWidth = yesWidth + gap + noWidth;
  const startLeft = Math.max(12, (areaWidth - totalWidth) / 2);
  const centerY = Math.max(12, (areaHeight - yesHeight) / 2);

  elements.yesBtn.style.position = "absolute";
  elements.yesBtn.style.left = `${Math.round(startLeft)}px`;
  elements.yesBtn.style.top = `${Math.round(centerY)}px`;

  const noLeft = Math.min(areaWidth - noWidth - 12, startLeft + yesWidth + gap);
  elements.noBtn.style.left = `${Math.round(noLeft)}px`;
  elements.noBtn.style.top = `${Math.round(centerY)}px`;
}

/**
 * Register all event handlers
 */
function bindEvents() {
  const { noBtn, yesBtn, replayBtn, openCustomizerBtn, closeCustomizerBtn, modalOverlay, copyLinkBtn } = elements;

  // Customizer Drawer Toggles
  if (openCustomizerBtn) {
    openCustomizerBtn.addEventListener("click", openCustomizer);
  }
  if (closeCustomizerBtn) {
    closeCustomizerBtn.addEventListener("click", closeCustomizer);
  }
  if (modalOverlay) {
    modalOverlay.addEventListener("click", closeCustomizer);
  }

  // Keyboard escape closes customizer
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !elements.customizerDrawer.hidden) {
      closeCustomizer();
    }
  });

  // Live Preview Form Inputs
  const liveInputs = [
    elements.inputRecipient,
    elements.inputSender,
    elements.inputQuestion,
    elements.inputSubtitle,
    elements.inputPersonal,
    elements.inputSuccess
  ];

  liveInputs.forEach((input) => {
    if (input) {
      input.addEventListener("input", handleLiveInput);
    }
  });

  // Theme selection buttons
  elements.themeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const selectedTheme = btn.getAttribute("data-theme-val");
      setTheme(selectedTheme);
    });
  });

  // Copy shareable link
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener("click", copyShareableLink);
  }

  // Desktop hover on No
  if (noBtn) {
    noBtn.addEventListener("mouseenter", () => moveNoButton());
    noBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      moveNoButton();
    }, { passive: false });
    noBtn.addEventListener("focus", () => moveNoButton());
    noBtn.addEventListener("click", (e) => {
      e.preventDefault();
      moveNoButton();
    });
  }

  // Yes click
  if (yesBtn) {
    yesBtn.addEventListener("click", showSuccess);
  }

  // Replay celebration
  if (replayBtn) {
    replayBtn.addEventListener("click", () => startCelebration(true));
  }

  // Responsive resize
  window.addEventListener("resize", handleResize);
  window.addEventListener("orientationchange", handleResize);
}

/**
 * Open Customizer Drawer
 */
function openCustomizer() {
  elements.modalOverlay.hidden = false;
  elements.customizerDrawer.hidden = false;
  if (elements.inputRecipient) {
    elements.inputRecipient.focus();
  }
}

/**
 * Close Customizer Drawer
 */
function closeCustomizer() {
  elements.modalOverlay.hidden = true;
  elements.customizerDrawer.hidden = true;
  if (elements.openCustomizerBtn) {
    elements.openCustomizerBtn.focus();
  }
}

/**
 * Handle input changes in the Customizer with real-time UI updates
 */
function handleLiveInput() {
  state.recipientName = elements.inputRecipient.value.trim();
  state.senderName = elements.inputSender.value.trim();
  state.question = elements.inputQuestion.value.trim() || DEFAULT_CONFIG.question;
  state.subtitle = elements.inputSubtitle.value.trim() || DEFAULT_CONFIG.subtitle;
  state.personalMessage = elements.inputPersonal.value.trim();
  state.successMessage = elements.inputSuccess.value.trim() || DEFAULT_CONFIG.successMessage;

  applyStateToUI();
  updateShareableLink();
}

/**
 * Set theme and update styling
 */
function setTheme(themeName) {
  if (!["rose", "lavender", "peach", "matcha", "midnight"].includes(themeName)) return;
  state.theme = themeName;
  updateThemeSelectionUI(themeName);
  applyStateToUI();
  updateShareableLink();
}

/**
 * Update active state on theme cards
 */
function updateThemeSelectionUI(activeTheme) {
  elements.themeButtons.forEach((btn) => {
    const val = btn.getAttribute("data-theme-val");
    const isActive = val === activeTheme;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-checked", isActive ? "true" : "false");
  });
}

/**
 * Construct and display the shareable URL
 */
function updateShareableLink() {
  const url = new URL(window.location.origin + window.location.pathname);

  if (state.recipientName) url.searchParams.set("to", state.recipientName);
  if (state.senderName) url.searchParams.set("from", state.senderName);
  if (state.question && state.question !== DEFAULT_CONFIG.question) {
    url.searchParams.set("q", state.question);
  }
  if (state.subtitle && state.subtitle !== DEFAULT_CONFIG.subtitle) {
    url.searchParams.set("sub", state.subtitle);
  }
  if (state.personalMessage) {
    url.searchParams.set("personal", state.personalMessage);
  }
  if (state.successMessage && state.successMessage !== DEFAULT_CONFIG.successMessage) {
    url.searchParams.set("msg", state.successMessage);
  }
  if (state.theme && state.theme !== "rose") {
    url.searchParams.set("theme", state.theme);
  }

  const generatedUrl = url.toString();
  if (elements.shareLinkInput) elements.shareLinkInput.value = generatedUrl;
  if (elements.previewLinkBtn) elements.previewLinkBtn.href = generatedUrl;
}

/**
 * Copy shareable link to clipboard and display toast feedback
 */
function copyShareableLink() {
  updateShareableLink();
  const url = elements.shareLinkInput.value;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url)
      .then(() => showToast("Link copied to clipboard! Ready to share ❤️"))
      .catch(() => fallbackCopy(url));
  } else {
    fallbackCopy(url);
  }
}

/**
 * Fallback clipboard copy using input selection
 */
function fallbackCopy(text) {
  elements.shareLinkInput.select();
  try {
    document.execCommand("copy");
    showToast("Link copied to clipboard! Ready to share ❤️");
  } catch (err) {
    showToast("Please copy the link directly from the box!");
  }
}

/**
 * Display toast notification
 */
function showToast(message) {
  const { toast } = elements;
  if (!toast) return;

  toast.textContent = message;
  toast.hidden = false;

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.hidden = true;
  }, 3200);
}

/**
 * Select a random Gen-Z message without repeating consecutively.
 * Has a 15% probability of rolling a rare Easter egg message.
 */
function getRandomGenZMessage() {
  const isRare = Math.random() < 0.15;
  const pool = isRare ? RARE_GENZ_MESSAGES : COMMON_GENZ_MESSAGES;

  // Filter out the last message to avoid consecutive duplicates
  const available = pool.filter(msg => msg !== lastGenzMessage);
  const selected = available[Math.floor(Math.random() * available.length)] || pool[0];
  lastGenzMessage = selected;

  return { text: selected, isRare };
}

/**
 * Show Gen-Z Sarcastic Speech Bubble Popup with bounce animation
 */
function showGenZPopup() {
  if (isSuccessTriggered || !elements.genzPopup || !elements.popupText) return;

  const { text, isRare } = getRandomGenZMessage();
  elements.popupText.textContent = text;

  // Apply rare badge and styling if rolled
  if (isRare) {
    elements.genzPopup.classList.add("is-rare");
    if (elements.popupBadge) elements.popupBadge.hidden = false;
  } else {
    elements.genzPopup.classList.remove("is-rare");
    if (elements.popupBadge) elements.popupBadge.hidden = true;
  }

  // Display popup using is-visible class
  elements.genzPopup.classList.add("is-visible");

  // Re-trigger bounce animation cleanly
  elements.genzPopup.style.animation = "none";
  void elements.genzPopup.offsetWidth; // Force reflow
  elements.genzPopup.style.animation = isRare
    ? "rareGlowPop 360ms cubic-bezier(0.175, 0.885, 0.32, 1.35) forwards"
    : "speechPop 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards";

  // Auto-dismiss after 3.2s
  clearTimeout(genzPopupTimeout);
  genzPopupTimeout = setTimeout(() => {
    hideGenZPopup();
  }, 3200);
}

/**
 * Hide Gen-Z Sarcastic Speech Bubble Popup
 */
function hideGenZPopup() {
  if (elements.genzPopup) {
    elements.genzPopup.classList.remove("is-visible");
  }
}

/**
 * Move the No button to a random valid position within #play-area.
 * Enforces boundaries, avoids overlap with #yes-btn, throttles calls, and cycles microcopy.
 */
function moveNoButton() {
  if (isSuccessTriggered) return;

  const now = performance.now();
  if (now - lastMoveTime < 150) {
    return;
  }
  lastMoveTime = now;

  // Trigger Gen-Z Sarcastic Speech Bubble Popup
  showGenZPopup();

  const { playArea, noBtn, yesBtn } = elements;
  if (!playArea || !noBtn || !yesBtn) return;

  dodgeCount++;
  const phraseIndex = dodgeCount % NO_BUTTON_PHRASES.length;
  noBtn.textContent = NO_BUTTON_PHRASES[phraseIndex];

  const yesScale = Math.min(1 + dodgeCount * 0.04, 1.25);
  yesBtn.style.transform = `scale(${yesScale})`;

  const areaWidth = playArea.clientWidth;
  const areaHeight = playArea.clientHeight;
  const btnWidth = noBtn.offsetWidth;
  const btnHeight = noBtn.offsetHeight;

  const padding = 10;
  const minLeft = padding;
  const maxLeft = Math.max(padding, areaWidth - btnWidth - padding);
  const minTop = padding;
  const maxTop = Math.max(padding, areaHeight - btnHeight - padding);

  const yesLeft = yesBtn.offsetLeft;
  const yesTop = yesBtn.offsetTop;
  const buffer = 24;
  const yesBox = {
    left: yesLeft - buffer,
    right: yesLeft + yesBtn.offsetWidth + buffer,
    top: yesTop - buffer,
    bottom: yesTop + yesBtn.offsetHeight + buffer
  };

  const currentLeft = parseFloat(noBtn.style.left) || 0;
  const currentTop = parseFloat(noBtn.style.top) || 0;

  let targetLeft = minLeft;
  let targetTop = minTop;
  let foundValidPosition = false;

  for (let attempt = 0; attempt < 15; attempt++) {
    const candidateLeft = Math.floor(minLeft + Math.random() * (maxLeft - minLeft));
    const candidateTop = Math.floor(minTop + Math.random() * (maxTop - minTop));
    const candidateRight = candidateLeft + btnWidth;
    const candidateBottom = candidateTop + btnHeight;

    const overlapsYes = !(
      candidateRight < yesBox.left ||
      candidateLeft > yesBox.right ||
      candidateBottom < yesBox.top ||
      candidateTop > yesBox.bottom
    );

    if (overlapsYes) continue;

    const distance = Math.hypot(candidateLeft - currentLeft, candidateTop - currentTop);
    if (distance < 40) continue;

    targetLeft = candidateLeft;
    targetTop = candidateTop;
    foundValidPosition = true;
    break;
  }

  if (!foundValidPosition) {
    const corners = [
      { left: minLeft, top: minTop },
      { left: maxLeft, top: minTop },
      { left: minLeft, top: maxTop },
      { left: maxLeft, top: maxTop }
    ];

    let maxDist = -1;
    for (const corner of corners) {
      const cornerRight = corner.left + btnWidth;
      const cornerBottom = corner.top + btnHeight;
      const overlapsYes = !(
        cornerRight < yesBox.left ||
        corner.left > yesBox.right ||
        cornerBottom < yesBox.top ||
        corner.top > yesBox.bottom
      );
      if (!overlapsYes) {
        const dist = Math.hypot(corner.left - currentLeft, corner.top - currentTop);
        if (dist > maxDist) {
          maxDist = dist;
          targetLeft = corner.left;
          targetTop = corner.top;
          foundValidPosition = true;
        }
      }
    }
  }

  noBtn.style.left = `${Math.round(targetLeft)}px`;
  noBtn.style.top = `${Math.round(targetTop)}px`;
}

/**
 * Handle screen resize
 */
function handleResize() {
  clearTimeout(resizeDebounceTimer);
  resizeDebounceTimer = setTimeout(() => {
    if (isSuccessTriggered) return;
    initNoButtonPosition();
  }, 150);
}

/**
 * Handle transition to success screen when Yes is clicked
 */
function showSuccess() {
  if (isSuccessTriggered) return;
  isSuccessTriggered = true;

  // Immediately hide Gen-Z popup when Yes is chosen
  hideGenZPopup();

  const { proposalScreen, successScreen, successTitle } = elements;
  if (!proposalScreen || !successScreen) return;

  proposalScreen.classList.add("fade-out");

  setTimeout(() => {
    proposalScreen.hidden = true;
    successScreen.hidden = false;
    successScreen.classList.add("fade-in");

    if (successTitle) {
      successTitle.focus();
    }

    startCelebration();
  }, 400);
}

/**
 * Start rising hearts and falling confetti celebration
 */
function startCelebration(isReplay = false) {
  const { celebrationLayer } = elements;
  if (!celebrationLayer) return;

  cleanupCelebration();

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  const isMobile = window.innerWidth < 600;
  const maxConfetti = isMobile ? 30 : 60;
  const maxHearts = isMobile ? 12 : 25;

  let spawnedConfetti = 0;
  let spawnedHearts = 0;

  const spawnBatch = () => {
    const fragment = document.createDocumentFragment();

    if (spawnedConfetti < maxConfetti) {
      const batchSize = Math.min(6, maxConfetti - spawnedConfetti);
      for (let i = 0; i < batchSize; i++) {
        const confetti = document.createElement("div");
        confetti.className = "confetti-piece";
        
        const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        const left = Math.random() * 100;
        const width = 8 + Math.random() * 6;
        const height = 10 + Math.random() * 8;
        const duration = 2.8 + Math.random() * 2.2;
        const delay = Math.random() * 0.4;
        const drift = -80 + Math.random() * 160;

        confetti.style.left = `${left}%`;
        confetti.style.setProperty("--c-color", color);
        confetti.style.setProperty("--c-width", `${width}px`);
        confetti.style.setProperty("--c-height", `${height}px`);
        confetti.style.setProperty("--c-duration", `${duration}s`);
        confetti.style.setProperty("--c-drift", `${drift}px`);
        confetti.style.animationDelay = `${delay}s`;

        confetti.addEventListener("animationend", () => confetti.remove());
        fragment.appendChild(confetti);
        spawnedConfetti++;
      }
    }

    if (spawnedHearts < maxHearts) {
      const heartBatchSize = Math.min(3, maxHearts - spawnedHearts);
      for (let i = 0; i < heartBatchSize; i++) {
        const heart = document.createElement("span");
        heart.className = "floating-heart";
        heart.textContent = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];

        const left = 5 + Math.random() * 90;
        const size = 18 + Math.random() * 18;
        const duration = 4.5 + Math.random() * 2.5;
        const delay = Math.random() * 0.5;
        const sway1 = -30 + Math.random() * 60;
        const sway2 = -40 + Math.random() * 80;
        const sway3 = -30 + Math.random() * 60;
        const rot1 = -25 + Math.random() * 50;
        const rot2 = -35 + Math.random() * 70;
        const rot3 = -45 + Math.random() * 90;

        heart.style.left = `${left}%`;
        heart.style.setProperty("--heart-size", `${size}px`);
        heart.style.setProperty("--heart-duration", `${duration}s`);
        heart.style.setProperty("--sway-1", `${sway1}px`);
        heart.style.setProperty("--sway-2", `${sway2}px`);
        heart.style.setProperty("--sway-3", `${sway3}px`);
        heart.style.setProperty("--rot-1", `${rot1}deg`);
        heart.style.setProperty("--rot-2", `${rot2}deg`);
        heart.style.setProperty("--rot-3", `${rot3}deg`);
        heart.style.animationDelay = `${delay}s`;

        heart.addEventListener("animationend", () => heart.remove());
        fragment.appendChild(heart);
        spawnedHearts++;
      }
    }

    celebrationLayer.appendChild(fragment);

    if (spawnedConfetti >= maxConfetti && spawnedHearts >= maxHearts) {
      clearInterval(celebrationSpawnInterval);
      celebrationSpawnInterval = null;
    }
  };

  spawnBatch();
  celebrationSpawnInterval = setInterval(spawnBatch, 600);

  celebrationStopTimeout = setTimeout(() => {
    if (celebrationSpawnInterval) {
      clearInterval(celebrationSpawnInterval);
      celebrationSpawnInterval = null;
    }
  }, 8000);

  celebrationCleanupTimeout = setTimeout(() => {
    cleanupCelebration();
  }, 14000);
}

/**
 * Remove all celebration elements and clear intervals
 */
function cleanupCelebration() {
  if (celebrationSpawnInterval) {
    clearInterval(celebrationSpawnInterval);
    celebrationSpawnInterval = null;
  }
  if (celebrationStopTimeout) {
    clearTimeout(celebrationStopTimeout);
    celebrationStopTimeout = null;
  }
  if (celebrationCleanupTimeout) {
    clearTimeout(celebrationCleanupTimeout);
    celebrationCleanupTimeout = null;
  }
  if (elements.celebrationLayer) {
    elements.celebrationLayer.replaceChildren();
  }
}
