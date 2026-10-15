/* ============================================================================
 * scenes.js — Nội dung các chặng S01–S07 (Hồi 1–3).
 * Bài: Các khái niệm mở đầu (Vectơ) — Toán 10, Kết nối tri thức, 2 tiết.
 *
 * HợP ĐỒNG VỚI app.js (assembly agent):
 *  - Thứ tự nạp script: quiz.js → data.js → scenes.js → scenes2.js → app.js
 *  - scenes.js tạo window.SCENES = [7 scene]; scenes2.js push thêm 7 scene.
 *  - Mỗi scene: {id, title, bloom, mins, goal, render(host, api)}
 *  - api do app.js cung cấp:
 *      api.complete()            mở khóa nút "Tiếp tục" của chặng
 *      api.log(ev)               ghi Learning Analytics (xaLog)
 *      api.video(id, host, opts) phát video tương tác; opts={quizzes,onDone}
 *      api.lab(name, host, opts)  nhúng Lab mô phỏng; opts={cfg,onDone}
 *      api.eureka()              pháo giấy eureka (nếu có Anim)
 *      api.mindmap(host)         mindmap tổng kết (nếu có)
 *      api.badges(host, info)    huy hiệu vinh danh (nếu có)
 *      api.gotoScene(id)         nhảy tới chặng đã học (nếu có)
 *    Mọi lời gọi api.* đều có fallback khi hàm chưa được cung cấp.
 *  - Công thức trong text: $...$ (KaTeX offline do app.js render).
 * ========================================================================== */
