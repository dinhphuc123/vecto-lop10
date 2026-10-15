/* ============================================================================
 * app.js — Bộ điều phối bài giảng SCORM 1.2 (assembly).
 * Bài: Các khái niệm mở đầu (Vectơ) — Toán 10, Kết nối tri thức, 2 tiết.
 * GV: Tiêu Đình Phúc — Trường Phổ thông Dân tộc Nội trú.
 *
 * Thứ tự nạp: quiz.js → data.js → scenes.js → scenes2.js → app.js (xem index.html).
 * Cung cấp đối tượng `api` đúng hợp đồng scenes.js đã khai báo:
 *   complete/log/video/lab/eureka/mindmap/badges/gotoScene
 * Chuẩn SCORM 1.2 (qa-checklist mục 2): chỉ element chuẩn; state vào
 * cmi.suspend_data (JSON); set score luôn kèm max/min.
 * Khóa tiến trình (qa-checklist mục 3): menu chỉ mở chặng đã xong + hiện tại;
 * nút Tiếp tục khóa tới khi xong nhiệm vụ; nút Hoàn thành gọi đúng luồng
 * lesson_status + Scorm.finish.
 * ========================================================================== */
(function (global) {
"use strict";

/* ================= 0. Tiện ích DOM ================= */
function el(tag, cls, html) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}
function toast(msg, ms) {
  var t = document.getElementById("toast");
  t.textContent = msg; t.style.display = "block";
  clearTimeout(t._tm);
  t._tm = setTimeout(function () { t.style.display = "none"; }, ms || 2600);
}

/* ================= 1. SCORM 1.2 wrapper ================= */
function findAPI(win) {
  var n = 0;
  try {
    while (win && n < 500) {
      if (win.API) return win.API;
      win = (win.parent === win) ? null : win.parent;
      n++;
    }
  } catch (e) { /* cross-origin */ }
  return null;
}
var Scorm = {
  api: null, active: false,
  init: function () {
    this.api = findAPI(window);
    if (!this.api && window.opener) {
      try { this.api = findAPI(window.opener); } catch (e) {}
    }
    if (this.api) {
      try { this.active = (this.api.LMSInitialize("") === "true"); }
      catch (e) { this.active = false; }
    }
    return this.active;
  },
  get: function (k) {
    if (!this.active) return "";
    try { return this.api.LMSGetValue(k); } catch (e) { return ""; }
  },
  set: function (k, v) {
    if (!this.active) return;
    try { this.api.LMSSetValue(k, String(v)); } catch (e) {}
  },
  commit: function () {
    if (!this.active) return;
    try { this.api.LMSCommit(""); } catch (e) {}
  },
  finish: function () {
    if (!this.active) return;
    try { this.api.LMSFinish(""); } catch (e) {}
    this.active = false;
  }
};

/* ================= 2. State + persist ================= */
var LSKEY = "vecto10-state-v1";
var N = (global.SCENES || []).length;
var state = { i: 0, done: {}, testScore: null, testPass: false, log: [] };
var renderedIdx = 0;

function save() {
  /* suspend_data SCORM 1.2 giới hạn ~4096 ký tự: chỉ giữ log gọn */
  var slim = { i: state.i, done: state.done, testScore: state.testScore,
               testPass: state.testPass, log: state.log.slice(-40) };
  var s = "";
  try { s = JSON.stringify(slim); } catch (e) {}
  try { localStorage.setItem(LSKEY, JSON.stringify(state)); } catch (e) {}
  if (s) { Scorm.set("cmi.suspend_data", s); Scorm.commit(); }
}
function load() {
  var s = Scorm.active ? Scorm.get("cmi.suspend_data") : "";
  if (!s) { try { s = localStorage.getItem(LSKEY) || ""; } catch (e) {} }
  if (s) {
    try {
      var o = JSON.parse(s);
      if (o && typeof o.i === "number" && o.i >= 0 && o.i < N) {
        state.i = o.i; state.done = o.done || {};
        state.testScore = (typeof o.testScore === "number") ? o.testScore : null;
        state.testPass = !!o.testPass;
        state.log = o.log || [];
      }
    } catch (e) {}
  }
}

/* ================= 3. Render công thức KaTeX ================= */
function typesetMath(root) {
  if (!global.katex || !root) return;
  var skip = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, SELECT: 1, OPTION: 1 };
  var walker;
  try {
    walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (!p || skip[p.tagName]) return NodeFilter.FILTER_REJECT;
        if (p.closest && p.closest(".katex,.tex")) return NodeFilter.FILTER_REJECT;
        return (n.nodeValue && n.nodeValue.indexOf("$") >= 0)
          ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    }, false);
  } catch (e) { return; }
  var nodes = [], n;
  while ((n = walker.nextNode())) nodes.push(n);
  nodes.forEach(function (tn) {
    var txt = tn.nodeValue, re = /\$([^$\n]+?)\$/g, m, last = 0, found = false;
    var frag = document.createDocumentFragment();
    while ((m = re.exec(txt))) {
      found = true;
      if (m.index > last) frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
      var sp = document.createElement("span");
      sp.className = "tex";
      try { sp.innerHTML = global.katex.renderToString(m[1], { throwOnError: false }); }
      catch (e) { sp.textContent = "$" + m[1] + "$"; }
      frag.appendChild(sp);
      last = m.index + m[0].length;
    }
    if (!found) return;
    if (last < txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
    tn.parentNode.replaceChild(frag, tn);
  });
}
var texTimer = null;
function watchMath(stage) {
  if (!("MutationObserver" in window)) return;
  var obs = new MutationObserver(function () {
    clearTimeout(texTimer);
    texTimer = setTimeout(function () { typesetMath(stage); }, 120);
  });
  obs.observe(stage, { childList: true, subtree: true });
}

