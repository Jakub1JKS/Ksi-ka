// ===== Animacja spadających gwiazd =====

const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

let width, height;
let stars = [];
let shootingStars = [];

// ===== Obiekty kosmiczne (planety, rakiety, UFO, meteoryty) =====
// Tylko jeden obiekt na raz, pojawiają się co jakiś czas losowo.
let spaceObject = null;
let framesUntilNextSpaceObject = 300; // ok. 5s przy 60fps, potem losowane

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = document.body.scrollHeight;
}

function createStars() {
  const count = Math.floor((width * height) / 9000);
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.3 + 0.3,
    speed: Math.random() * 0.15 + 0.03,
    opacity: Math.random() * 0.6 + 0.3,
  }));
}

function maybeSpawnShootingStar() {
  if (Math.random() < 0.006 && shootingStars.length < 2) {
    const startX = Math.random() * width * 0.6;
    shootingStars.push({
      x: startX,
      y: Math.random() * height * 0.3,
      length: Math.random() * 80 + 60,
      speed: Math.random() * 6 + 8,
      angle: Math.PI / 5,
      life: 1,
    });
  }
}

const SPACE_OBJECT_TYPES = ["planet", "rocket", "ufo", "meteor"];

function spawnSpaceObject() {
  const type = SPACE_OBJECT_TYPES[Math.floor(Math.random() * SPACE_OBJECT_TYPES.length)];
  const fromLeft = Math.random() < 0.5;
  const y = height * (0.08 + Math.random() * 0.55);

  spaceObject = {
    type,
    x: fromLeft ? -80 : width + 80,
    y,
    dir: fromLeft ? 1 : -1,
    speed: (type === "meteor" ? 2.2 : 0.5) + Math.random() * 0.4,
    rotation: 0,
    scale: type === "planet" ? Math.random() * 18 + 22 : Math.random() * 0.6 + 0.8,
  };
}

function maybeSpawnSpaceObject() {
  if (spaceObject) return;
  framesUntilNextSpaceObject--;
  if (framesUntilNextSpaceObject <= 0) {
    spawnSpaceObject();
    framesUntilNextSpaceObject = 600 + Math.random() * 900; // 10–25s przerwy
  }
}