(function (global) {
"use strict";

var SVGNS = "http://www.w3.org/2000/svg";

function h(tag, cls, html) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}
function se(tag, attrs) {
  var e = document.createElementNS(SVGNS, tag);
  for (var k in attrs) e.setAttribute(k, attrs[k]);
  return e;
}
var cssDone = false;
function css() {
  if (cssDone) return; cssDone = true;
  var s = document.createElement("style");
  s.textContent = [
    ".sc-goal{padding:10px 14px;background:#f2f7ff;border-left:4px solid #2f7fe0;border-radius:0 10px 10px 0;margin:10px 0;line-height:1.6;}",
    ".sc-def{padding:12px 16px;background:#fff8e6;border:1px solid #f0d48a;border-radius:12px;margin:12px 0;line-height:1.7;}",
    ".sc-sec{font-size:18px;font-weight:700;margin:18px 0 8px;color:#1c3a63;}",
    ".sc-fig{background:#fff;border:1px solid #d7dee8;border-radius:12px;padding:10px;margin:12px 0;overflow-x:auto;}",
    ".sc-fig svg{display:block;max-width:100%;height:auto;}",
    ".sc-cap{text-align:center;color:#5a6b82;font-size:14px;margin-top:6px;}",
    ".st{border:1px solid #d7dee8;border-radius:12px;margin:12px 0;background:#fff;}",
    ".st-head{display:flex;align-items:center;gap:10px;padding:10px 14px;background:#f4f8fd;border-radius:12px 12px 0 0;font-weight:700;}",
    ".st-light{width:16px;height:16px;border-radius:50%;background:#c9d4e2;display:inline-block;}",
    ".st.done .st-light{background:#1d9d55;box-shadow:0 0 6px #1d9d55;}",
    ".st-body{padding:6px 14px 14px;}",
    ".sc-video{background:#0f1c2e;color:#dbe7f5;border-radius:12px;padding:14px;margin:12px 0;}",
    ".sc-note{color:#5a6b82;font-size:14px;line-height:1.6;}"
  ].join("\n");
  document.head.appendChild(s);
}

/* Chạy 1 quiz từ bank, gắn onDone */
function runQuiz(host, id, extra) {
  var cfg = QBANK[id];
  var c2 = {};
  for (var k in cfg) c2[k] = cfg[k];
  for (var k2 in (extra || {})) c2[k2] = extra[k2];
  return Quiz[cfg.type](host, c2);
}

/* Cụm trạm: mỗi trạm 1 đèn, xong hết → api.complete() */
function stations(host, ids, api, opts) {
  opts = opts || {};
  var need = ids.length, got = 0;
  ids.forEach(function (id, i) {
    var card = h("section", "st");
    var head = h("div", "st-head");
    head.appendChild(h("span", "st-light", ""));
    head.appendChild(h("span", "", (opts.stationName || "Trạm") + " " + (i + 1)));
    card.appendChild(head);
    var body = h("div", "st-body");
    card.appendChild(body);
    host.appendChild(card);
    var extra = {
      onDone: function (ok, pts) {
        if (!card.classList.contains("done")) {
          card.classList.add("done");
          got++;
          api.log({ ev: "station", scene: opts.scene, id: id, ok: !!ok, pts: pts });
          if (got >= need) api.complete();
        }
      }
    };
    if (opts.once) extra.once = true;
    runQuiz(body, id, extra);
  });
}

/* Khung Lab: ưu tiên api.lab (lab agent); thiếu thì fallback text đủ 4 bước */
function labBlock(host, labName, api) {
  var cfg = LABS[labName];
  if (api.lab) {
    api.lab(labName, host, {
      cfg: cfg,
      onDone: function () {
        if (api.eureka) api.eureka();
        api.complete();
      }
    });
    return;
  }
  /* Fallback: 4 bước bằng text + quiz có sẵn */
  host.appendChild(h("div", "sc-sec", "Bước 1 — Dự đoán (không chấm điểm)"));
  Quiz.predict(host, {
    q: cfg.predict.q,
    onDone: function () { api.log({ ev: "lab-predict", lab: labName }); }
  });
  host.appendChild(h("div", "sc-sec", "Bước 2+3 — Thao tác và quan sát"));
  host.appendChild(h("p", "sc-note", "Mô phỏng tương tác sẽ hiện ở đây trong bản đóng gói. Em đọc câu hỏi quan sát và tự trả lời:"));
  cfg.observe.forEach(function (oid) {
    var o = QBANK[oid];
    host.appendChild(h("div", "sc-def", "<b>" + o.q + "</b><br>→ " + o.a));
  });
  host.appendChild(h("div", "sc-sec", "Bước 4 — Kết luận"));
  runQuiz(host, cfg.conclude.fillId, {
    onDone: function () {
      if (api.eureka) api.eureka();
      api.complete();
    }
  });
}

/* Khung video: ưu tiên api.video (video agent); thiếu thì fallback */
function videoBlock(host, vid, api, onDone) {
  var quizzes = VIDEO_QUIZZES[vid] || [];
  if (api.video) {
    api.video(vid, host, { quizzes: quizzes, onDone: onDone });
    return;
  }
  var box = h("div", "sc-video", "<b>Video " + vid + "</b> sẽ hiện ở đây trong bản đóng gói.<br>");
  host.appendChild(box);
  /* Fallback: chạy quiz của các điểm dừng ngay dưới khung video */
  quizzes.forEach(function (pq) {
    var c2 = {};
    for (var k in pq) c2[k] = pq[k];
    Quiz[pq.type === "predict" ? "predict" : pq.type](host, c2);
  });
  var b = h("button", "qz-btn", "Đã xem xong video");
  b.type = "button";
  b.onclick = function () { b.disabled = true; onDone(); };
  host.appendChild(b);
}

/* ---------- Hình figS05: MN, PQ, CD + thước cm ---------- */
function figS05() {
  var wrap = h("div", "sc-fig");
  var svg = se("svg", { viewBox: "0 0 640 210", width: "640", height: "210", role: "img", "aria-label": "Hình các vectơ MN, PQ, CD và thước đo" });
  var defs = se("defs", {});
  var mk = se("marker", { id: "ah5", viewBox: "0 0 10 10", refX: "8", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse" });
  mk.appendChild(se("path", { d: "M0,0 L10,5 L0,10 z", fill: "#1c3a63" }));
  defs.appendChild(mk);
  svg.appendChild(defs);
  function vec(x1, y1, x2, y2, l1, l2) {
    var g = se("g", {});
    g.appendChild(se("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: "#1c3a63", "stroke-width": "3", "marker-end": "url(#ah5)" }));
    g.appendChild(se("circle", { cx: x1, cy: y1, r: "4", fill: "#1c3a63" }));
    var t1 = se("text", { x: x1 - 18, y: y1 + 6, "font-size": "18", "font-weight": "bold", fill: "#1c3a63" }); t1.textContent = l1;
    var t2 = se("text", { x: x2 + 10, y: y2 + 6, "font-size": "18", "font-weight": "bold", fill: "#1c3a63" }); t2.textContent = l2;
    g.appendChild(t1); g.appendChild(t2);
    svg.appendChild(g);
  }
  vec(40, 40, 200, 40, "M", "N");
  vec(40, 110, 200, 110, "P", "Q");
  /* CD dài đúng 4 cm danh nghĩa: 38px/cm × 4 */
  var pxPerCm = 38, x0 = 340, y0 = 70;
  vec(x0, y0, x0 + 4 * pxPerCm, y0, "C", "D");
  /* thước */
  var rg = se("g", {});
  rg.appendChild(se("line", { x1: x0, y1: y0 + 28, x2: x0 + 4 * pxPerCm, y2: y0 + 28, stroke: "#5a6b82", "stroke-width": "2" }));
  for (var i = 0; i <= 4; i++) {
    var x = x0 + i * pxPerCm;
    rg.appendChild(se("line", { x1: x, y1: y0 + 28, x2: x, y2: y0 + 40, stroke: "#5a6b82", "stroke-width": "2" }));
    var t = se("text", { x: x - 4, y: y0 + 58, "font-size": "14", fill: "#5a6b82" }); t.textContent = i;
    rg.appendChild(t);
  }
  var tc = se("text", { x: x0 + 4 * pxPerCm + 8, y: y0 + 58, "font-size": "14", fill: "#5a6b82" }); tc.textContent = "cm";
  rg.appendChild(tc);
  svg.appendChild(rg);
  wrap.appendChild(svg);
  wrap.appendChild(h("div", "sc-cap", "Hình: các vectơ $\\overrightarrow{MN}$, $\\overrightarrow{PQ}$, $\\overrightarrow{CD}$ ($C$ ở vạch 0, $D$ ở vạch 4)"));
  return wrap;
}

/* ================================================================== */
var SCENES = [
/* ---------------- S01 ---------------- */
{
  id: "S01", title: "Nghịch lý: biết khoảng cách vẫn chưa đủ",
  bloom: "Hiểu", mins: 5,
  goal: "HS nhận ra khoảng cách chưa xác định được vị trí; muốn xác định vị trí cần thêm hướng.",
  render: function (host, api) {
    css();
    host.appendChild(h("p", "sc-goal", "<b>Mục tiêu:</b> " + this.goal));
    host.appendChild(h("p", "", "Em hãy xem phim ngắn sau. Hai con tàu cùng rời cảng, cùng đi 10 km — nhưng lại tới hai nơi khác nhau!"));
    videoBlock(host, "V0", api, function () {
      api.log({ ev: "video-done", id: "V0" });
      api.complete();
    });
  }
},
/* ---------------- S02 ---------------- */
{
  id: "S02", title: "Phòng khởi động: 3 trạm ôn nền",
  bloom: "Nhớ", mins: 6,
  goal: "HS ôn lại đoạn thẳng, độ dài đoạn thẳng và ký hiệu điểm $A$, $B$.",
  render: function (host, api) {
    css();
    host.appendChild(h("p", "sc-goal", "<b>Mục tiêu:</b> " + this.goal));
    host.appendChild(h("p", "", "Em làm 3 trạm sau. Làm sai được làm lại không giới hạn. Mỗi trạm xong sẽ sáng đèn xanh."));
    stations(host, STATIONS.S02, api, { scene: "S02" });
  }
},
/* ---------------- S03 ---------------- */
{
  id: "S03", title: "Lab 1: Vectơ là đoạn thẳng có hướng",
  bloom: "Phân tích → Đánh giá", mins: 12,
  goal: "HS tự khám phá: vectơ gồm điểm đầu, điểm cuối; đổi hướng đổi ý nghĩa; độ dài không đổi khi chỉ xoay.",
  render: function (host, api) {
    css();
    host.appendChild(h("p", "sc-goal", "<b>Mục tiêu:</b> " + this.goal));
    host.appendChild(h("p", "", "Trong phòng thí nghiệm này, em kéo điểm $B$ quanh điểm $A$, xoay hướng và đổi độ dài của đoạn thẳng. Em ghi ít nhất 3 mẫu số liệu (hướng lên / xuống / trái) rồi trả lời các câu hỏi."));
    labBlock(host, "lab1", api);
  }
},
/* ---------------- S04 ---------------- */
{
  id: "S04", title: "Chốt khái niệm: ký hiệu và độ dài vectơ",
  bloom: "Hiểu", mins: 6,
  goal: "HS phát biểu định nghĩa, ký hiệu vectơ, độ dài vectơ; đọc đúng 'vectơ AB'.",
  render: function (host, api) {
    css();
    host.appendChild(h("p", "sc-goal", "<b>Mục tiêu:</b> " + this.goal));
    var need = 4, got = 0;
    function one(id) {
      return function (ok) {
        api.log({ ev: "s04-item", id: id, ok: !!ok });
        got++;
        if (got >= need) api.complete();
      };
    }
    host.appendChild(h("div", "sc-sec", "1. Xem video 'Vectơ là gì?'"));
    videoBlock(host, "V1", api, one("video"));
    host.appendChild(h("div", "sc-sec", "2. Ghép khung định nghĩa"));
    host.appendChild(h("div", "sc-def",
      "<b>Định nghĩa:</b> Vectơ là đoạn thẳng có hướng.<br>" +
      "Ký hiệu: $\\overrightarrow{AB}$ (đọc là 'vectơ AB'); hoặc một chữ thường có mũ tên: $\\vec{a}$.<br>" +
      "Độ dài: $\\left|\\overrightarrow{AB}\\right|$ (đọc là 'độ dài của vectơ AB')."));
    runQuiz(host, "S04-DD", { onDone: one("dd") });
    host.appendChild(h("div", "sc-sec", "3. Tự phát biểu định nghĩa"));
    runQuiz(host, "S04-E1", { onDone: one("essay") });
    host.appendChild(h("div", "sc-sec", "4. Củng cố nhanh"));
    /* 2 câu MCQ gộp 1 lượt hoàn thành */
    var mq = h("div", "");
    host.appendChild(mq);
    var mGot = 0;
    ["S04-M1", "S04-M2"].forEach(function (id) {
      runQuiz(mq, id, { onDone: function () { if (++mGot >= 2) one("mcq")(true); } });
    });
  }
},
/* ---------------- S05 ---------------- */
{
  id: "S05", title: "Luyện tập: nhận diện vectơ",
  bloom: "Vận dụng", mins: 6,
  goal: "HS nhận diện điểm đầu, điểm cuối, độ dài trong hình cụ thể.",
  render: function (host, api) {
    css();
    host.appendChild(h("p", "sc-goal", "<b>Mục tiêu:</b> " + this.goal));
    host.appendChild(h("p", "", "Em quan sát hình rồi làm 4 trạm. Phương án trắc nghiệm đã xáo trộn."));
    host.appendChild(figS05());
    stations(host, STATIONS.S05, api, { scene: "S05" });
  }
},
/* ---------------- S06 ---------------- */
{
  id: "S06", title: "Lab 2: Cùng phương là cùng 'đường đi'",
  bloom: "Phân tích → Đánh giá", mins: 12,
  goal: "HS tự khám phá: giá của vectơ; cùng phương khi giá song song hoặc trùng; bằng nhau khi cùng hướng và cùng độ dài.",
  render: function (host, api) {
    css();
    host.appendChild(h("p", "sc-goal", "<b>Mục tiêu:</b> " + this.goal));
    host.appendChild(h("p", "", "Em kéo 4 vectơ $\\overrightarrow{AB}$, $\\overrightarrow{CD}$, $\\overrightarrow{EF}$, $\\overrightarrow{GH}$; bật nút hiện 'giá' (đường thẳng qua điểm đầu và điểm cuối); ghi 3 mẫu (giá song song / giá trùng / giá cắt nhau)."));
    labBlock(host, "lab2", api);
  }
},
/* ---------------- S07 ---------------- */
{
  id: "S07", title: "Chốt: cùng hướng, ngược hướng, bằng nhau",
  bloom: "Hiểu", mins: 5,
  goal: "HS phát biểu chính xác các định nghĩa và ký hiệu.",
  render: function (host, api) {
    css();
    host.appendChild(h("p", "sc-goal", "<b>Mục tiêu:</b> " + this.goal));
    var need = 4, got = 0;
    function one(id) {
      return function (ok) {
        api.log({ ev: "s07-item", id: id, ok: !!ok });
        got++;
        if (got >= need) api.complete();
      };
    }
    host.appendChild(h("div", "sc-sec", "1. Xem video 'Cùng phương, cùng hướng, bằng nhau'"));
    videoBlock(host, "V2", api, one("video"));
    host.appendChild(h("div", "sc-sec", "2. Khung kiến thức"));
    host.appendChild(h("div", "sc-def",
      "<b>Cùng phương:</b> hai vectơ cùng phương khi giá của chúng song song hoặc trùng nhau.<br>" +
      "<b>Cùng hướng:</b> cùng phương và cùng chiều mũi tên. <b>Ngược hướng:</b> cùng phương và ngược chiều mũi tên.<br>" +
      "<b>Bằng nhau:</b> hai vectơ bằng nhau khi chúng cùng hướng và có cùng độ dài: $\\vec{a} = \\vec{b}$."));
    runQuiz(host, "S07-DD", { onDone: one("dd") });
    host.appendChild(h("div", "sc-sec", "3. Tự phát biểu bằng lời mình"));
    runQuiz(host, "S07-E1", { onDone: one("e1") });
    runQuiz(host, "S07-E2", { onDone: one("e2") });
  }
}
];

global.SCENES = SCENES;
/* Expose helper cho scenes2.js */
global.__sc = { h: h, se: se, runQuiz: runQuiz, stations: stations, labBlock: labBlock, videoBlock: videoBlock };
})(window);
