/* ============================================================================
 * data.js — Bank câu hỏi + timeline quiz video + cấu hình Lab.
 * Quy ước công thức: viết LaTeX trong $...$ (KaTeX offline do app.js render).
 * Chuẩn công thức SGK: \\overrightarrow{AB}, \\left|\\overrightarrow{AB}\\right|,
 * \\overrightarrow{0}, \\vec{a} = \\vec{b}. Bài này chỉ dùng từ "định nghĩa".
 * Câu hỏi ≤ 20 từ, mỗi câu một ý, không lặp ý giữa các chặng.
 * ========================================================================== */

/* ---------------- BANK CÂU HỎI ---------------- */
var QBANK = {

/* ===== S02 — Phòng khởi động: 3 trạm ôn nền ===== */
"S02-T1": { type: "mcq", pts: 1,
  q: "Ký hiệu đúng của đoạn thẳng nối hai điểm $A$, $B$ là gì?",
  options: [
    { t: "$AB$", ok: true },
    { t: "$BA$", ok: false },
    { t: "$\\overrightarrow{AB}$", ok: false },
    { t: "$\\vec{a}$", ok: false }
  ],
  explain: "Đoạn thẳng nối $A$, $B$ ký hiệu là $AB$. Ký hiệu $\\overrightarrow{AB}$ là vectơ, có hướng." },

"S02-T2": { type: "mcq", pts: 1,
  q: "Em đo được đoạn thẳng $AB$ dài 5 cm. Độ dài của $AB$ bằng bao nhiêu?",
  options: [
    { t: "$5\\,\\mathrm{cm}$", ok: true },
    { t: "$5$", ok: false },
    { t: "$10\\,\\mathrm{cm}$", ok: false },
    { t: "$2{,}5\\,\\mathrm{cm}$", ok: false }
  ],
  explain: "Thước chỉ 5 cm nên độ dài của $AB$ bằng $5\\,\\mathrm{cm}$." },

"S02-T3": { type: "mcq", pts: 1,
  q: "Đoạn thẳng $AB$ và đoạn thẳng $BA$ có khác nhau không?",
  options: [
    { t: "Không", ok: true },
    { t: "Có", ok: false }
  ],
  explain: "Đoạn thẳng không có hướng nên $AB$ và $BA$ là một. Vectơ thì khác — em sẽ thấy ở chặng sau." },

/* ===== S03 — Lab 1: cấu hình nội dung (cơ chế Lab do lab agent cung cấp) ===== */
"S03-OBS1": { q: "Em xoay $B$ quanh $A$. Độ dài có đổi không?", a: "Không đổi." },
"S03-OBS2": { q: "Em giữ nguyên độ dài, đổi hướng mũi tên. Vectơ có đổi không?",
  a: "Đổi. Điểm đầu và điểm cuối đổi vai trò cho nhau." },
"S03-FILL": { type: "fill", pts: 1,
  q: "Vectơ $\\overrightarrow{AB}$ là đoạn thẳng có hướng. Điểm ____ là điểm đầu, điểm ____ là điểm cuối.",
  hint: "Viết 2 chữ cái, cách nhau bằng dấu phẩy.",
  answer: "A, B", accept: ["a, b", "A,B", "A B"] },

/* ===== S04 — Chốt khái niệm ===== */
"S04-DD": { type: "dragdrop", pts: 2,
  q: "Kéo mỗi mảnh vào đúng vị trí trong khung định nghĩa.",
  cards: [
    { id: "c0", t: "đoạn thẳng có hướng" },
    { id: "c1", t: "$\\overrightarrow{AB}$" },
    { id: "c2", t: "điểm $A$" },
    { id: "c3", t: "điểm $B$" }
  ],
  zones: [
    { id: "z0", label: "Vectơ là ___", accept: "c0" },
    { id: "z1", label: "Ký hiệu: ___", accept: "c1" },
    { id: "z2", label: "Điểm đầu: ___", accept: "c2" },
    { id: "z3", label: "Điểm cuối: ___", accept: "c3" }
  ] },

"S04-E1": { type: "essay", pts: 2,
  q: "Em hãy phát biểu định nghĩa vectơ bằng lời của mình.",
  model: "Vectơ là đoạn thẳng có hướng. Điểm $A$ là điểm đầu, điểm $B$ là điểm cuối." },

"S04-M1": { type: "mcq", pts: 1,
  q: "Vectơ $\\overrightarrow{AB}$ và vectơ $\\overrightarrow{BA}$ có giống nhau không? Vì sao?",
  options: [
    { t: "Không, vì chúng ngược hướng nhau", ok: true },
    { t: "Có, vì chúng dài bằng nhau", ok: false },
    { t: "Không, vì chúng không cùng độ dài", ok: false }
  ],
  explain: "$\\overrightarrow{AB}$ đi từ $A$ đến $B$, còn $\\overrightarrow{BA}$ đi từ $B$ đến $A$: ngược hướng nhau." },

"S04-M2": { type: "mcq", pts: 1,
  q: "Độ dài của vectơ $\\overrightarrow{AB}$ ký hiệu thế nào?",
  options: [
    { t: "$\\left|\\overrightarrow{AB}\\right|$", ok: true },
    { t: "$\\overrightarrow{AB}$", ok: false },
    { t: "$AB$", ok: false },
    { t: "$|AB|$", ok: false }
  ],
  explain: "Độ dài của vectơ $\\overrightarrow{AB}$ ký hiệu là $\\left|\\overrightarrow{AB}\\right|$." },

/* ===== S05 — Luyện tập: nhận diện vectơ (hình figS05) ===== */
"S05-T1": { type: "mcq", pts: 2,
  q: "Trong hình, điểm nào là điểm đầu của vectơ $\\overrightarrow{MN}$?",
  options: [
    { t: "$M$", ok: true },
    { t: "$N$", ok: false }
  ],
  explain: "Mũi tên chỉ vào $N$ nên $M$ là điểm đầu, $N$ là điểm cuối." },

"S05-T2": { type: "truefalse", pts: 2,
  q: "Xét tính đúng sai của các mệnh đề sau:",
  props: [
    { t: "Vectơ $\\overrightarrow{AB}$ luôn dài hơn vectơ $\\overrightarrow{BA}$.", answer: false },
    { t: "Độ dài của $\\overrightarrow{AB}$ bằng độ dài của $\\overrightarrow{BA}$.", answer: true }
  ],
  explain: "Đổi hướng không đổi độ dài: $\\left|\\overrightarrow{AB}\\right| = \\left|\\overrightarrow{BA}\\right|$." },

"S05-T3": { type: "fill", pts: 2,
  q: "Trong hình, độ dài của vectơ $\\overrightarrow{CD}$ bằng bao nhiêu xăng-ti-mét? (Dùng thước trên hình để đo)",
  answer: 4, tol: 0.05, unit: "cm",
  explain: "Đặt thước: $C$ ở vạch 0, $D$ ở vạch 4 nên $\\left|\\overrightarrow{CD}\\right| = 4\\,\\mathrm{cm}$." },

"S05-T4": { type: "dragdrop", pts: 2,
  q: "Kéo nhãn 'điểm đầu' và 'điểm cuối' vào đúng vị trí của vectơ $\\overrightarrow{PQ}$ trong hình.",
  cards: [
    { id: "c0", t: "điểm đầu" },
    { id: "c1", t: "điểm cuối" }
  ],
  zones: [
    { id: "z0", label: "Vị trí điểm $P$", accept: "c0" },
    { id: "z1", label: "Vị trí điểm $Q$", accept: "c1" }
  ] },

/* ===== S06 — Lab 2: cấu hình nội dung ===== */
"S06-OBS1": { q: "Hai giá song song thì hai vectơ thế nào?", a: "Cùng phương." },
"S06-OBS2": { q: "Hai giá trùng nhau thì hai vectơ thế nào?", a: "Cũng cùng phương." },
"S06-OBS3": { q: "Cùng phương, cùng chiều mũi tên, độ dài bằng nhau thì hai vectơ thế nào?", a: "Bằng nhau." },
"S06-FILL": { type: "fill", pts: 1,
  q: "Hai vectơ cùng phương khi giá của chúng ____ hoặc ____. (Viết hai cụm từ, cách nhau bằng dấu phẩy)",
  answer: "song song, trùng nhau", accept: ["song song,trùng nhau", "song song, trùng"] },

/* ===== S07 — Chốt: cùng hướng, ngược hướng, bằng nhau ===== */
"S07-DD": { type: "dragdrop", pts: 2,
  q: "Kéo mỗi mảnh vào đúng vị trí trong khung kiến thức.",
  cards: [
    { id: "c0", t: "cùng hướng" },
    { id: "c1", t: "cùng độ dài" },
    { id: "c2", t: "$\\vec{a} = \\vec{b}$" }
  ],
  zones: [
    { id: "z0", label: "Hai vectơ bằng nhau khi chúng ___", accept: "c0" },
    { id: "z1", label: "và có ___", accept: "c1" },
    { id: "z2", label: "Ký hiệu: ___", accept: "c2" }
  ] },

"S07-E1": { type: "essay", pts: 2,
  q: "Vì sao hai vectơ cùng phương chưa chắc đã bằng nhau?",
  model: "Vì muốn bằng nhau còn phải cùng hướng và cùng độ dài. Cùng phương mới chỉ là điều kiện cần." },

"S07-E2": { type: "essay", pts: 2,
  q: "Vectơ $\\vec{a}$ ngược hướng với $\\vec{b}$, độ dài bằng nhau. Ký hiệu thế nào?",
  model: "Không có ký hiệu riêng cho trường hợp này. Ta chỉ nói $\\vec{a}$ và $\\vec{b}$ ngược hướng nhau." },

/* ===== S08 — Luyện tập: phân loại vectơ (hình figS08) ===== */
"S08-T1": { type: "mcq", pts: 2,
  q: "Cặp nào sau đây là hai vectơ cùng phương?",
  options: [
    { t: "$\\overrightarrow{AB}$ và $\\overrightarrow{EF}$", ok: true },
    { t: "$\\overrightarrow{AB}$ và $\\overrightarrow{GH}$", ok: false },
    { t: "$\\overrightarrow{CD}$ và $\\overrightarrow{GH}$", ok: false },
    { t: "$\\overrightarrow{EF}$ và $\\overrightarrow{GH}$", ok: false }
  ],
  explain: "Giá của $\\overrightarrow{AB}$ và $\\overrightarrow{EF}$ đều nằm ngang nên song song: cùng phương." },

"S08-T2": { type: "truefalse", pts: 2,
  q: "Các mệnh đề sau đúng hay sai?",
  props: [
    { t: "Hai vectơ bằng nhau thì cùng độ dài.", answer: true },
    { t: "Hai vectơ cùng độ dài thì bằng nhau.", answer: false }
  ],
  explain: "Bằng nhau ⇒ cùng độ dài (đúng). Nhưng cùng độ dài mà khác hướng thì chưa bằng nhau." },

"S08-T3": { type: "fill", pts: 2,
  q: "Nếu $\\vec{a} = \\vec{b}$ thì $\\vec{a}$ và $\\vec{b}$ ______ hướng nhau.",
  answer: "cùng", accept: ["cung"] },

"S08-T4": { type: "dragdrop", pts: 3,
  q: "Kéo mỗi vectơ vào ô đúng: cùng hướng, ngược hướng hay không cùng phương với $\\overrightarrow{AB}$.",
  cards: [
    { id: "vCD", t: "$\\overrightarrow{CD}$" },
    { id: "vEF", t: "$\\overrightarrow{EF}$" },
    { id: "vKL", t: "$\\overrightarrow{KL}$" },
    { id: "vGH", t: "$\\overrightarrow{GH}$" }
  ],
  zones: [
    { id: "z0", label: "Cùng hướng với $\\overrightarrow{AB}$", accept: "vCD,vKL" },
    { id: "z1", label: "Ngược hướng với $\\overrightarrow{AB}$", accept: "vEF" },
    { id: "z2", label: "Không cùng phương với $\\overrightarrow{AB}$", accept: "vGH" }
  ] },

/* ===== S09 — Lab 3: cấu hình nội dung ===== */
"S09-OBS1": { q: "Độ dài của vectơ-không bằng bao nhiêu?", a: "$0$." },
"S09-OBS2": { q: "Ở độ dài 0, em có xác định được hướng không?", a: "Không." },
"S09-FILL": { type: "fill", pts: 1,
  q: "Vectơ có điểm đầu trùng điểm cuối gọi là ____.",
  answer: "vectơ-không", accept: ["vecto-khong", "vectơ không", "vec tơ-không"] },

/* ===== S10 — Chốt: vectơ-không và các quy ước ===== */
"S10-E1": { type: "essay", pts: 2,
  q: "Vì sao phải quy ước vectơ-không cùng hướng với mọi vectơ?",
  model: "Vì vectơ-không không có hướng thật. Quy ước này giúp các định nghĩa áp dụng thống nhất cho mọi vectơ." },

"S10-E2": { type: "essay", pts: 2,
  q: "Viết ký hiệu vectơ có điểm đầu và điểm cuối đều là $M$.",
  model: "$\\overrightarrow{MM} = \\overrightarrow{0}$." },

/* ===== S11 — Đấu trí (chùm 4 mệnh đề, chấm Công văn 7991) ===== */
"S11-TF": { type: "truefalse", pts: 4,
  q: "Đọc từng mệnh đề, chọn Đúng hoặc Sai rồi viết một câu giải thích.",
  props: [
    { t: "Mọi vectơ-không đều bằng nhau.", answer: true },
    { t: "Hai vectơ cùng hướng thì bằng nhau.", answer: false },
    { t: "Vectơ $\\overrightarrow{AB}$ và vectơ $\\vec{a}$ có thể bằng nhau.", answer: true },
    { t: "Vectơ-không ngược hướng với mọi vectơ.", answer: false }
  ],
  explain: "1) Đúng: cùng độ dài 0 và cùng hướng theo quy ước. 2) Sai: còn cần độ dài bằng nhau. 3) Đúng: ký hiệu khác nhau không cấm bằng nhau. 4) Sai: quy ước là cùng hướng." },

"S11-E": { type: "essay", pts: 2,
  q: "Chọn mệnh đề em thấy khó nhất và giải thích bằng một câu.",
  model: "Ví dụ: mệnh đề 2 sai vì hai vectơ cùng hướng còn cần độ dài bằng nhau mới bằng nhau." },

/* ===== S12 — Vận dụng thực tế ===== */
"S12-E1": { type: "essay", pts: 2,
  q: "Lực kéo có những yếu tố nào giống một vectơ?",
  model: "Điểm đặt, hướng và độ lớn." },

"S12-E2": { type: "essay", pts: 2,
  q: "Vận tốc của ô tô giống vectơ ở điểm nào?",
  model: "Vận tốc có hướng chuyển động và có độ lớn (tốc độ)." },

"S12-PJ": { type: "essay", pts: 0,
  q: "Em mô tả sơ đồ vectơ của nhóm ở đây.",
  model: "Sơ đồ cần: ít nhất 3 vectơ có mũi tên rõ ràng; ghi chú điểm đầu, điểm cuối mỗi vectơ; chỉ ra ít nhất một cặp vectơ bằng nhau (cùng hướng, cùng độ dài)." },

/* ===== S13 — Kiểm tra tổng hợp: 8 câu / 100 điểm / 10 phút, ngưỡng 80 ===== */
"S13-Q1": { type: "mcq", pts: 12, review: "S04",
  q: "Vectơ $\\overrightarrow{AB}$ có điểm đầu là điểm nào?",
  options: [ { t: "$A$", ok: true }, { t: "$B$", ok: false } ] },
"S13-Q2": { type: "mcq", pts: 12, review: "S04",
  q: "Ký hiệu nào chỉ độ dài của vectơ $\\overrightarrow{AB}$?",
  options: [
    { t: "$\\left|\\overrightarrow{AB}\\right|$", ok: true },
    { t: "$\\overrightarrow{AB}$", ok: false },
    { t: "$AB$", ok: false },
    { t: "$|AB|$", ok: false }
  ] },
"S13-Q3": { type: "mcq", pts: 12, review: "S07",
  q: "Hai vectơ cùng phương khi nào?",
  options: [
    { t: "Giá của chúng song song hoặc trùng nhau", ok: true },
    { t: "Chúng cùng độ dài", ok: false },
    { t: "Chúng cùng hướng", ok: false },
    { t: "Điểm đầu của chúng trùng nhau", ok: false }
  ] },
"S13-Q4": { type: "truefalse", pts: 12, review: "S04",
  q: "Mệnh đề sau đúng hay sai?",
  props: [ { t: "Vectơ $\\overrightarrow{AB}$ và $\\overrightarrow{BA}$ bằng nhau.", answer: false } ] },
"S13-Q5": { type: "fill", pts: 12, review: "S07",
  q: "Muốn hai vectơ bằng nhau, ngoài cùng hướng còn cần điều kiện gì?",
  answer: "cùng độ dài", accept: ["độ dài bằng nhau", "cung do dai"] },
"S13-Q6": { type: "mcq", pts: 12, review: "S10",
  q: "Vectơ-không ký hiệu là gì?",
  options: [
    { t: "$\\overrightarrow{0}$", ok: true },
    { t: "$\\vec{0}$", ok: false },
    { t: "$0$", ok: false },
    { t: "$\\overrightarrow{O}$", ok: false }
  ],
  explain: "Vectơ-không ký hiệu là $\\overrightarrow{0}$: mũi tên dài phủ hết số 0." },
"S13-Q7": { type: "truefalse", pts: 12, review: "S10",
  q: "Đánh giá tính đúng sai của mệnh đề:",
  props: [ { t: "Vectơ-không cùng phương với mọi vectơ.", answer: true } ] },
"S13-Q8": { type: "dragdrop", pts: 16, review: "S08",
  q: "Kéo mỗi cặp vectơ trong hình vào ô 'bằng nhau' hoặc 'không bằng nhau'.",
  cards: [
    { id: "p1", t: "Cặp $\\overrightarrow{AB}$ – $\\overrightarrow{CD}$" },
    { id: "p2", t: "Cặp $\\overrightarrow{AB}$ – $\\overrightarrow{EF}$" },
    { id: "p3", t: "Cặp $\\overrightarrow{AB}$ – $\\overrightarrow{KL}$" },
    { id: "p4", t: "Cặp $\\overrightarrow{MM}$ – $\\overrightarrow{NN}$" }
  ],
  zones: [
    { id: "z0", label: "Bằng nhau", accept: "p1,p4" },
    { id: "z1", label: "Không bằng nhau", accept: "p2,p3" }
  ] }
};