/* ================= 4. Player: scene, menu, điều hướng ================= */
var stageEl, btnBack, btnNext, btnFinish, listEl;

function doneCount() {
  var c = 0;
  (global.SCENES || []).forEach(function (s) { if (state.done[s.id]) c++; });
  return c;
}
function updateProgress() {
  var c = doneCount();
  document.getElementById("progBar").style.width = (N ? (c / N * 100) : 0) + "%";
  document.getElementById("progTxt").textContent = c + "/" + N;
}
function renderMenu() {
  listEl.innerHTML = "";
  (global.SCENES || []).forEach(function (s, i) {
    var li = el("li", "");
    var b = el("button", "", "");
    b.type = "button";
    var locked = i > state.i;
    var mk = state.done[s.id] ? "✓" : (locked ? "🔒" : "○");
    b.className = (i === renderedIdx ? "cur " : "") + (state.done[s.id] ? "done " : "") + (locked ? "locked" : "");
    b.innerHTML = '<span class="mk">' + mk + "</span><span>" + (i + 1) + ". " + s.title + "</span>";
    b.setAttribute("aria-label", "Chặng " + (i + 1) + ": " + s.title + (locked ? " (đang khóa)" : ""));
    (function (idx, isLocked) {
      b.onclick = function () { goScene(idx, isLocked); };
    })(i, locked);
    li.appendChild(b);
    listEl.appendChild(li);
  });
}
function openDrawer(o) {
  document.getElementById("drawer").classList.toggle("open", !!o);
  document.getElementById("scrim").classList.toggle("on", !!o);
}
/* Render chặng i (không kiểm tra khóa) — lõi dùng chung cho HS và harness QA */
function renderScene(i) {
  if (i < 0 || i >= N) return;
  openDrawer(false);
  /* dọn timer/interval của chặng cũ (chống rò rỉ) */
  var cl = global.__sceneCleanup || [];
  global.__sceneCleanup = [];
  cl.forEach(function (fn) { try { fn(); } catch (e) {} });
  renderedIdx = i;
  var s = global.SCENES[i];
  stageEl.innerHTML = "";
  var head = el("div", "scene-head",
    "<h2>Chặng " + (i + 1) + "/" + N + " — " + s.title + "</h2>" +
    '<div class="meta">Mức tư duy: ' + (s.bloom || "—") + " · ⏱ ~" + (s.mins || "—") + " phút</div>");
  stageEl.appendChild(head);
  var body = el("div", "scene-body");
  stageEl.appendChild(body);
  try { s.render(body, api); }
  catch (e) { body.appendChild(el("p", "", "Không tải được nội dung chặng này. Em thử tải lại trang.")); }
  typesetMath(stageEl);
  window.scrollTo(0, 0);
  refreshNav();
  renderMenu();
  updateProgress();
  if (Scorm.active) { Scorm.set("cmi.core.lesson_location", s.id); Scorm.commit(); }
}
/* Mọi đường vào chặng của HS đều qua hàm này — kiểm tra khóa tập trung (checklist mục 3) */
function goScene(i, wasLocked) {
  if (i > state.i || wasLocked) {
    toast("🔒 Em hãy hoàn thành chặng hiện tại trước nhé.");
    return;
  }
  renderScene(i);
}
/* Hợp đồng harness cho cổng QA/probe của skill (qa-gate.sh, scorm-runtime-probe.py,
 * pedagogy-probe.py gọi App.nav(i)): entry point kiểm thử, bỏ qua khóa tiến trình
 * của HS (đúng mẫu fixture-09). Đường đi của HS vẫn qua goScene có kiểm tra khóa. */
