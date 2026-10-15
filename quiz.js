/* ============================================================================
 * quiz.js — Quiz engine 6 dạng theo Công văn 7991 (mcq, truefalse, fill,
 * dragdrop, match, essay) + predict (dự đoán không chấm).
 * Không phụ thuộc thư viện ngoài. Công thức viết dạng $...$ để app.js
 * render KaTeX offline (xem data.js).
 *
 * Các pattern bắt buộc (references/qa-checklist.md mục 1):
 *  - MCQ: xáo trộn Fisher-Yates ĐÚNG 1 lần lúc render; đáp án đúng giữ theo
 *    identity (cờ ok), không theo index.
 *  - Dragdrop: zone.accept là chuỗi id nối dấu phẩy ("c0,c1"); kiểm tra bằng
 *    String(accept).split(",").includes(cardId).
 *  - Essay: callback onDone(ok, pts); đáp án mẫu truyền bằng field `model:`.
 *  - Fill số thập phân: thêm `tol` + 1e-9 chống sai số float ở biên.
 * ========================================================================== */
(function (global) {
"use strict";

/* ---------- tiện ích ---------- */
function h(tag, cls, html) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}
function stripTags(s) {
  return String(s).replace(/<[^>]*>/g, "").replace(/\$/g, "");
}
/* Fisher-Yates: xáo trộn đúng 1 lần lúc render */
function shuffle(a) {
  for (var i = a.length - 1; i > 0; i--) {
    var j = (Math.random() * (i + 1)) | 0;
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}
var cssDone = false;
function css() {
  if (cssDone) return; cssDone = true;
  var s = document.createElement("style");
  s.textContent = [
    ".qz{margin:14px 0;padding:14px;border:1px solid #d7dee8;border-radius:12px;background:#fff;}",
    ".qz-q{font-weight:600;margin-bottom:10px;line-height:1.5;}",
    ".qz-opts{display:grid;gap:8px;}",
    ".qz-opt{text-align:left;padding:10px 12px;border:1.5px solid #c9d4e2;border-radius:10px;background:#f8fbff;cursor:pointer;font-size:16px;}",
    ".qz-opt:hover{border-color:#2f7fe0;}",
    ".qz-opt:disabled{cursor:default;opacity:.85;}",
    ".qz-ok{border-color:#1d9d55 !important;background:#e9f9ef !important;}",
    ".qz-bad{border-color:#d64545 !important;background:#fdeeee !important;}",
    ".qz-note{margin-top:10px;padding:10px;border-radius:10px;background:#f2f7ff;border-left:4px solid #2f7fe0;line-height:1.5;}",
    ".qz-tf-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px dashed #e3e9f2;}",
    ".qz-tf-row .tx{flex:1;line-height:1.5;}",
    ".qz-tf-btns{display:flex;gap:6px;}",
    ".qz-tf-btns button{padding:8px 14px;border-radius:8px;border:1.5px solid #c9d4e2;background:#f8fbff;cursor:pointer;font-size:15px;}",
    ".qz-tf-btns button.sel-d{border-color:#1d9d55;background:#e9f9ef;}",
    ".qz-tf-btns button.sel-s{border-color:#d64545;background:#fdeeee;}",
    ".qz-input{width:100%;max-width:420px;padding:10px 12px;font-size:16px;border:1.5px solid #c9d4e2;border-radius:10px;}",
    ".qz-area{width:100%;min-height:90px;padding:10px 12px;font-size:16px;border:1.5px solid #c9d4e2;border-radius:10px;font-family:inherit;}",
    ".qz-btn{margin-top:10px;padding:10px 20px;border:none;border-radius:10px;background:#2f7fe0;color:#fff;font-size:16px;cursor:pointer;}",
    ".qz-btn:disabled{background:#9db6d8;cursor:default;}",
    ".qz-cards{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0;}",
    ".qz-card{padding:10px 14px;border:2px solid #2f7fe0;border-radius:10px;background:#eaf2fd;cursor:pointer;font-size:16px;}",
    ".qz-card.sel{outline:3px solid #f5a623;}",
    ".qz-card.placed{opacity:.45;cursor:default;}",
    ".qz-zones{display:grid;gap:10px;margin-top:8px;}",
    ".qz-zone{min-height:56px;padding:10px;border:2px dashed #9db6d8;border-radius:10px;background:#fbfdff;}",
    ".qz-zone .zl{font-weight:600;margin-bottom:6px;}",
    ".qz-zone .zc{font-size:15px;color:#33475f;}",
    ".qz-ok-t{color:#1d9d55;font-weight:700;}",
    ".qz-bad-t{color:#d64545;font-weight:700;}",
    ".qz-model{margin-top:10px;padding:12px;border-radius:10px;background:#fff8e6;border:1px solid #f0d48a;line-height:1.6;}",
    ".qz-rubric{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;}",
    ".qz-rubric button{padding:8px 14px;border-radius:8px;border:1.5px solid #c9d4e2;background:#fff;cursor:pointer;}",
    ".qz-match-cols{display:flex;gap:14px;flex-wrap:wrap;}",
    ".qz-match-col{display:grid;gap:8px;flex:1;min-width:160px;}",
    ".qz-mitem{padding:10px 12px;border:1.5px solid #c9d4e2;border-radius:10px;background:#f8fbff;cursor:pointer;}",
    ".qz-mitem.sel{outline:3px solid #f5a623;}",
    ".qz-mitem.linked{opacity:.5;cursor:default;}",
    ".qz-links{margin-top:8px;font-size:15px;line-height:1.7;}"
  ].join("\n");
  document.head.appendChild(s);
}
function note(box, html, ok) {
  var n = h("div", "qz-note", (ok === true ? "✓ " : ok === false ? "✗ " : "") + html);
  box.appendChild(n);
  return n;
}
function ptsOf(cfg, dflt) { return (cfg && typeof cfg.pts === "number") ? cfg.pts : dflt; }

/* Chấm Đúng/Sai theo Công văn 7991.
 * n = 4 mệnh đề: 1 đúng→0.1, 2 đúng→0.25, 3 đúng→0.5, 4 đúng→1.0.
 * n khác 4: tỉ lệ tuyến tính k/n. */
function tfFraction(n, k) {
  if (n === 4) return [0, 0.1, 0.25, 0.5, 1.0][k] || 0;
  return n ? k / n : 0;
}

var Quiz = {};

/* ---------- MCQ: cfg {q, options:[{t, ok}], pts, explain, once, onDone(ok,pts)} ---------- */
Quiz.mcq = function (host, cfg) {
  css();
  var box = h("div", "qz qz-mcq");
  box.appendChild(h("div", "qz-q", cfg.q));
  var list = h("div", "qz-opts");
  box.appendChild(list);
  host.appendChild(box);

  /* identity: đáp án đúng giữ theo cờ ok, xáo trộn 1 lần lúc render */
  var opts = cfg.options.map(function (o) { return { t: o.t, ok: !!o.ok }; });
  shuffle(opts);

  var resolved = false;
  function lock() {
    var bs = list.querySelectorAll("button");
    for (var i = 0; i < bs.length; i++) bs[i].disabled = true;
  }
  opts.forEach(function (o) {
    var b = h("button", "qz-opt", o.t);
    b.type = "button";
    b.setAttribute("aria-label", "Phương án: " + stripTags(o.t));
    b.onclick = function () {
      if (resolved) return;
      if (o.ok) {
        b.classList.add("qz-ok");
        resolved = true; lock();
        note(box, (cfg.explainOk || "Chính xác!"), true);
        if (cfg.explain) note(box, cfg.explain);
        if (cfg.onDone) cfg.onDone(true, ptsOf(cfg, 1));
      } else {
        /* sai: chỉ disable đúng button đã click, KHÔNG xáo trộn lại */
        b.classList.add("qz-bad");
        b.disabled = true;
        note(box, (cfg.explainNo || "Chưa đúng. Em thử lại nhé."), false);
        if (cfg.once) {
          resolved = true; lock();
          /* hiện đáp án đúng */
          var bs = list.querySelectorAll("button");
          void bs;
          if (cfg.onDone) cfg.onDone(false, 0);
        }
      }
    };
    list.appendChild(b);
  });
  return box;
};

/* ---------- Đúng/Sai chùm: cfg {q, props:[{t, answer}], pts, once, onDone(ok,pts)} ---------- */
Quiz.truefalse = function (host, cfg) {
  css();
  var box = h("div", "qz qz-tf");
  box.appendChild(h("div", "qz-q", cfg.q));
  host.appendChild(box);
  var n = cfg.props.length;
  var picks = new Array(n).fill(null);
  var btns = [], rows = [];
  cfg.props.forEach(function (p, i) {
    var row = h("div", "qz-tf-row");
    row.appendChild(h("div", "tx", (i + 1) + ". " + p.t));
    var wrap = h("div", "qz-tf-btns");
    var bD = h("button", "", "Đúng"); bD.type = "button";
    var bS = h("button", "", "Sai"); bS.type = "button";
    bD.onclick = function () { picks[i] = true; bD.className = "sel-d"; bS.className = ""; };
    bS.onclick = function () { picks[i] = false; bS.className = "sel-s"; bD.className = ""; };
    wrap.appendChild(bD); wrap.appendChild(bS);
    row.appendChild(wrap);
    box.appendChild(row);
    btns.push([bD, bS]);
    rows.push(row);
  });
  var btn = h("button", "qz-btn", "Chấm bài");
  btn.type = "button";
  box.appendChild(btn);
  var resolved = false;
  btn.onclick = function () {
    if (resolved) return;
    for (var i = 0; i < n; i++) {
      if (picks[i] === null) { note(box, "Em hãy chọn Đúng/Sai cho mọi mệnh đề.", false); return; }
    }
    resolved = true; btn.disabled = true;
    var k = 0, i2;
    for (i2 = 0; i2 < n; i2++) {
      var good = (picks[i2] === !!cfg.props[i2].answer);
      if (good) k++;
      var mark = h("span", "", good ? " <span class='qz-ok-t'>✓</span>" : " <span class='qz-bad-t'>✗</span>");
      var txEl = rows[i2].querySelector(".tx");
      if (txEl) txEl.appendChild(mark);
      btns[i2][0].disabled = true; btns[i2][1].disabled = true;
    }
    var frac = tfFraction(n, k);
    var pts = Math.round(ptsOf(cfg, n) * frac * 100) / 100;
    note(box, "Em đúng " + k + "/" + n + " mệnh đề.", k === n);
    if (cfg.explain) note(box, cfg.explain);
    if (cfg.once && cfg.showAnswers) { /* đáp án đã hiện bằng ✓/✗ từng mệnh đề */ }
    if (cfg.onDone) cfg.onDone(k === n, pts);
  };
  return box;
};

/* ---------- Điền khuyết: cfg {q, answer, accept[], tol, unit, once, onDone(ok,pts)} ---------- */
function parseNum(s) {
  if (s == null) return NaN;
  var t = String(s).trim().replace(",", ".");
  var m = t.match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : NaN;
}
function normStr(s) {
  return String(s).toLowerCase().replace(/\s+/g, " ").trim();
}
Quiz.fill = function (host, cfg) {
  css();
  var box = h("div", "qz qz-fill");
  box.appendChild(h("div", "qz-q", cfg.q));
  var inp = h("input", "qz-input");
  inp.type = "text";
  inp.setAttribute("aria-label", "Ô trả lời");
  box.appendChild(inp);
  if (cfg.hint) box.appendChild(h("div", "sc-note", cfg.hint));
  var btn = h("button", "qz-btn", "Trả lời");
  btn.type = "button";
  box.appendChild(btn);
  host.appendChild(box);
  var resolved = false;
  function check() {
    if (resolved) return;
    var ok;
    if (typeof cfg.answer === "number") {
      var v = parseNum(inp.value);
      /* tol + 1e-9 chống sai số float ở biên */
      ok = !isNaN(v) && Math.abs(v - cfg.answer) <= (cfg.tol || 0) + 1e-9;
    } else {
      var cands = [cfg.answer].concat(cfg.accept || []).map(normStr);
      ok = cands.indexOf(normStr(inp.value)) !== -1;
    }
    if (ok) {
      resolved = true; inp.disabled = true; btn.disabled = true;
      note(box, "Chính xác!" + (cfg.unit ? " (" + cfg.unit + ")" : ""), true);
      if (cfg.explain) note(box, cfg.explain);
      if (cfg.onDone) cfg.onDone(true, ptsOf(cfg, 1));
    } else {
      note(box, cfg.explainNo || "Chưa đúng. Em thử lại nhé.", false);
      if (cfg.once) {
        resolved = true; inp.disabled = true; btn.disabled = true;
        if (cfg.onDone) cfg.onDone(false, 0);
      }
    }
  }
  btn.onclick = check;
  inp.onkeydown = function (e) { if (e.key === "Enter") check(); };
  return box;
};

/* ---------- Kéo thả: cfg {q, cards:[{id,t}], zones:[{id,label,accept}], once, onDone(ok,pts)} ----------
 * accept: chuỗi id nối dấu phẩy, vd "c0,c1". Kiểm tra bằng split(",").includes(). */
Quiz.dragdrop = function (host, cfg) {
  css();
  var box = h("div", "qz qz-dd");
  box.appendChild(h("div", "qz-q", cfg.q));
  host.appendChild(box);

  var cardWrap = h("div", "qz-cards");
  box.appendChild(cardWrap);
  var zoneWrap = h("div", "qz-zones");
  box.appendChild(zoneWrap);

  var selected = null;
  var placement = {}; /* zoneId -> [cardId] */
  var cardEls = {};

  cfg.cards.forEach(function (c) {
    var el = h("div", "qz-card", c.t);
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("aria-label", "Thẻ: " + stripTags(c.t));
    el.dataset.cid = c.id;
    function pick() {
      if (el.classList.contains("placed")) return;
      if (selected) selected.classList.remove("sel");
      selected = el; el.classList.add("sel");
    }
    el.onclick = pick;
    el.onkeydown = function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } };
    /* HTML5 drag & drop */
    el.draggable = true;
    el.ondragstart = function (e) { e.dataTransfer.setData("text/plain", c.id); };
    cardWrap.appendChild(el);
    cardEls[c.id] = el;
  });

  var zoneEls = {};
  cfg.zones.forEach(function (z) {
    placement[z.id] = [];
    var zel = h("div", "qz-zone");
    zel.appendChild(h("div", "zl", z.label));
    var zc = h("div", "zc", "—");
    zel.appendChild(zc);
    function drop(cardId) {
      var el = cardEls[cardId];
      if (!el || el.classList.contains("placed")) return;
      placement[z.id].push(cardId);
      el.classList.add("placed"); el.classList.remove("sel");
      if (selected === el) selected = null;
      zc.innerHTML = placement[z.id].map(function (id) { return cardEls[id].innerHTML; }).join(" · ");
    }
    zel.onclick = function () { if (selected) drop(selected.dataset.cid); };
    zel.ondragover = function (e) { e.preventDefault(); };
    zel.ondrop = function (e) { e.preventDefault(); drop(e.dataTransfer.getData("text/plain")); };
    zoneWrap.appendChild(zel);
    zoneEls[z.id] = { el: zel, cfg: z, content: zc };
  });

  var btn = h("button", "qz-btn", "Kiểm tra");
  btn.type = "button";
  box.appendChild(btn);
  var resolved = false;
  btn.onclick = function () {
    if (resolved) return;
    var total = cfg.cards.length, placed = 0;
    Object.keys(placement).forEach(function (zid) { placed += placement[zid].length; });
    if (placed < total) { note(box, "Em hãy đặt hết các thẻ vào ô.", false); return; }
    resolved = true; btn.disabled = true;
    var good = 0, totalZones = cfg.zones.length;
    cfg.zones.forEach(function (z) {
      var ids = placement[z.id];
      /* accept đa-id: chuỗi nối dấu phẩy → split(",").includes() */
      var accepts = String(z.accept).split(",").map(function (s) { return s.trim(); });
      var okZone = ids.length === accepts.length &&
        ids.every(function (id) { return accepts.includes(id); });
      if (okZone) good++;
      var mark = h("div", "", okZone
        ? "<span class='qz-ok-t'>✓ Đúng</span>"
        : "<span class='qz-bad-t'>✗ Chưa đúng</span>");
      zoneEls[z.id].el.appendChild(mark);
    });
    var allOk = good === totalZones;
    if (allOk) {
      note(box, "Chính xác! Tất cả các thẻ đều đúng chỗ.", true);
      if (cfg.onDone) cfg.onDone(true, ptsOf(cfg, 1));
    } else {
      note(box, "Có ô chưa đúng. Em xem lại rồi làm lại nhé.", false);
      if (cfg.once) { if (cfg.onDone) cfg.onDone(false, 0); }
      else { resolved = false; btn.disabled = false; }
    }
  };
  return box;
};