/* Trạm của từng chặng luyện tập */
var STATIONS = {
  S02: ["S02-T1", "S02-T2", "S02-T3"],
  S05: ["S05-T1", "S05-T2", "S05-T3", "S05-T4"],
  S08: ["S08-T1", "S08-T2", "S08-T3", "S08-T4"]
};

/* Bài kiểm tra S13: thứ tự 8 câu */
var TEST13 = ["S13-Q1", "S13-Q2", "S13-Q3", "S13-Q4", "S13-Q5", "S13-Q6", "S13-Q7", "S13-Q8"];
var TEST13_TIME_MIN = 10;
var TEST13_PASS = 80;

/* ---------------- TIMELINE QUIZ VIDEO ----------------
 * Video do video agent build; app.js phát qua api.video(id, host, opts).
 * opts: {quizzes: VIDEO_QUIZZES[id], onDone}. Mỗi pause: {at, quiz}.
 * at: "end" | "mid" (video agent chốt thời điểm giây chính xác).
 * V0: 1 điểm dừng dự đoán cuối video, KHÔNG chấm điểm, cấm tua qua. */
var VIDEO_QUIZZES = {
  V0: [
    { at: "end", seekLock: true, type: "predict",
      q: "Cùng đi 10 km từ cảng, hai tàu tới hai nơi khác nhau. Vì sao?",
      samples: [
        "Hai tàu đi hai hướng khác nhau.",
        "Một tàu đi thẳng, một tàu rẽ.",
        "Khoảng cách giống nhau nhưng hướng đi khác nhau."
      ] }
  ],
  V1: [
    { at: "mid", seekLock: true, type: "mcq", pts: 1,
      q: "Vectơ $\\overrightarrow{AB}$ có điểm đầu là điểm nào?",
      options: [ { t: "$A$", ok: true }, { t: "$B$", ok: false } ] },
    { at: "end", seekLock: true, type: "mcq", pts: 1,
      q: "Ký hiệu độ dài của vectơ $\\overrightarrow{AB}$ là gì?",
      options: [
        { t: "$\\left|\\overrightarrow{AB}\\right|$", ok: true },
        { t: "$\\overrightarrow{AB}$", ok: false },
        { t: "$AB$", ok: false }
      ] }
  ],
  V2: [
    { at: "mid", seekLock: true, type: "mcq", pts: 1,
      q: "Hai giá song song thì hai vectơ thế nào?",
      options: [
        { t: "Cùng phương", ok: true },
        { t: "Bằng nhau", ok: false },
        { t: "Ngược hướng", ok: false }
      ] },
    { at: "end", seekLock: true, type: "mcq", pts: 1,
      q: "Muốn hai vectơ bằng nhau cần thêm điều kiện gì?",
      options: [
        { t: "Cùng hướng và cùng độ dài", ok: true },
        { t: "Cùng điểm đầu", ok: false },
        { t: "Cùng ký hiệu", ok: false }
      ] }
  ],
  V3: [
    { at: "end", seekLock: true, type: "fill", pts: 1,
      q: "Độ dài của vectơ-không bằng bao nhiêu?",
      answer: 0, tol: 0 }
  ]
};

