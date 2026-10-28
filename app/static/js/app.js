/* ============================================================
   GAME DISCOVER — app.js
   Includes: Library, Rating, Onboarding, Password Toggle,
             Loading Spinner, Confetti
   ============================================================ */

// ── UTILITY: POST request ──────────────────────────────────
async function post(url, data) {
  const opt = { method: "POST" };
  if (data) opt.body = new URLSearchParams(data);
  const res = await fetch(url, opt);
  if (res.status === 401) { window.location.href = "/login"; return null; }
  return res.json();
}

// ── LIBRARY: Add to Library & Star Rating ─────────────────
document.addEventListener("click", async (e) => {
  // Add to Library
  const add = e.target.closest("[data-add]");
  if (add) {
    e.preventDefault();
    e.stopPropagation();
    add.disabled = true;
    const r = await post("/library/add/" + add.dataset.add);
    if (r && r.ok) {
      if (add.classList.contains("hero-add-btn")) {
        add.outerHTML = '<a href="/library" class="btn btn-success btn-lg hero-owned-btn">✓ In Library</a>';
      } else if (add.classList.contains("detail-add-btn")) {
        const actionBox = document.getElementById("libraryActionBox");
        if (actionBox) {
          actionBox.innerHTML = `
            <div class="d-grid gap-2">
              <button class="btn btn-success btn-lg py-3 fw-bold disabled" style="opacity: 0.95;">
                ✓ Sudah Ada di Library
              </button>
              <a href="/library" class="btn btn-outline-light btn-sm py-2">
                Buka My Library &raquo;
              </a>
            </div>
          `;
        }
        const hint = document.getElementById("ratingHint");
        if (hint) hint.remove();
        const posterBadges = document.querySelector(".detail-poster-badges");
        if (posterBadges && !posterBadges.querySelector(".badge-owned")) {
          const badge = document.createElement("span");
          badge.className = "badge text-bg-success badge-owned shadow";
          badge.textContent = "✓ In Library";
          posterBadges.appendChild(badge);
        }
      } else if (add.classList.contains("card-quick-add")) {
        add.outerHTML = '<a href="/library" class="btn btn-sm btn-outline-success py-0 px-2 fs-7" title="Lihat di Library">Owned</a>';
        const card = add.closest(".game-card");
        if (card) {
          const topOverlay = card.querySelector(".card-img-overlay-top");
          if (topOverlay && !topOverlay.querySelector(".badge-owned")) {
            const badge = document.createElement("span");
            badge.className = "badge text-bg-success badge-owned shadow-sm";
            badge.textContent = "✓ In Library";
            topOverlay.appendChild(badge);
          }
        }
      } else {
        add.outerHTML = '<a href="/library" class="btn btn-success btn-lg">✓ In Library</a>';
      }
    } else {
      add.disabled = false;
      alert((r && r.error) || "Gagal menambahkan game.");
    }
    return;
  }

  // Rating bintang
  const star = e.target.closest("[data-rate]");
  if (star) {
    const box = star.closest(".stars");
    const n = parseInt(star.dataset.rate, 10);
    const r = await post("/library/rate/" + box.dataset.game, { rating: n });
    if (r && r.ok) {
      // Shine animation on clicked star
      star.classList.add("shine");
      setTimeout(() => star.classList.remove("shine"), 400);

      box.querySelectorAll(".star").forEach((s) => {
        s.classList.toggle("active", parseInt(s.dataset.rate, 10) <= n);
        s.style.color = "";
      });

      // Update badge overlay if inside library item card
      const libItem = box.closest(".library-item-card");
      if (libItem) {
        libItem.dataset.rated = "true";
        const badgeOverlay = libItem.querySelector(".library-badge-overlay");
        if (badgeOverlay) {
          let badgeHtml = "";
          if (n === 5) badgeHtml = '<span class="lib-rating-pill badge-masterpiece">⭐ Masterpiece</span>';
          else if (n === 4) badgeHtml = '<span class="lib-rating-pill badge-recommended">👍 Recommended</span>';
          else if (n === 3) badgeHtml = '<span class="lib-rating-pill badge-good">👌 Good</span>';
          else badgeHtml = '<span class="lib-rating-pill badge-mediocre">⚠️ Mediocre</span>';
          badgeOverlay.innerHTML = badgeHtml;
        }
      }

      const txt = box.parentElement.querySelector(".rating-text");
      if (txt) {
        txt.textContent = "Rating: " + n + "/5 ★ (Tersimpan!)";
        txt.classList.add("text-success");
        txt.classList.remove("text-warning");
        setTimeout(() => {
          txt.textContent = "Rating: " + n + "/5 ★";
          txt.classList.remove("text-success");
          txt.classList.add("text-warning");
        }, 2000);
      }
    } else {
      alert((r && r.error) || "Gagal menyimpan rating. Pastikan game sudah ada di library kamu!");
    }
  }
});