global.App = { nav: function (i) { renderScene(i); } };
function refreshNav() {
  var s = global.SCENES[renderedIdx];
  var done = !!(s && state.done[s.id]);
  btnBack.disabled = renderedIdx <= 0;
  btnNext.disabled = !done;
  btnNext.innerHTML = done ? "Tiếp tục →" : "🔒 Tiếp tục →";
  var last = renderedIdx === N - 1;
  btnFinish.style.display = (last && done) ? "" : "none";
  btnNext.style.display = last ? "none" : "";
}

/* ================= 5. Điểm SCORM ================= */
function testMax() {
  /* max thực tế tính từ code (checklist mục 2) */
  try {
    return global.TEST13.reduce(function (a, id) {
      var q = global.QBANK[id];
      return a + ((q && typeof q.pts === "number") ? q.pts : 0);
    }, 0);
  } catch (e) { return 100; }
}
function setScore(raw, pass) {
  state.testScore = raw;
  state.testPass = !!pass;
  Scorm.set("cmi.core.score.raw", raw);
  Scorm.set("cmi.core.score.max", testMax());
  Scorm.set("cmi.core.score.min", 0);
  Scorm.commit();
  save();
}

/* ================= 6. api cho scenes ================= */
var VIDSRC = { V0: "v0_khoidong", V1: "v1_vectorlagi", V2: "v2_cungphuong", V3: "v3_vectorkhong" };
/* Thời điểm pause (giây) trích từ *_timeline.json của video agent */
var VPAUSE = { V0: [70.51], V1: [33.94, 67.83], V2: [21.13, 40.56], V3: [32.33] };
var LABFILE = { lab1: "lab1-vecto.html", lab2: "lab2-cung-phuong.html", lab3: "lab3-vecto-khong.html" };

function noteBox(host, html, ok) {
  var d = el("div", "", html);
  d.style.cssText = "margin:8px 0;padding:8px 12px;border-radius:8px;font-size:15px;" +
    (ok ? "background:#e8f5e9;color:#1b5e20;border:1px solid #a5d6a7;"
        : "background:#fff8e1;color:#5d4037;border:1px solid #ffe0b2;");
  host.appendChild(d);
  return d;
}