/* ---------- Ghép đôi: cfg {q, pairs:[[leftId,rightId]...], left:[{id,t}], right:[{id,t}], once, onDone} ---------- */
Quiz.match = function (host, cfg) {
  css();
  var box = h("div", "qz qz-match");
  box.appendChild(h("div", "qz-q", cfg.q));
  host.appendChild(box);
  var cols = h("div", "qz-match-cols");
  var colL = h("div", "qz-match-col"), colR = h("div", "qz-match-col");
  cols.appendChild(colL); cols.appendChild(colR);
  box.appendChild(cols);
  var linksBox = h("div", "qz-links");
  box.appendChild(linksBox);

  var left = cfg.left.slice(), right = shuffle(cfg.right.slice());
  var selL = null, links = {}; /* leftId -> rightId */
  var lEls = {}, rEls = {};
  left.forEach(function (it) {
    var e = h("div", "qz-mitem", it.t);
    e.setAttribute("tabindex", "0"); e.setAttribute("role", "button");
    e.onclick = function () {
      if (e.classList.contains("linked")) return;
      if (selL) selL.classList.remove("sel");
      selL = e; e.classList.add("sel");
    };
    colL.appendChild(e); lEls[it.id] = e;
  });
  right.forEach(function (it) {
    var e = h("div", "qz-mitem", it.t);
    e.setAttribute("tabindex", "0"); e.setAttribute("role", "button");
    e.onclick = function () {
      if (e.classList.contains("linked") || !selL) return;
      var lid = null;
      Object.keys(lEls).forEach(function (k) { if (lEls[k] === selL) lid = k; });
      links[lid] = it.id;
      selL.classList.add("linked"); selL.classList.remove("sel");
      e.classList.add("linked");
      selL = null;
      renderLinks();
    };
    colR.appendChild(e); rEls[it.id] = e;
  });
  function nameOf(map, id) {
    for (var i = 0; i < map.length; i++) if (map[i].id === id) return stripTags(map[i].t);
    return id;
  }
  function renderLinks() {
    linksBox.innerHTML = Object.keys(links).map(function (lid) {
      return "• " + nameOf(cfg.left, lid) + " ↔ " + nameOf(cfg.right, links[lid]);
    }).join("<br>");
  }
  var btn = h("button", "qz-btn", "Kiểm tra");
  btn.type = "button"; box.appendChild(btn);
  var resolved = false;
  btn.onclick = function () {
    if (resolved) return;
    if (Object.keys(links).length < cfg.pairs.length) {
      note(box, "Em hãy ghép hết các cặp.", false); return;
    }
    resolved = true; btn.disabled = true;
    var goodMap = {};
    cfg.pairs.forEach(function (p) { goodMap[p[0]] = p[1]; });
    var k = 0;
    Object.keys(links).forEach(function (lid) { if (goodMap[lid] === links[lid]) k++; });
    var allOk = k === cfg.pairs.length;
    note(box, "Em ghép đúng " + k + "/" + cfg.pairs.length + " cặp.", allOk);
    if (allOk) { if (cfg.onDone) cfg.onDone(true, ptsOf(cfg, 1)); }
    else if (cfg.once) { if (cfg.onDone) cfg.onDone(false, 0); }
    else { resolved = false; btn.disabled = false; }
  };
  return box;
};