// ── PASSWORD TOGGLE ────────────────────────────────────────
document.querySelectorAll(".pwd-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.dataset.target;
    const input = document.getElementById(targetId);
    if (!input) return;
    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";
    const eyeShow = btn.querySelector(".eye-show");
    const eyeHide = btn.querySelector(".eye-hide");
    if (eyeShow) eyeShow.style.display = isHidden ? "none" : "";
    if (eyeHide) eyeHide.style.display = isHidden ? "" : "none";
  });
});

// ── LOADING SPINNER on form submit ─────────────────────────
document.querySelectorAll("#loginForm, #registerForm").forEach((form) => {
  form.addEventListener("submit", () => {
    const btn = form.querySelector("[type=submit]");
    if (!btn) return;
    const label  = btn.querySelector(".btn-label");
    const spinner = btn.querySelector(".btn-spinner");
    if (label)  label.classList.add("d-none");
    if (spinner) spinner.classList.remove("d-none");
    btn.disabled = true;
  });
});

// ── ONBOARDING: Genre Tiles ───────────────────────────────
(function () {
  const genreBoxes = document.querySelectorAll('input.genre-check[name="genres"]');
  if (!genreBoxes.length) return;

  const MIN = 3, MAX = 5;
  const CIRCUMFERENCE = 175.93; // 2 * PI * 28

  // Genre → emoji mapping
  const emojiMap = {
    "Action":         "⚔️",
    "Adventure":      "🗺️",
    "RPG":            "🧙",
    "Role-Playing":   "🧙",
    "Strategy":       "🏰",
    "Simulation":     "🔧",
    "Sports":         "⚽",
    "Racing":         "🏎️",
    "Horror":         "👻",
    "Puzzle":         "🧩",
    "Shooter":        "🎯",
    "FPS":            "🔫",
    "Platformer":     "🦘",
    "Indie":          "🎨",
    "Casual":         "🎲",
    "Multiplayer":    "👥",
    "Co-op":          "🤝",
    "Singleplayer":   "🎮",
    "Open World":     "🌍",
    "Survival":       "🏕️",
    "Fighting":       "🥊",
    "Stealth":        "🥷",
    "MOBA":           "🗡️",
    "Card Game":      "🃏",
    "Turn-Based":     "♟️",
    "Sandbox":        "🏗️",
    "Anime":          "✨",
    "Sci-fi":         "🚀",
    "Fantasy":        "🐉",
    "Post-apocalyptic":"☢️",
    "Cyberpunk":      "🤖",
    "Pixel Graphics": "👾",
    "2D":             "📐",
    "3D":             "💠",
    "Top-Down":       "🔭",
    "Tower Defense":  "🗼",
    "Management":     "📊",
    "City Builder":   "🏙️",
    "Music":          "🎵",
    "Education":      "📚",
  };

  // Apply emojis to tiles
  document.querySelectorAll(".genre-emoji").forEach((el) => {
    const genre = el.dataset.genre;
    // Try exact match first
    if (emojiMap[genre]) {
      el.textContent = emojiMap[genre];
    } else {
      // Try partial match
      const key = Object.keys(emojiMap).find(k =>
        genre.toLowerCase().includes(k.toLowerCase()) ||
        k.toLowerCase().includes(genre.toLowerCase())
      );
      if (key) el.textContent = emojiMap[key];
    }
  });

  const counter     = document.getElementById("genre-count");
  const progressRing= document.getElementById("progressRing");
  const statusEl    = document.getElementById("onboardStatus");
  const submitBtn   = document.getElementById("onboardBtn");
  const confettiWrap= document.getElementById("confettiWrap");

  function countChecked() {
    return document.querySelectorAll('input.genre-check:checked').length;
  }

  function updateUI() {
    const n = countChecked();
    if (counter) counter.textContent = n;

    // Progress ring: fill based on fraction of MAX
    if (progressRing) {
      const fraction = Math.min(n / MAX, 1);
      const offset = CIRCUMFERENCE * (1 - fraction);
      progressRing.style.strokeDashoffset = offset;
      // Color shift: muted → blue → green
      if (n >= MIN) {
        progressRing.style.stroke = "var(--success)";
      } else {
        progressRing.style.stroke = "var(--primary)";
      }
    }

    // Status text
    if (statusEl) {
      if (n === 0) {
        statusEl.textContent = "Pilih minimal 3 genre untuk melanjutkan";
        statusEl.className = "onboard-status";
      } else if (n < MIN) {
        statusEl.textContent = `Tambah ${MIN - n} genre lagi`;
        statusEl.className = "onboard-status";
      } else if (n < MAX) {
        statusEl.textContent = `Bagus! Kamu bisa pilih ${MAX - n} lagi`;
        statusEl.className = "onboard-status ready";
      } else {
        statusEl.textContent = "Pilihan sudah penuh (maksimal 5)";
        statusEl.className = "onboard-status ready";
      }
    }

    // Submit button
    if (submitBtn) submitBtn.disabled = n < MIN;
  }

  genreBoxes.forEach((cb) => {
    cb.addEventListener("change", () => {
      const n = countChecked();
      // Enforce max
      if (n > MAX) {
        cb.checked = false;
        const tile = cb.nextElementSibling;
        if (tile) {
          tile.style.animation = "none";
          tile.offsetHeight; // reflow
          tile.style.animation = "shakeX 0.3s ease";
        }
        updateUI();
        return;
      }
      // Bounce animation on the tile
      if (cb.checked) {
        const tile = cb.nextElementSibling;
        if (tile) {
          tile.classList.remove("bouncing");
          void tile.offsetWidth; // reflow trigger
          tile.classList.add("bouncing");
          tile.addEventListener("animationend", () => tile.classList.remove("bouncing"), { once: true });
        }
      }
      updateUI();
    });
  });

  // Form submit: show spinner + confetti
  const onboardForm = document.getElementById("onboardForm");
  if (onboardForm) {
    onboardForm.addEventListener("submit", (e) => {
      if (countChecked() < MIN) { e.preventDefault(); return; }
      // Spinner
      if (submitBtn) {
        const label  = submitBtn.querySelector(".btn-label");
        const spinner = submitBtn.querySelector(".btn-spinner");
        if (label) label.classList.add("d-none");
        if (spinner) spinner.classList.remove("d-none");
      }
      // Confetti
      launchConfetti();
    });
  }

  // Initial UI state
  updateUI();
})();