var api = {
  complete: function () {
    var s = global.SCENES[renderedIdx];
    if (!s) return;
    if (!state.done[s.id]) { state.done[s.id] = true; save(); }
    refreshNav(); renderMenu(); updateProgress();
  },
  log: function (ev) {
    ev = ev || {};
    try { state.log.push(Object.assign({ t: Date.now() }, ev)); }
    catch (e) { state.log.push(ev); }
    if (ev.ev === "test13-done" && typeof ev.score === "number") {
      setScore(ev.score, ev.pass);
    } else if (state.log.length % 5 === 0) {
      save();
    }
  },
  video: function (vid, host, opts) {
    opts = opts || {};
    var base = VIDSRC[vid];
    if (!base) { noteBox(host, "Không tìm thấy video " + vid + ".", false); return; }
    var quizzes = (global.VIDEO_QUIZZES && global.VIDEO_QUIZZES[vid]) || [];
    var times = VPAUSE[vid] || [];
    var pauses = quizzes.map(function (q, i) {
      return { t: (typeof times[i] === "number") ? times[i] : null, quiz: q, done: false };
    });

    var box = el("div", "app-video");
    var v = document.createElement("video");
    v.controls = true; v.preload = "metadata";
    v.setAttribute("playsinline", "");
    v.src = "assets/video/" + base + ".mp4";
    var tr = document.createElement("track");
    tr.kind = "subtitles"; tr.srclang = "vi"; tr.label = "Tiếng Việt";
    tr.src = "assets/video/" + base + ".vtt"; tr.default = true;
    v.appendChild(tr);
    box.appendChild(v);
    var startBtn = el("button", "btn primary vstart", "▶ Xem video");
    startBtn.type = "button";
    box.appendChild(startBtn);
    var pauseHost = el("div", "");
    box.appendChild(pauseHost);
    host.appendChild(box);

    var started = false, finished = false, maxT = 0;
    function play() {
      started = true; startBtn.style.display = "none";
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    }
    startBtn.onclick = play;
    v.addEventListener("click", function () { if (!started) play(); });

    /* Chống tua qua điểm dừng (seekLock) */
    v.addEventListener("timeupdate", function () {
      if (v.currentTime > maxT) maxT = v.currentTime;
      checkPauses();
    });
    v.addEventListener("seeking", function () {
      if (v.currentTime > maxT + 0.75) {
        v.currentTime = Math.max(0, maxT - 0.25);
        toast("⏩ Em xem hết phần này rồi mới tua tiếp nhé.");
      }
    });
    function pendingPause() {
      for (var i = 0; i < pauses.length; i++) {
        var p = pauses[i];
        if (!p.done && p.t != null && v.currentTime + 0.3 >= p.t) return p;
      }
      return null;
    }
    function checkPauses() {
      var p = pendingPause();
      if (p) triggerPause(p);
    }
    function triggerPause(p) {
      v.pause();
      var card = el("div", "vpause", "<b>⏸ Dừng một chút — trả lời rồi xem tiếp nhé:</b>");
      pauseHost.appendChild(card);
      var qh = el("div", "");
      card.appendChild(qh);
      var cfg = {};
      for (var k in p.quiz) cfg[k] = p.quiz[k];
      cfg.onDone = function () {
        p.done = true;
        card.style.display = "none";
        api.log({ ev: "video-quiz", id: vid, type: p.quiz.type });
        v.play();
        checkEnd();
      };
      try {
        if (p.quiz.type === "predict") global.Quiz.predict(qh, cfg);
        else if (p.quiz.type === "fill") global.Quiz.fill(qh, cfg);
        else global.Quiz.mcq(qh, cfg);
      } catch (e) {
        cfg.onDone();
      }
      typesetMath(card);
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    function checkEnd() {
      if (finished) return;
      var all = pauses.every(function (p) { return p.done; });
      if (all && (v.ended || v.currentTime >= (v.duration || 1e9) - 0.6)) {
        finished = true;
        noteBox(box, "✓ Em đã xem xong video.", true);
        if (opts.onDone) opts.onDone();
      }
    }
    v.addEventListener("ended", function () {
      /* nếu pause cuối trùng thời lượng mà chưa kịp kích hoạt */
      var p = pendingPause();
      if (p) { triggerPause(p); return; }
      checkEnd();
    });
  },
  lab: function (name, host, opts) {
    opts = opts || {};
    var cfg = opts.cfg || {};
    var file = LABFILE[name];
    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      if (opts.onDone) opts.onDone();
    }
    /* Bước 1 — Dự đoán */
    host.appendChild(el("div", "sc-sec", "Bước 1 — Dự đoán (không chấm điểm)"));
    var pbox = el("div", "qz qz-predict");
    pbox.appendChild(el("div", "qz-q", (cfg.predict && cfg.predict.q) || ""));
    var ta = el("textarea", "qz-area");
    ta.placeholder = "Em viết dự đoán của mình... Mọi ý kiến đều được tôn trọng.";
    ta.setAttribute("aria-label", "Ô nhập dự đoán");
    pbox.appendChild(ta);
    var pb = el("button", "qz-btn", "📌 Ghi dự đoán");
    pb.type = "button";
    pbox.appendChild(pb);
    host.appendChild(pbox);
    pb.onclick = function () {
      ta.disabled = true; pb.disabled = true;
      noteBox(pbox, "✓ Cảm ơn em! Dự đoán của em đã được ghi nhận.", true);
      api.log({ ev: "lab-predict", lab: name });
    };
    /* Bước 2+3 — Thao tác và quan sát */
    host.appendChild(el("div", "sc-sec", "Bước 2+3 — Thao tác và quan sát"));
    if (file) {
      var fr = document.createElement("iframe");
      fr.className = "lab-frame";
      fr.src = "assets/js/" + file;
      fr.title = "Mô phỏng " + name;
      fr.setAttribute("loading", "lazy");
      host.appendChild(fr);
    }
    var obs = cfg.observe || [];
    if (obs.length && global.QBANK) {
      var ul = el("div", "sc-note", "<b>Câu hỏi dẫn dắt khi quan sát:</b>");
      host.appendChild(ul);
      obs.forEach(function (oid) {
        var o = global.QBANK[oid];
        if (o) host.appendChild(el("p", "sc-note", "• " + o.q + (o.a ? "<br>→ " + o.a : "")));
      });
    }
    /* Bước 4 — Kết luận */
    host.appendChild(el("div", "sc-sec", "Bước 4 — Kết luận"));
    var fillId = cfg.conclude && cfg.conclude.fillId;
    if (fillId && global.__sc && global.__sc.runQuiz) {
      global.__sc.runQuiz(host, fillId, {
        onDone: function () { finish(); }
      });
    } else {
      var db = el("button", "qz-btn", "✓ Em đã khám phá xong");
      db.type = "button";
      db.onclick = finish;
      host.appendChild(db);
    }
  },
  eureka: function () {
    var layer = document.getElementById("eurekaLayer");
    var c = document.getElementById("eurekaCanvas");
    layer.style.display = "block";
    c.width = window.innerWidth; c.height = window.innerHeight;
    var ctx = c.getContext("2d");
    var cols = ["#f44336", "#ffeb3b", "#4caf50", "#2196f3", "#ff9800", "#9c27b0"];
    var ps = [];
    for (var i = 0; i < 150; i++) {
      ps.push({ x: Math.random() * c.width, y: -20 - Math.random() * c.height * 0.4,
        w: 6 + Math.random() * 6, h: 8 + Math.random() * 8,
        col: cols[(Math.random() * cols.length) | 0],
        vy: 2 + Math.random() * 3, vx: -1.5 + Math.random() * 3,
        r: Math.random() * Math.PI, vr: -0.1 + Math.random() * 0.2 });
    }
    var t = 0;
    (function tick() {
      ctx.clearRect(0, 0, c.width, c.height);
      ps.forEach(function (p) {
        p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.col; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (++t < 200) requestAnimationFrame(tick);
      else { ctx.clearRect(0, 0, c.width, c.height); layer.style.display = "none"; }
    })();
    toast("🎉 Eureka! Em đã tự khám phá ra kiến thức mới!");
  },
  mindmap: function (host) {
    var svgNS = "http://www.w3.org/2000/svg";
    function t(x, y, s, big) {
      var e = document.createElementNS(svgNS, "text");
      e.setAttribute("x", x); e.setAttribute("y", y);
      e.setAttribute("text-anchor", "middle");
      e.setAttribute("font-size", big ? 17 : 14);
      e.setAttribute("font-weight", big ? "700" : "400");
      e.setAttribute("fill", big ? "#0d47a1" : "#1c3a63");
      e.textContent = s;
      return e;
    }
    function box(x, y, w, hh, fill) {
      var r = document.createElementNS(svgNS, "rect");
      r.setAttribute("x", x); r.setAttribute("y", y);
      r.setAttribute("width", w); r.setAttribute("height", hh);
      r.setAttribute("rx", 12); r.setAttribute("fill", fill);
      r.setAttribute("stroke", "#90caf9");
      return r;
    }
    function line(x1, y1, x2, y2) {
      var l = document.createElementNS(svgNS, "line");
      l.setAttribute("x1", x1); l.setAttribute("y1", y1);
      l.setAttribute("x2", x2); l.setAttribute("y2", y2);
      l.setAttribute("stroke", "#64b5f6"); l.setAttribute("stroke-width", 2);
      return l;
    }
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 920 340");
    svg.setAttribute("class", "mm-svg");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Sơ đồ tổng kết vectơ");
    var cx = 460, cy = 60;
    var branches = [
      ["Khái niệm", "đoạn thẳng có hướng", "Ký hiệu: $\\overrightarrow{AB}$; độ dài: $|\\overrightarrow{AB}|$"],
      ["Cùng phương", "giá song song", "hoặc trùng nhau"],
      ["Cùng / ngược hướng", "cùng phương và", "cùng / ngược chiều mũi tên"],
      ["Bằng nhau", "cùng hướng và cùng độ dài", "$\\vec{a}=\\vec{b}$"],
      ["Vectơ-không", "điểm đầu trùng điểm cuối", "$\\overrightarrow{0}$: độ dài bằng 0"]
    ];
    svg.appendChild(box(cx - 150, cy - 26, 300, 52, "#e3f2fd"));
    svg.appendChild(t(cx, cy + 6, "VECTƠ — đoạn thẳng có hướng", true));
    branches.forEach(function (b, i) {
      var bx = 30 + i * 178, by = 220;
      svg.appendChild(line(cx, cy + 26, bx + 74, by));
      svg.appendChild(box(bx, by, 148, 96, "#f4f8fd"));
      svg.appendChild(t(bx + 74, by + 24, b[0], true));
      if (b[1]) svg.appendChild(t(bx + 74, by + 48, b[1], false));
      if (b[2]) {
        var tt = t(bx + 74, by + 72, "", false);
        tt.setAttribute("data-texraw", b[2]);
        svg.appendChild(tt);
      }
    });
    host.appendChild(svg);
    /* render công thức trong sơ đồ (hỗ trợ nhiều $...$ trên một dòng) */
    function escHtml(s) {
      return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    Array.prototype.forEach.call(svg.querySelectorAll("[data-texraw]"), function (tn) {
      var raw = tn.getAttribute("data-texraw");
      var x = parseFloat(tn.getAttribute("x")), y = parseFloat(tn.getAttribute("y"));
      tn.parentNode.removeChild(tn);
      var re = /\$([^$\n]+?)\$/g, m, last = 0, html = "";
      while ((m = re.exec(raw))) {
        html += escHtml(raw.slice(last, m.index));
        try { html += global.katex
          ? global.katex.renderToString(m[1], { throwOnError: false })
          : escHtml(m[0]); }
        catch (e) { html += escHtml(m[0]); }
        last = m.index + m[0].length;
      }
      html += escHtml(raw.slice(last));
      var fo = document.createElementNS(svgNS, "foreignObject");
      fo.setAttribute("width", "148"); fo.setAttribute("height", "36");
      var div = document.createElement("div");
      div.style.cssText = "width:148px;text-align:center;font-size:14px;color:#1c3a63;";
      div.innerHTML = html || escHtml(raw);
      fo.appendChild(div);
      var g = document.createElementNS(svgNS, "g");
      g.setAttribute("transform", "translate(" + (x - 74) + "," + (y - 18) + ")");
      g.appendChild(fo);
      svg.appendChild(g);
    });
  },
  badges: function (host, info) {
    info = info || {};
    var levels = info.levels || ["Nhà khám phá", "Nhà tranh luận", "Nhà sáng tạo", "Nhà vô địch vectơ"];
    var c = doneCount();
    var earned = [c >= 5, c >= 10, c >= N, c >= N && state.testPass];
    var icons = ["🔍", "💬", "💡", "🏆"];
    var wrap = el("div", "badges");
    levels.forEach(function (lv, i) {
      var b = el("div", "badge " + (earned[i] ? "earned" : "locked"),
        '<div class="ico">' + (earned[i] ? icons[i] : "🔒") + "</div><b>" + lv + "</b><br>" +
        (earned[i] ? "<span style='color:#1d9d55'>✓ Đã đạt</span>" : "<span class='sc-note'>Chưa đạt</span>"));
      wrap.appendChild(b);
    });
    host.appendChild(wrap);
    var n = earned.filter(Boolean).length;
    host.appendChild(el("p", "sc-note", "Em đã đạt " + n + "/" + levels.length + " huy hiệu." +
      (state.testScore != null ? " Điểm kiểm tra: " + state.testScore + "/100." : "")));
  },
  gotoScene: function (id) {
    for (var i = 0; i < N; i++) {
      if (global.SCENES[i].id === id) { goScene(i, false); return; }
    }
  }
};

/* ================= 7. Khởi động ================= */
function boot() {
  if (!global.SCENES || !N) {
    document.getElementById("stage").innerHTML =
      "<p>Không tải được nội dung bài học. Em thử tải lại trang.</p>";
    return;
  }
  stageEl = document.getElementById("stage");
  btnBack = document.getElementById("btnBack");
  btnNext = document.getElementById("btnNext");
  btnFinish = document.getElementById("btnFinish");
  listEl = document.getElementById("sceneList");

  Scorm.init();
  load();
  if (Scorm.active) {
    var st = Scorm.get("cmi.core.lesson_status");
    if (!st) Scorm.set("cmi.core.lesson_status", "incomplete");
    Scorm.commit();
  }
  watchMath(stageEl);

  document.getElementById("menuBtn").onclick = function () {
    openDrawer(!document.getElementById("drawer").classList.contains("open"));
  };
  document.getElementById("scrim").onclick = function () { openDrawer(false); };
  btnBack.onclick = function () { goScene(renderedIdx - 1, false); };
  btnNext.onclick = function () {
    if (btnNext.disabled) return;
    var nxt = renderedIdx + 1;
    if (nxt >= N) return;
    state.i = Math.max(state.i, nxt);
    save();
    goScene(nxt, false);
  };
  btnFinish.onclick = function () {
    /* Luồng finish thật (checklist mục 3): lesson_status + Scorm.finish + toast */
    Scorm.set("cmi.core.lesson_status", "completed");
    Scorm.set("cmi.core.exit", "");
    Scorm.commit();
    save();
    Scorm.finish();
    btnFinish.disabled = true;
    toast("🎓 Chúc mừng em đã hoàn thành bài học! Kết quả đã được gửi lên LMS.", 5000);
  };
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") openDrawer(false);
  });

  renderMenu();
  updateProgress();
  goScene(Math.min(state.i, N - 1), false);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}

global.__app = { api: api, goScene: goScene, Scorm: Scorm, state: state };

})(window);
