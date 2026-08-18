/* ============================================================
   调酒 demo — 页面逻辑
   index.html : 渲染六大基酒列表
   spirit.html: 根据 ?id= 渲染基酒详情与调酒
   ============================================================ */

(function () {
  "use strict";

  /* ---------- 装饰边框文字 ---------- */

  function buildFrame() {
    const left = document.getElementById("frame-left");
    const right = document.getElementById("frame-right");
    const bars = document.querySelectorAll(".frame-bar");
    if (!left || !right) return;

    const isMobile = window.matchMedia("(max-width: 760px)").matches;

    if (isMobile) {
      // 手机端：左右竖排隐藏（CSS 处理），上下两条只写一个、居中
      left.textContent = "";
      right.textContent = "";
      bars.forEach(function (bar) { bar.textContent = "alcohol content"; });
      return;
    }

    // 桌面端：左右竖排随页面滚动，上下各留 64px 避开横排
    const docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    const sideH = Math.max(docH - 128, 0);
    // 每个字符约占 17px（12px 字号 + 0.4em 字距）
    const perWord = 15 * 17; // "alcohol content"
    const count = Math.ceil(sideH / perWord) + 2;
    const sideText = Array(count).fill("alcohol content").join("  ·  ") + "  ·";
    left.textContent = sideText;
    right.textContent = sideText;

    // 上下横排：宽度减去左右留边
    const barW = Math.max(window.innerWidth - 120, 300);
    const barCount = Math.ceil(barW / 260) + 1;
    const barText = Array(barCount).fill("alcohol content").join("  ·  ") + "  ·";
    bars.forEach(function (bar) { bar.textContent = barText; });
  }

  /* ---------- 滚动淡入 ---------- */

  function setupReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 主页：六大基酒列表 ---------- */

  function renderIndex() {
    const list = document.getElementById("spirit-list");
    if (!list) return;

    SPIRITS.forEach(function (s, i) {
      const a = document.createElement("a");
      a.className = "spirit-row reveal";
      a.href = "spirit.html?id=" + s.id;
      a.style.transitionDelay = (i * 60) + "ms";
      a.innerHTML =
        '<span class="spirit-num">0' + (i + 1) + '</span>' +
        '<span class="spirit-name">' + s.name +
          '<small>' + s.en + '</small>' +
        '</span>' +
        '<span class="spirit-arrow">→</span>' +
        '<span class="spirit-desc">' + s.desc + '</span>';
      list.appendChild(a);
    });
  }

  /* ---------- 详情页：基酒 + 调酒 ---------- */

  function renderSpiritPage() {
    const nameEl = document.getElementById("spirit-name");
    if (!nameEl) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id") || "";
    const spirit = SPIRITS.find(function (s) { return s.id === id; }) || SPIRITS[0];

    document.title = spirit.name + " · 9° 调酒手册";
    nameEl.textContent = spirit.name;
    document.getElementById("spirit-en").textContent = spirit.en;
    document.getElementById("spirit-desc").textContent = spirit.desc;

    const container = document.getElementById("drinks");
    spirit.drinks.forEach(function (d, i) {
      const sec = document.createElement("section");
      sec.className = "drink reveal";
      sec.style.transitionDelay = "80ms";

      const ingRows = d.ingredients.map(function (pair) {
        return '<div class="ing-row"><span>' + pair[0] + '</span>' +
               '<span class="amt">' + pair[1] + '</span></div>';
      }).join("");

      const stepsHtml = d.steps.map(function (s) {
        return '<li>' + s + '</li>';
      }).join("");

      // 摇和法额外标注摇壶类型与时间
      const shakerHtml = d.shaker
        ? '<div class="shaker-note"><span class="shaker-type">' + d.shaker + '</span>' +
          '<span class="shaker-dot">·</span>' +
          '<span class="shaker-time">' + d.shakeTime + '</span></div>'
        : "";

      sec.innerHTML =
        '<div class="drink-grid">' +
          '<div class="drink-img"><img src="' + d.img + '" alt="' + d.zh + '" loading="lazy"></div>' +
          '<div class="drink-info">' +
            '<div class="drink-head">' +
              '<div class="num">No. ' + String(i + 1).padStart(2, "0") + '</div>' +
              '<h3>' + d.zh + '</h3>' +
              '<div class="en">' + d.en + '</div>' +
            '</div>' +
            '<div class="drink-section-title">配料 · Ingredients</div>' +
            ingRows +
            '<div class="drink-section-title">手法 · Method</div>' +
            '<div class="method-name">' + d.method + '</div>' +
            '<ol class="method-steps">' + stepsHtml + '</ol>' +
            shakerHtml +
            '<div class="drink-section-title">杯型 / 装饰</div>' +
            '<div class="tags">' +
              '<span class="tag tag-blue">' + d.glass + '</span>' +
              '<span class="tag tag-yellow">' + d.garnish + '</span>' +
            '</div>' +
          '</div>' +
        '</div>';
      container.appendChild(sec);
    });
  }

  /* ---------- 返回按钮：优先回退历史，无历史则回首页 ---------- */

  function setupBackLink() {
    const back = document.querySelector(".back-link");
    if (!back) return;
    back.addEventListener("click", function (e) {
      if (window.history.length > 1) {
        e.preventDefault();
        window.history.back();
      }
      // 无历史时走默认 href（index.html）
    });
  }

  /* ---------- 启动 ---------- */

  function init() {
    renderIndex();
    renderSpiritPage();
    buildFrame();
    setupReveal();
    setupBackLink();
    window.addEventListener("resize", function () { buildFrame(); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