/* ---------- Tự luận tự đánh giá: cfg {q, model, rubric[3], pts, onDone(ok,pts)} ----------
 * Chữ ký callback: (ok, pts). Đáp án mẫu truyền bằng field `model:`. */
Quiz.essay = function (host, cfg) {
  css();
  var box = h("div", "qz qz-essay");
  box.appendChild(h("div", "qz-q", cfg.q));
  var ta = h("textarea", "qz-area", "");
  ta.setAttribute("aria-label", "Ô viết câu trả lời");
  ta.placeholder = "Em viết câu trả lời của mình ở đây...";
  box.appendChild(ta);
  var btn = h("button", "qz-btn", "Nộp bài và tự chấm");
  btn.type = "button";
  box.appendChild(btn);
  host.appendChild(box);
  var resolved = false;
  btn.onclick = function () {
    if (resolved) return;
    if (!ta.value.trim()) { note(box, "Em hãy viết câu trả lời trước khi nộp.", false); return; }
    resolved = true; ta.disabled = true; btn.disabled = true;
    var m = h("div", "qz-model", "<b>Đáp án mẫu:</b><br>" + cfg.model);
    box.appendChild(m);
    box.appendChild(h("div", "", "<b>Em tự chấm trung thực:</b>"));
    var rub = h("div", "qz-rubric");
    var levels = cfg.rubric || ["Đúng ý chính", "Đúng một phần", "Chưa đúng"];
    var fracs = [1, 0.5, 0];
    levels.forEach(function (lv, i) {
      var b = h("button", "", lv); b.type = "button";
      b.onclick = function () {
        var p = Math.round(ptsOf(cfg, 1) * fracs[i] * 100) / 100;
        var rb = rub.querySelectorAll("button");
        for (var j = 0; j < rb.length; j++) rb[j].disabled = true;
        note(box, "Đã ghi nhận tự chấm: " + lv + ".", fracs[i] === 1);
        if (cfg.onDone) cfg.onDone(fracs[i] > 0, p); /* chữ ký (ok, pts) */
      };
      rub.appendChild(b);
    });
    box.appendChild(rub);
  };
  return box;
};

/* ---------- Dự đoán (không chấm): cfg {q, placeholder, samples[], onDone(text)} ---------- */
Quiz.predict = function (host, cfg) {
  css();
  var box = h("div", "qz qz-predict");
  box.appendChild(h("div", "qz-q", cfg.q));
  var ta = h("textarea", "qz-area", "");
  ta.placeholder = cfg.placeholder || "Em viết dự đoán của mình... Mọi ý kiến đều được tôn trọng.";
  ta.setAttribute("aria-label", "Ô nhập dự đoán");
  box.appendChild(ta);
  var btn = h("button", "qz-btn", "Gửi dự đoán");
  btn.type = "button";
  box.appendChild(btn);
  host.appendChild(box);
  btn.onclick = function () {
    ta.disabled = true; btn.disabled = true;
    note(box, "✓ Cảm ơn em! Dự đoán của em đã được ghi nhận.", true);
    if (cfg.samples && cfg.samples.length) {
      note(box, "<b>Một số ý kiến của các bạn:</b><br>• " + cfg.samples.join("<br>• "));
    }
    if (cfg.onDone) cfg.onDone(ta.value.trim());
  };
  return box;
};

global.Quiz = Quiz;
})(window);
