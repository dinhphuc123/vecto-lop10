/* ============================================================================
 * scenes2.js — Nội dung các chặng S08–S14 (Hồi 3–5).
 * Nạp SAU scenes.js; push thêm 7 scene vào window.SCENES.
 * Dùng chung helper của scenes.js: h, se, runQuiz, stations, labBlock,
 * videoBlock (được gắn lên window bởi scenes.js — xem cuối file scenes.js).
 * Lưu ý cho app.js: gọi scene.render(host, api) dưới dạng method để `this`
 * là scene (dùng this.goal).
 * ========================================================================== */
(function (global) {
"use strict";

/* Helper dùng chung từ scenes.js (được expose qua window.__sc) */
var SC = global.__sc || {};
function h(tag, cls, html) { return SC.h(tag, cls, html); }
function se(tag, attrs) { return SC.se(tag, attrs); }
function runQuiz(host, id, extra) { return SC.runQuiz(host, id, extra); }
function stations(host, ids, api, opts) { return SC.stations(host, ids, api, opts); }
function labBlock(host, name, api) { return SC.labBlock(host, name, api); }
function videoBlock(host, vid, api, onDone) { return SC.videoBlock(host, vid, api, onDone); }

/* ---------- Hình figS08: AB, CD, EF, GH, KL + 2 vectơ-không ----------
 * Số liệu đã kiểm chứng SymPy (xem cuối file):
 * |AB|=|CD|=|EF|=120, AB/CD cùng hướng → bằng nhau; EF ngược hướng;
 * |KL|=90 cùng hướng AB nhưng khác độ dài → không bằng nhau;
 * GH thẳng đứng → không cùng phương với AB; MM, NN là vectơ-không → bằng nhau. */
function figS08() {
  var wrap = h("div", "sc-fig");
  var svg = se("svg", { viewBox: "0 0 660 260", width: "660", height: "260", role: "img", "aria-label": "Hình các vectơ AB, CD, EF, GH, KL và hai vectơ-không" });
  var defs = se("defs", {});
  var mk = se("marker", { id: "ah8", viewBox: "0 0 10 10", refX: "8", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse" });
  mk.appendChild(se("path", { d: "M0,0 L10,5 L0,10 z", fill: "#1c3a63" }));
  defs.appendChild(mk);
  svg.appendChild(defs);
  function vec(x1, y1, x2, y2, l1, l2) {
    var g = se("g", {});
    g.appendChild(se("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: "#1c3a63", "stroke-width": "3", "marker-end": "url(#ah8)" }));
    g.appendChild(se("circle", { cx: x1, cy: y1, r: "4", fill: "#1c3a63" }));
    var t1 = se("text", { x: x1 - 20, y: y1 + 6, "font-size": "18", "font-weight": "bold", fill: "#1c3a63" }); t1.textContent = l1;
    var t2 = se("text", { x: x2 + 10, y: y2 + 6, "font-size": "18", "font-weight": "bold", fill: "#1c3a63" }); t2.textContent = l2;
    g.appendChild(t1); g.appendChild(t2);
    svg.appendChild(g);
  }
  function zerovec(x, y, l) {
    var g = se("g", {});
    g.appendChild(se("circle", { cx: x, cy: y, r: "7", fill: "#1c3a63" }));
    var t = se("text", { x: x - 6, y: y - 14, "font-size": "18", "font-weight": "bold", fill: "#1c3a63" }); t.textContent = l;
    g.appendChild(t);
    svg.appendChild(g);
  }
  vec(40, 50, 160, 50, "A", "B");
  vec(40, 120, 160, 120, "C", "D");
  vec(280, 50, 160, 50, "E", "F");       /* E ở phải, mũi tên chỉ về F (trái) */
  vec(360, 40, 360, 160, "G", "H");      /* thẳng đứng */
  vec(440, 50, 530, 50, "K", "L");       /* ngắn hơn AB */
  zerovec(440, 210, "M");
  zerovec(570, 210, "N");
  var cap = se("text", { x: 330, y: 246, "font-size": "14", fill: "#5a6b82", "text-anchor": "middle" });
  cap.textContent = "Hai chấm tròn là hai vectơ-không tại M và tại N";
  svg.appendChild(cap);
  wrap.appendChild(svg);
  wrap.appendChild(h("div", "sc-cap", "Hình: $\\overrightarrow{AB}$, $\\overrightarrow{CD}$, $\\overrightarrow{EF}$, $\\overrightarrow{GH}$, $\\overrightarrow{KL}$ và hai vectơ-không"));
  return wrap;
}

var MORE = [
/* ---------------- S08 ---------------- */
{
  id: "S08", title: "Luyện tập: phân loại vectơ",
  bloom: "Vận dụng", mins: 6,
  goal: "HS phân loại đúng các cặp vectơ trong hình cho trước.",
  render: function (host, api) {
    host.appendChild(h("p", "sc-goal", "<b>Mục tiêu:</b> " + this.goal));
    host.appendChild(h("p", "", "Em quan sát hình rồi làm 4 trạm. Ở trạm 4, thẻ 'chấp nhận nhiều đáp án' được kiểm tra tự động."));
    host.appendChild(figS08());
    stations(host, STATIONS.S08, api, { scene: "S08" });
  }
},
/* ---------------- S09 ---------------- */
{
  id: "S09", title: "Lab 3: Khi điểm đầu trùng điểm cuối",
  bloom: "Phân tích", mins: 6,
  goal: "HS tự khám phá: co độ dài về 0 thì vectơ mất hướng; cần một quy ước mới.",
  render: function (host, api) {
    host.appendChild(h("p", "sc-goal", "<b>Mục tiêu:</b> " + this.goal));
    host.appendChild(h("p", "", "Em kéo thanh trượt độ dài về 0, thử xoay vectơ ở độ dài 0 và ghi 2 mẫu (độ dài dương / độ dài 0)."));
    labBlock(host, "lab3", api);
  }
},
/* ---------------- S10 ---------------- */
{
  id: "S10", title: "Chốt: vectơ-không và các quy ước",
  bloom: "Hiểu", mins: 4,
  goal: "HS ghi nhớ ký hiệu $\\overrightarrow{0}$ và ba quy ước.",
  render: function (host, api) {
    host.appendChild(h("p", "sc-goal", "<b>Mục tiêu:</b> " + this.goal));
    var need = 3, got = 0;
    function one(id) {
      return function (ok) {
        api.log({ ev: "s10-item", id: id, ok: !!ok });
        got++;
        if (got >= need) api.complete();
      };
    }
    host.appendChild(h("div", "sc-sec", "1. Xem video 'Vectơ-không'"));
    videoBlock(host, "V3", api, one("video"));
    host.appendChild(h("div", "sc-sec", "2. Khung kiến thức"));
    host.appendChild(h("div", "sc-def",
      "<b>Vectơ-không:</b> vectơ có điểm đầu và điểm cuối trùng nhau, ký hiệu $\\overrightarrow{0}$ (đọc là 'vectơ-không').<br>" +
      "Độ dài: $\\left|\\overrightarrow{0}\\right| = 0$.<br>" +
      "<b>Quy ước:</b> vectơ-không cùng phương và cùng hướng với mọi vectơ."));
    runQuiz(host, "S10-E1", { onDone: one("e1") });
    runQuiz(host, "S10-E2", { onDone: one("e2") });
  }
},
/* ---------------- S11 ---------------- */
{
  id: "S11", title: "Đấu trí: đúng hay sai, vì sao",
  bloom: "Đánh giá", mins: 5,
  goal: "HS tranh luận, phản biện các mệnh đề dễ nhầm; bảo vệ ý kiến bằng định nghĩa.",
  render: function (host, api) {
    host.appendChild(h("p", "sc-goal", "<b>Mục tiêu:</b> " + this.goal));
    host.appendChild(h("p", "", "Em đọc từng mệnh đề, chọn Đúng/Sai. Chùm 4 mệnh đề được chấm theo Công văn 7991 (đúng 1→0,1đ; 2→0,25đ; 3→0,5đ; 4→1,0đ). Sau đó em viết một câu giải thích cho mệnh đề khó nhất."));
    var need = 2, got = 0;
    function one() {
      return function () {
        got++;
        if (got >= need) api.complete();
      };
    }
    runQuiz(host, "S11-TF", { onDone: one() });
    runQuiz(host, "S11-E", { onDone: one() });
  }
},
/* ---------------- S12 ---------------- */
{
  id: "S12", title: "Vận dụng thực tế và dự án sáng tạo",
  bloom: "Sáng tạo", mins: 8,
  goal: "HS thấy vectơ trong đời sống; tự thiết kế một tình huống dùng vectơ.",
  render: function (host, api) {
    host.appendChild(h("p", "sc-goal", "<b>Mục tiêu:</b> " + this.goal));
    host.appendChild(h("div", "sc-sec", "1. Vectơ quanh em"));
    host.appendChild(h("div", "sc-def",
      "Trong sách giáo khoa, vectơ xuất hiện ở nhiều nơi:<br>" +
      "• <b>Lực kéo:</b> có điểm đặt, có hướng kéo và có độ lớn.<br>" +
      "• <b>Hướng gió:</b> thổi theo hướng nào, mạnh bao nhiêu.<br>" +
      "• <b>Vận tốc:</b> xe chạy hướng nào, nhanh bao nhiêu."));
    var need = 3, got = 0;
    function one(id) {
      return function () {
        api.log({ ev: "s12-item", id: id });
        got++;
        if (got >= need) api.complete();
      };
    }
    runQuiz(host, "S12-E1", { onDone: one("e1") });
    runQuiz(host, "S12-E2", { onDone: one("e2") });
    host.appendChild(h("div", "sc-sec", "2. Dự án sáng tạo của nhóm em"));
    host.appendChild(h("p", "", "Mỗi nhóm vẽ một sơ đồ có ít nhất 3 vectơ (ví dụ: hành trình đi học, đường bay), ghi chú điểm đầu, điểm cuối và cặp vectơ bằng nhau. Lớp sẽ triển lãm và bình chọn sơ đồ rõ nhất."));
    runQuiz(host, "S12-PJ", { onDone: one("pj") });
  }
},
/* ---------------- S13 ---------------- */
{
  id: "S13", title: "Kiểm tra tổng hợp",
  bloom: "Nhớ → Vận dụng", mins: 9,
  goal: "Kiểm tra cả 3 trọng tâm; ngưỡng đạt 80/100 điểm.",
  render: function (host, api) {
    host.appendChild(h("p", "sc-goal", "<b>Mục tiêu:</b> " + this.goal));
    host.appendChild(h("p", "", "Bài kiểm tra có 8 câu, 100 điểm, 10 phút. Em cần đạt từ 80 điểm. Mỗi câu chỉ làm một lần."));
    host.appendChild(figS08());
    var timerBox = h("p", "", "⏱ Thời gian còn lại: <b>10:00</b>");
    host.appendChild(timerBox);
    var qHost = h("div", "");
    host.appendChild(qHost);

    var idx = 0, score = 0, results = [];
    var total = TEST13.length;
    var remain = TEST13_TIME_MIN * 60;
    var timer = setInterval(function () {
      remain--;
      var mm = Math.floor(remain / 60), ss = remain % 60;
      timerBox.innerHTML = "⏱ Thời gian còn lại: <b>" + mm + ":" + (ss < 10 ? "0" : "") + ss + "</b>";
      if (remain <= 0) finish(true);
    }, 1000);
    /* Dọn timer khi rời chặng (chống rò rỉ sang chặng sau) */
    (global.__sceneCleanup = global.__sceneCleanup || []).push(function () { clearInterval(timer); });

    function next() {
      if (idx >= total) { finish(false); return; }
      var id = TEST13[idx];
      var title = h("p", "", "<b>Câu " + (idx + 1) + "/" + total + "</b> (" + QBANK[id].pts + " điểm)");
      qHost.appendChild(title);
      runQuiz(qHost, id, {
        once: true,
        onDone: function (ok, pts) {
          score += pts;
          results.push({ id: id, ok: !!ok, pts: pts, max: QBANK[id].pts });
          api.log({ ev: "test13-q", id: id, ok: !!ok, pts: pts });
          idx++;
          next();
        }
      });
      qHost.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    var finished = false;
    function finish(timeout) {
      if (finished) return;
      finished = true;
      clearInterval(timer);
      qHost.innerHTML = "";
      var pass = score >= TEST13_PASS;
      var box = h("div", "sc-def",
        "<b>Kết quả: " + score + "/100 điểm — " +
        (pass ? "<span class='qz-ok-t'>ĐẠT ✓</span>" : "<span class='qz-bad-t'>CHƯA ĐẠT</span>") + "</b>" +
        (timeout ? "<br><i>Hết giờ.</i>" : ""));
      host.appendChild(box);
      host.appendChild(h("div", "sc-sec", "Xem lại từng câu"));
      results.forEach(function (r, i) {
        var row = h("p", "", "Câu " + (i + 1) + ": " +
          (r.ok ? "<span class='qz-ok-t'>✓</span>" : "<span class='qz-bad-t'>✗</span>") +
          " " + r.pts + "/" + r.max + " điểm ");
        var rv = QBANK[r.id].review;
        if (!r.ok && rv) {
          if (api.gotoScene) {
            var b = h("button", "qz-btn", "Ôn lại chặng " + rv);
            b.type = "button";
            b.onclick = function () { api.gotoScene(rv); };
            row.appendChild(b);
          } else {
            row.appendChild(h("span", "sc-note", " — em nên ôn lại chặng " + rv));
          }
        }
        host.appendChild(row);
      });
      api.log({ ev: "test13-done", score: score, pass: pass });
      api.complete();
    }
    next();
  }
},
/* ---------------- S14 ---------------- */
{
  id: "S14", title: "Phản tư khai phóng và vinh danh",
  bloom: "Sáng tạo", mins: 5,
  goal: "HS nhìn lại hành trình khám phá; nhận huy hiệu; hẹn ôn tập.",
  render: function (host, api) {
    host.appendChild(h("p", "sc-goal", "<b>Mục tiêu:</b> " + this.goal));
    host.appendChild(h("div", "sc-sec", "1. Ba câu hỏi phản tư (không chấm điểm)"));
    var need = 3, got = 0;
    function one() {
      return function () {
        got++;
        if (got >= need) {
          host.appendChild(h("div", "sc-sec", "2. Vinh danh"));
          if (api.badges) {
            api.badges(host, { levels: ["Nhà khám phá", "Nhà tranh luận", "Nhà sáng tạo", "Nhà vô địch vectơ"] });
          } else {
            host.appendChild(h("div", "sc-def",
              "Huy hiệu 4 cấp theo mức hoàn thành: Nhà khám phá → Nhà tranh luận → Nhà sáng tạo → Nhà vô địch vectơ."));
          }
          host.appendChild(h("div", "sc-sec", "3. Sơ đồ tổng kết"));
          if (api.mindmap) { api.mindmap(host); }
          else {
            host.appendChild(h("div", "sc-def",
              "<b>Vectơ</b> là đoạn thẳng có hướng ($\\overrightarrow{AB}$; độ dài $\\left|\\overrightarrow{AB}\\right|$).<br>" +
              "• Cùng phương: giá song song hoặc trùng nhau.<br>" +
              "• Cùng hướng / ngược hướng: cùng phương và cùng / ngược chiều mũi tên.<br>" +
              "• Bằng nhau: cùng hướng và cùng độ dài ($\\vec{a} = \\vec{b}$).<br>" +
              "• Vectơ-không $\\overrightarrow{0}$: điểm đầu trùng điểm cuối; độ dài bằng 0; cùng phương, cùng hướng với mọi vectơ."));
          }
          host.appendChild(h("p", "sc-note", "📅 Hẹn em ôn lại bài sau 3 ngày nhé!"));
          api.complete();
        }
      };
    }
    Quiz.predict(host, { q: "Điều gì làm em bất ngờ nhất khi khám phá vectơ hôm nay?", onDone: one() });
    Quiz.predict(host, { q: "Khoảnh khắc 'à ha!' của em là lúc nào?", onDone: one() });
    Quiz.predict(host, { q: "Em còn thắc mắc gì về vectơ?", onDone: one() });
  }
}
];

MORE.forEach(function (s) { global.SCENES.push(s); });
})(window);