/* ---------------- CẤU HÌNH LAB (nội dung; cơ chế do lab agent cung cấp) ----------------
 * Lab tuân thủ 4 bước: Dự đoán → Thao tác → Quan sát → Kết luận (pháo giấy eureka).
 * api.lab(name, host, cfg) với cfg gồm: predict{q}, observe[{q,a}], conclude{fillId}. */
var LABS = {
  lab1: {
    predict: { q: "Em có hai điểm $A$, $B$. Em nghĩ đoạn thẳng $AB$ có mấy 'hướng đi'?" },
    observe: ["S03-OBS1", "S03-OBS2"],
    conclude: { fillId: "S03-FILL", eureka: true }
  },
  lab2: {
    predict: { q: "Em nhìn hai vectơ trên mặt bàn. Em đoán 'cùng phương' nghĩa là gì?" },
    observe: ["S06-OBS1", "S06-OBS2", "S06-OBS3"],
    conclude: { fillId: "S06-FILL", eureka: true }
  },
  lab3: {
    predict: { q: "Em co vectơ lại tới khi điểm đầu trùng điểm cuối. Điều gì xảy ra với hướng?" },
    observe: ["S09-OBS1", "S09-OBS2"],
    conclude: { fillId: "S09-FILL", eureka: true }
  }
};