function drawPlanet(o) {
  const r = o.scale;
  ctx.save();
  ctx.translate(o.x, o.y);

  const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
  grad.addColorStop(0, "rgba(139, 133, 193, 0.9)");
  grad.addColorStop(1, "rgba(232, 181, 99, 0.55)");
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // pierścień
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.7, r * 0.4, -0.35, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(245, 243, 237, 0.35)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

function drawRocket(o) {
  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.rotate(o.dir > 0 ? 0.9 : Math.PI - 0.9);
  const s = o.scale * 14;

  ctx.fillStyle = "rgba(245, 243, 237, 0.85)";
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(s * 0.4, s * 0.6);
  ctx.lineTo(-s * 0.4, s * 0.6);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(232, 181, 99, 0.9)";
  ctx.beginPath();
  ctx.moveTo(0, s * 0.9);
  ctx.lineTo(s * 0.5, s * 1.6);
  ctx.lineTo(-s * 0.5, s * 1.6);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawUfo(o) {
  ctx.save();
  ctx.translate(o.x, o.y);
  const s = o.scale * 16;

  ctx.beginPath();
  ctx.ellipse(0, 0, s, s * 0.3, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(139, 133, 193, 0.8)";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, -s * 0.15, s * 0.4, Math.PI, 0);
  ctx.fillStyle = "rgba(245, 243, 237, 0.7)";
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(0, 0, s, s * 0.3, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(232, 181, 99, 0.6)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}

function drawMeteor(o) {
  ctx.save();
  ctx.translate(o.x, o.y);
  const s = o.scale * 8;

  const trailLength = 70;
  const grad = ctx.createLinearGradient(-o.dir * trailLength, -trailLength * 0.4, 0, 0);
  grad.addColorStop(0, "rgba(232, 181, 99, 0)");
  grad.addColorStop(1, "rgba(232, 181, 99, 0.8)");
  ctx.beginPath();
  ctx.strokeStyle = grad;
  ctx.lineWidth = s * 0.5;
  ctx.lineCap = "round";
  ctx.moveTo(-o.dir * trailLength, -trailLength * 0.4);
  ctx.lineTo(0, 0);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, s * 0.35, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(245, 243, 237, 0.95)";
  ctx.fill();

  ctx.restore();
}

function drawSpaceObject() {
  if (!spaceObject) return;
  const o = spaceObject;

  if (o.type === "planet") drawPlanet(o);
  else if (o.type === "rocket") drawRocket(o);
  else if (o.type === "ufo") drawUfo(o);
  else if (o.type === "meteor") drawMeteor(o);

  o.x += o.dir * o.speed;
  if (o.type === "meteor") o.y += o.speed * 0.4;

  if (o.x < -150 || o.x > width + 150 || o.y > height + 150) {
    spaceObject = null;
  }
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  // gwiazdy w tle
  for (const star of stars) {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(245, 243, 237, ${star.opacity})`;
    ctx.fill();

    if (!prefersReducedMotion) {
      star.y += star.speed;
      if (star.y > height) {
        star.y = 0;
        star.x = Math.random() * width;
      }
    }
  }

  // spadające gwiazdy (efekt specjalny)
  if (!prefersReducedMotion) {
    maybeSpawnShootingStar();

    shootingStars.forEach((s) => {
      const dx = Math.cos(s.angle) * s.length;
      const dy = Math.sin(s.angle) * s.length;

      const gradient = ctx.createLinearGradient(s.x, s.y, s.x - dx, s.y - dy);
      gradient.addColorStop(0, `rgba(232, 181, 99, ${s.life})`);
      gradient.addColorStop(1, "rgba(232, 181, 99, 0)");

      ctx.beginPath();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.5;
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - dx, s.y - dy);
      ctx.stroke();

      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      s.life -= 0.012;
    });

    shootingStars = shootingStars.filter((s) => s.life > 0 && s.y < height);

    // obiekty kosmiczne: planety, rakiety, UFO, meteoryty (jeden na raz)
    maybeSpawnSpaceObject();
    drawSpaceObject();
  }

  requestAnimationFrame(draw);
}

resize();
createStars();
draw();

window.addEventListener("resize", () => {
  resize();
  createStars();
});

// =====================================================
// ===== DANE: KONTA UŻYTKOWNIKÓW (localStorage)   =====
// UWAGA: to jest wersja DEMO — hasła nie są bezpiecznie
// szyfrowane. Do prawdziwego sklepu potrzebny jest
// backend (serwer + baza danych).
// =====================================================

const STARS_TO_REDEEM = 600;
const STARS_PER_PURCHASE = 45;

function simpleObfuscate(text) {
  return btoa(unescape(encodeURIComponent(text + "::kk_salt")));
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem("kk_users")) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem("kk_users", JSON.stringify(users));
}

function getCurrentUserEmail() {
  return localStorage.getItem("kk_currentUser");
}

function setCurrentUserEmail(email) {
  if (email) {
    localStorage.setItem("kk_currentUser", email);
  } else {
    localStorage.removeItem("kk_currentUser");
  }
}

function getCurrentUser() {
  const email = getCurrentUserEmail();
  if (!email) return null;
  return getUsers().find((u) => u.email === email) || null;
}

function updateCurrentUser(patch) {
  const email = getCurrentUserEmail();
  const users = getUsers();
  const idx = users.findIndex((u) => u.email === email);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...patch };
  saveUsers(users);
  return users[idx];
}

// ===== Toast =====
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

// ===== Render widgetu konta w nawigacji =====
function renderAccountWidget() {
  const container = document.getElementById("navAccount");
  const user = getCurrentUser();

  if (!user) {
    container.innerHTML = `<button class="nav__auth-btn" id="openAuthBtn" type="button">Zaloguj się</button>`;
    document.getElementById("openAuthBtn").addEventListener("click", () => openModal("authOverlay"));
    return;
  }

  const initials = user.name.trim().charAt(0).toUpperCase() || "?";
  const progress = Math.min(100, Math.round((user.stars / STARS_TO_REDEEM) * 100));
  const canRedeem = user.stars >= STARS_TO_REDEEM;

  container.innerHTML = `
    <div class="account-widget">
      <div class="account-widget__avatar">${initials}</div>
      <div class="account-widget__info">
        <span class="account-widget__name">${user.name}</span>
        <span class="account-widget__stars">⭐ ${user.stars} / ${STARS_TO_REDEEM}</span>
        <div class="account-widget__bar">
          <div class="account-widget__bar-fill" style="width:${progress}%"></div>
        </div>
        ${canRedeem ? `<button class="account-widget__redeem" id="redeemBtn" type="button">Wymień na gratis</button>` : ""}
      </div>
      <button class="account-widget__logout" id="logoutBtn" type="button">Wyloguj</button>
    </div>
  `;

  document.getElementById("logoutBtn").addEventListener("click", () => {
    setCurrentUserEmail(null);
    renderAccountWidget();
    showToast("Wylogowano.");
  });

  if (canRedeem) {
    document.getElementById("redeemBtn").addEventListener("click", redeemStars);
  }
}

function addStarsToCurrentUser(amount) {
  const user = getCurrentUser();
  if (!user) return;
  const hadEnoughBefore = user.stars >= STARS_TO_REDEEM;
  const updated = updateCurrentUser({ stars: user.stars + amount });
  renderAccountWidget();
  if (!hadEnoughBefore && updated.stars >= STARS_TO_REDEEM) {
    showToast("🎉 Uzbierano 600 gwiazdek! Możesz wymienić je na gratis.");
  }
}

function redeemStars() {
  const user = getCurrentUser();
  if (!user || user.stars < STARS_TO_REDEEM) return;
  updateCurrentUser({ stars: user.stars - STARS_TO_REDEEM });
  renderAccountWidget();
  showToast("✨ Wymieniono gwiazdki! Rabat naliczy się przy kolejnym zakupie.");
}

// ===== Modale: otwieranie / zamykanie =====
function openModal(id) {
  document.getElementById(id).classList.add("is-open");
}
function closeModal(id) {
  document.getElementById(id).classList.remove("is-open");
}

document.addEventListener("DOMContentLoaded", () => {
  renderAccountWidget();

  // --- zamykanie modali ---
  document.getElementById("authClose").addEventListener("click", () => closeModal("authOverlay"));
  document.getElementById("purchaseClose").addEventListener("click", () => closeModal("purchaseOverlay"));
  document.getElementById("purchaseCloseBtn2").addEventListener("click", () => closeModal("purchaseOverlay"));

  [...document.querySelectorAll(".modal-overlay")].forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.remove("is-open");
    });
  });

  // --- przełączanie zakładek logowanie / rejestracja ---
  document.querySelectorAll(".modal__tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".modal__tab").forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      const formName = tab.dataset.form;
      document.getElementById("loginForm").style.display = formName === "login" ? "flex" : "none";
      document.getElementById("registerForm").style.display = formName === "register" ? "flex" : "none";
    });
  });

  // --- logowanie ---
  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;
    const errorEl = document.getElementById("loginError");

    const user = getUsers().find((u) => u.email === email);
    if (!user || user.password !== simpleObfuscate(password)) {
      errorEl.textContent = "Nieprawidłowy e-mail lub hasło.";
      return;
    }
    errorEl.textContent = "";
    setCurrentUserEmail(email);
    renderAccountWidget();
    closeModal("authOverlay");
    showToast(`Witaj ponownie, ${user.name}!`);
    e.target.reset();
  });

  // --- rejestracja ---
  document.getElementById("registerForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim().toLowerCase();
    const password = document.getElementById("registerPassword").value;
    const errorEl = document.getElementById("registerError");

    if (password.length < 4) {
      errorEl.textContent = "Hasło musi mieć min. 4 znaki.";
      return;
    }

    const users = getUsers();
    if (users.some((u) => u.email === email)) {
      errorEl.textContent = "Konto z tym adresem e-mail już istnieje.";
      return;
    }

    users.push({ name, email, password: simpleObfuscate(password), stars: 0 });
    saveUsers(users);
    errorEl.textContent = "";
    setCurrentUserEmail(email);
    renderAccountWidget();
    closeModal("authOverlay");
    showToast(`Konto utworzone. Witaj, ${name}!`);
    e.target.reset();
  });

  // --- zakup książki ---
  document.getElementById("buyBtn").addEventListener("click", () => {
    const user = getCurrentUser();
    if (!user) {
      showToast("Zaloguj się, aby dokonać zakupu.");
      openModal("authOverlay");
      return;
    }
    addStarsToCurrentUser(STARS_PER_PURCHASE);
    openModal("purchaseOverlay");
  });

  document.getElementById("goToReviewBtn").addEventListener("click", () => {
    closeModal("purchaseOverlay");
    switchView("reviews");
  });

  // --- przełączanie widoków (Kolekcja / Opinie) ---
  document.querySelectorAll("[data-view]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      switchView(link.dataset.view);
    });
  });

  // --- gwiazdkowy wybór oceny w formularzu opinii ---
  const starPicker = document.getElementById("starPicker");
  starPicker.addEventListener("click", (e) => {
    if (e.target.tagName !== "SPAN") return;
    const value = Number(e.target.dataset.value);
    starPicker.dataset.rating = value;
    [...starPicker.children].forEach((star) => {
      star.classList.toggle("is-active", Number(star.dataset.value) <= value);
    });
  });

  // --- dodawanie opinii ---
  document.getElementById("reviewForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("reviewName").value.trim();
    const text = document.getElementById("reviewText").value.trim();
    const rating = Number(starPicker.dataset.rating);
    const errorEl = document.getElementById("reviewError");

    if (rating === 0) {
      errorEl.textContent = "Wybierz ocenę (kliknij gwiazdki).";
      return;
    }
    errorEl.textContent = "";

    const reviews = getReviews();
    reviews.unshift({ name, text, rating, date: new Date().toISOString() });
    saveReviews(reviews);
    renderReviews();

    e.target.reset();
    starPicker.dataset.rating = 0;
    [...starPicker.children].forEach((star) => star.classList.remove("is-active"));
    showToast("Dziękujemy za opinię! ⭐");
  });

  renderReviews();
});

function switchView(view) {
  document.getElementById("view-shop").style.display = view === "shop" ? "" : "none";
  document.getElementById("view-reviews").style.display = view === "reviews" ? "" : "none";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ===== Opinie: przechowywanie i renderowanie =====
function getReviews() {
  try {
    const stored = JSON.parse(localStorage.getItem("kk_reviews"));
    if (stored && stored.length) return stored;
  } catch {}
  // przykładowe opinie startowe
  return [
    {
      name: "Ania",
      rating: 5,
      text: "Przeczytałam jednym tchem, klimat idealny na wieczorną lekturę.",
      date: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      name: "Marek",
      rating: 4,
      text: "Bardzo dobre wydanie, ładna okładka i wciągająca historia.",
      date: new Date(Date.now() - 86400000 * 12).toISOString(),
    },
  ];
}

function saveReviews(reviews) {
  localStorage.setItem("kk_reviews", JSON.stringify(reviews));
}

function renderReviews() {
  const reviews = getReviews();
  const list = document.getElementById("reviewList");
  const summary = document.getElementById("reviewsSummary");

  if (reviews.length === 0) {
    summary.textContent = "Brak opinii — bądź pierwszą osobą, która ją doda!";
    list.innerHTML = "";
    return;
  }

  const avg = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  summary.textContent = `${"★".repeat(Math.round(avg))}${"☆".repeat(5 - Math.round(avg))}  ${avg} / 5 · ${reviews.length} opinii`;

  list.innerHTML = reviews
    .map(
      (r) => `
      <div class="review-item">
        <div class="review-item__head">
          <span class="review-item__name">${escapeHtml(r.name)}</span>
          <span class="review-item__stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</span>
        </div>
        <p class="review-item__text">${escapeHtml(r.text)}</p>
        <p class="review-item__date">${new Date(r.date).toLocaleDateString("pl-PL")}</p>
      </div>
    `
    )
    .join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