// ── CONFETTI ───────────────────────────────────────────────
function launchConfetti() {
  const wrap = document.getElementById("confettiWrap");
  if (!wrap) return;
  const colors = ["#4c8dff", "#7c3aed", "#22c55e", "#f59e0b", "#ef4444", "#a78bfa"];
  for (let i = 0; i < 80; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.cssText = `
      left: ${Math.random() * 100}%;
      top: 0;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${1.2 + Math.random() * 1.8}s;
      animation-delay: ${Math.random() * 0.6}s;
      transform: scale(${0.5 + Math.random()});
    `;
    wrap.appendChild(piece);
    piece.addEventListener("animationend", () => piece.remove());
  }
}

// ── HERO CAROUSEL ──────────────────────────────────────────
(function () {
  const carousel = document.getElementById("heroCarousel");
  if (!carousel) return;

  const slides = carousel.querySelectorAll(".hero-slide");
  const indicators = carousel.querySelectorAll(".hero-indicator");
  const prevBtn = document.getElementById("heroPrevBtn");
  const nextBtn = document.getElementById("heroNextBtn");
  if (!slides.length) return;

  let current = 0;
  let timer = null;
  const INTERVAL = 5000;

  function goToSlide(index) {
    slides[current].classList.remove("active");
    if (indicators[current]) indicators[current].classList.remove("active");

    current = (index + slides.length) % slides.length;

    slides[current].classList.add("active");
    if (indicators[current]) indicators[current].classList.add("active");
  }

  function nextSlide() {
    goToSlide(current + 1);
  }

  function prevSlide() {
    goToSlide(current - 1);
  }

  function startTimer() {
    stopTimer();
    timer = setInterval(nextSlide, INTERVAL);
  }

  function stopTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      nextSlide();
      startTimer();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      prevSlide();
      startTimer();
    });
  }

  indicators.forEach((ind, idx) => {
    ind.addEventListener("click", () => {
      goToSlide(idx);
      startTimer();
    });
  });

  // Pause on hover
  carousel.addEventListener("mouseenter", stopTimer);
  carousel.addEventListener("mouseleave", startTimer);

  // Keyboard navigation when carousel is hovered
  document.addEventListener("keydown", (e) => {
    if (!carousel.matches(":hover")) return;
    if (e.key === "ArrowLeft") {
      prevSlide();
      startTimer();
    } else if (e.key === "ArrowRight") {
      nextSlide();
      startTimer();
    }
  });

  // Touch swipe support
  let touchStartX = 0;
  carousel.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  carousel.addEventListener("touchend", (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
      startTimer();
    }
  }, { passive: true });

  startTimer();
})();

// ── GENRE CHIPS HORIZONTAL SCROLL ENHANCEMENT ───────────────
(function () {
  const chipsScroll = document.querySelector(".genre-chips-scroll");
  if (!chipsScroll) return;

  // Auto-scroll active chip into view on load
  const activeChip = chipsScroll.querySelector(".genre-chip.active");
  if (activeChip && activeChip !== chipsScroll.firstElementChild) {
    setTimeout(() => {
      activeChip.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }, 150);
  }

  // Mouse wheel horizontal scroll support
  chipsScroll.addEventListener("wheel", (e) => {
    if (e.deltaY !== 0 && !e.shiftKey) {
      e.preventDefault();
      chipsScroll.scrollLeft += e.deltaY;
    }
  }, { passive: false });
})();

// ── STAR RATING HOVER INTERACTION ──────────────────────────
(function () {
  document.addEventListener("mouseover", (e) => {
    const star = e.target.closest(".star");
    if (!star) return;
    const box = star.closest(".stars");
    if (!box) return;

    const n = parseInt(star.dataset.rate, 10);
    box.querySelectorAll(".star").forEach((s) => {
      const sn = parseInt(s.dataset.rate, 10);
      s.style.color = sn <= n ? "#f59e0b" : "rgba(255, 255, 255, 0.2)";
    });
  });

  document.addEventListener("mouseout", (e) => {
    const star = e.target.closest(".star");
    if (!star) return;
    const box = star.closest(".stars");
    if (!box) return;

    box.querySelectorAll(".star").forEach((s) => {
      s.style.color = "";
    });
  });
})();

// ── BUTTON RIPPLE EFFECT ───────────────────────────────────
document.addEventListener("pointerdown", (e) => {
  const btn = e.target.closest(".detail-add-btn, .hero-cta-btn");
  if (!btn) return;

  const rect = btn.getBoundingClientRect();
  const circle = document.createElement("span");
  const diameter = Math.max(rect.width, rect.height);
  const radius = diameter / 2;

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${e.clientX - rect.left - radius}px`;
  circle.style.top = `${e.clientY - rect.top - radius}px`;
  circle.classList.add("ripple");

  const existingRipple = btn.querySelector(".ripple");
  if (existingRipple) existingRipple.remove();

  btn.appendChild(circle);
});

// ── LIBRARY VIEW SWITCHER & FILTER CONTROLLER ──────────────
(function () {
  const container = document.getElementById("libraryContainer");
  if (!container) return;

  const gridBtn = document.getElementById("viewGridBtn");
  const listBtn = document.getElementById("viewListBtn");
  const filterTabs = document.querySelectorAll(".library-filter-tab");
  const searchInput = document.getElementById("librarySearchInput");
  const items = container.querySelectorAll(".library-item-card");
  const noResults = document.getElementById("libraryNoResults");

  // 1. Restore View Mode from localStorage
  const savedView = localStorage.getItem("library_view") || "grid";
  setViewMode(savedView);

  function setViewMode(mode) {
    if (mode === "list") {
      container.classList.remove("view-grid");
      container.classList.add("view-list");
      if (listBtn) listBtn.classList.add("active");
      if (gridBtn) gridBtn.classList.remove("active");
    } else {
      container.classList.remove("view-list");
      container.classList.add("view-grid");
      if (gridBtn) gridBtn.classList.add("active");
      if (listBtn) listBtn.classList.remove("active");
    }
    localStorage.setItem("library_view", mode);
  }

  if (gridBtn) gridBtn.addEventListener("click", () => setViewMode("grid"));
  if (listBtn) listBtn.addEventListener("click", () => setViewMode("list"));

  // 2. Filter Tabs & Real-time Search
  let currentFilter = "all";
  let searchQuery = "";

  function applyFilters() {
    let visibleCount = 0;
    items.forEach((item) => {
      const isRated = item.dataset.rated === "true";
      const title = item.dataset.title || "";

      let matchesTab = true;
      if (currentFilter === "rated") matchesTab = isRated;
      else if (currentFilter === "unrated") matchesTab = !isRated;

      const matchesSearch = !searchQuery || title.includes(searchQuery);

      if (matchesTab && matchesSearch) {
        item.style.display = "";
        visibleCount++;
      } else {
        item.style.display = "none";
      }
    });

    if (noResults) {
      noResults.classList.toggle("d-none", visibleCount > 0);
    }
  }

  filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      filterTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentFilter = tab.dataset.filter;
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }
})();



