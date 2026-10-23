const disciplines = [
  { id:"pure", name:"纯粹数学", en:"Pure Mathematics", color:"#49a7ff", angle:-90, topics:["代数","数论","分析","集合论"], description:"纯粹数学研究抽象结构本身：数如何组织、函数怎样变化、证明为何成立。它常从好奇心出发，却不断成为其他科学的底层语言。", question:"“在不依赖具体对象时，哪些结构依然成立？”" },
  { id:"geometry", name:"几何与拓扑", en:"Geometry & Topology", color:"#55d8e8", angle:-45, topics:["欧氏几何","微分几何","拓扑学","结理论"], description:"几何关注形状、距离与曲率；拓扑则研究物体在连续变形下保持不变的性质。它们帮助我们理解空间究竟可以有多少种样子。", question:"“一个甜甜圈和一个杯子，为什么在拓扑中很相似？”" },
  { id:"applied", name:"应用数学", en:"Applied Mathematics", color:"#72d47f", angle:0, topics:["微分方程","优化","动力系统","数学建模"], description:"应用数学把现实问题翻译成方程与模型，用数学分析流体、气候、工程、交通和生态等复杂系统。", question:"“怎样用一个模型，预测真实世界的变化？”" },
  { id:"computing", name:"计算数学", en:"Computational Math", color:"#44d8c3", angle:45, topics:["数值分析","科学计算","机器学习","密码学"], description:"计算数学设计可由计算机执行的方法，在精确答案难以获得时寻找稳定、快速而可靠的近似解。", question:"“当精确计算不可能时，怎样得到足够好的答案？”" },
  { id:"physics", name:"数学物理", en:"Mathematical Physics", color:"#aa83ff", angle:90, topics:["量子理论","相对论","场论","统计力学"], description:"数学物理用严谨的结构描述自然规律，从时空与粒子到能量和复杂系统，让物理直觉拥有可推演的形式。", question:"“自然界为什么能被数学如此准确地描述？”" },
  { id:"discrete", name:"离散数学", en:"Discrete Mathematics", color:"#ffb357", angle:135, topics:["图论","组合数学","逻辑","算法"], description:"离散数学研究一个个可分开的对象与有限结构，是算法、网络、编码和计算机科学的重要基础。", question:"“有限的选择，可以组合出多少种可能？”" },
  { id:"probability", name:"概率与统计", en:"Probability & Statistics", color:"#ff718f", angle:180, topics:["概率论","统计推断","随机过程","贝叶斯方法"], description:"概率描述随机性，统计则从有限数据中推断未知规律。它们让我们能够衡量不确定性，而不只是凭感觉判断。", question:"“我们能对不确定的未来，有多大把握？”" },
  { id:"foundations", name:"数学基础", en:"Foundations & Logic", color:"#828fff", angle:225, topics:["数理逻辑","集合论","证明论","范畴论"], description:"数学基础追问数学本身的规则：什么是证明、哪些命题可判定、不同结构之间如何建立统一语言。", question:"“数学的确定性，建立在什么之上？”" }
];

const map = document.getElementById("atlasMap");
const nodes = document.getElementById("nodes");
const svg = document.getElementById("connections");
const legend = document.getElementById("legend");
const panel = document.getElementById("infoPanel");

function renderAtlas() {
  nodes.innerHTML = "";
  svg.innerHTML = "";
  legend.innerHTML = "";
  const width = map.clientWidth, height = map.clientHeight;
  const mobile = width < 560;
  const rx = Math.min(width * (mobile ? .35 : .37), mobile ? 185 : 300);
  const ry = Math.min(height * (mobile ? .35 : .37), mobile ? 205 : 245);
  const cx = width / 2, cy = height / 2;
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  disciplines.forEach((d, index) => {
    const a = d.angle * Math.PI / 180;
    const x = cx + Math.cos(a) * rx;
    const y = cy + Math.sin(a) * ry;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", cx); line.setAttribute("y1", cy);
    line.setAttribute("x2", x); line.setAttribute("y2", y);
    svg.appendChild(line);

    // Each discipline is a cloud of stars rather than a single planet.
    const seed = (index + 1) * 8191;
    for (let si = 0; si < (mobile ? 14 : 24); si++) {
      const n1 = Math.sin(seed + si * 12.9898) * 43758.5453;
      const n2 = Math.sin(seed + si * 27.331) * 24634.6345;
      const r1 = n1 - Math.floor(n1);
      const r2 = n2 - Math.floor(n2);
      const theta = r1 * Math.PI * 2;
      const radius = 18 + Math.pow(r2, .72) * (mobile ? 52 : 78);
      const speck = document.createElement("i");
      speck.className = "cluster-speck";
      speck.style.left = (x + Math.cos(theta) * radius) + "px";
      speck.style.top = (y + Math.sin(theta) * radius * .62) + "px";
      speck.style.setProperty("--node-color", d.color);
      speck.style.setProperty("--s", (.7 + r1 * 2.1) + "px");
      speck.style.setProperty("--a", (.24 + r2 * .62).toFixed(2));
      speck.style.setProperty("--d", (1.8 + r1 * 3.4) + "s");
      nodes.appendChild(speck);
    }

    const wrap = document.createElement("div");
    wrap.className = "galaxy-node";
    wrap.style.left = x + "px"; wrap.style.top = y + "px";
    const button = document.createElement("button");
    button.type = "button"; button.className = "galaxy-button";
    button.style.setProperty("--node-color", d.color);
    button.innerHTML = `<strong>${d.name}</strong><small>${d.en}</small>`;
    button.setAttribute("aria-label", `查看${d.name}简介`);
    button.addEventListener("click", () => selectDiscipline(d, index));
    wrap.appendChild(button); nodes.appendChild(wrap);

    if (!mobile || width > 400) {
      d.topics.slice(0, mobile ? 2 : 3).forEach((topic, ti) => {
        const spread = (ti - 1) * (mobile ? .24 : .30);
        const sx = cx + Math.cos(a + spread) * (rx + (mobile ? 54 : 84));
        const sy = cy + Math.sin(a + spread) * (ry + (mobile ? 48 : 70));
        const sat = document.createElement("button");
        sat.type = "button"; sat.className = "satellite";
        sat.style.left = sx + "px"; sat.style.top = sy + "px";
        sat.style.setProperty("--node-color", d.color);
        sat.textContent = topic;
        sat.addEventListener("click", () => selectDiscipline(d, index, topic));
        nodes.appendChild(sat);
      });
    }

    const item = document.createElement("button");
    item.type = "button"; item.className = "legend-item";
    item.style.setProperty("--legend-color", d.color);
    item.innerHTML = `<i></i><span>${d.name}</span>`;
    item.addEventListener("click", () => { selectDiscipline(d, index); document.getElementById("atlas").scrollIntoView(); });
    legend.appendChild(item);
  });
}

function selectDiscipline(d, index, topic) {
  panel.style.setProperty("--panel-color", d.color);
  document.getElementById("panelNumber").textContent = String(index + 1).padStart(2, "0");
  document.getElementById("panelKicker").textContent = d.en.toUpperCase();
  document.getElementById("panelTitle").textContent = topic ? `${topic} · ${d.name}` : d.name;
  document.getElementById("panelDescription").textContent = d.description;
  document.getElementById("topicList").innerHTML = d.topics.map(t => `<span>${t}</span>`).join("");
  document.getElementById("panelQuestion").textContent = d.question;
  panel.classList.add("open");
}

document.getElementById("coreStar").addEventListener("click", () => {
  panel.style.setProperty("--panel-color", "#83d8ff");
  document.getElementById("panelNumber").textContent = "00";
  document.getElementById("panelKicker").textContent = "MATH ATLAS";
  document.getElementById("panelTitle").textContent = "数学，是发现模式的语言";
  document.getElementById("panelDescription").textContent = "从数量、空间到变化与不确定性，数学用抽象结构连接现实世界与想象世界。选择一颗分科主星，开始你的探索。";
  document.getElementById("topicList").innerHTML = "<span>结构</span><span>模式</span><span>推理</span><span>应用</span>";
  document.getElementById("panelQuestion").textContent = "“世界中有哪些规律，可以被精确地表达？”";
  panel.classList.add("open");
});
document.getElementById("panelClose").addEventListener("click", () => panel.classList.remove("open"));

const dialog = document.getElementById("aboutDialog");
document.getElementById("aboutButton").addEventListener("click", () => dialog.showModal());
document.getElementById("dialogClose").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", e => { if (e.target === dialog) dialog.close(); });

let resizeTimer;
window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(renderAtlas, 120); });
renderAtlas();

const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");
let stars = [];
function sizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
  canvas.style.width = innerWidth + "px"; canvas.style.height = innerHeight + "px";
  ctx.setTransform(dpr,0,0,dpr,0,0);
  stars = Array.from({length: Math.min(180, Math.floor(innerWidth * innerHeight / 7000))}, () => ({
    x: Math.random() * innerWidth, y: Math.random() * innerHeight,
    r: Math.random() * 1.25 + .15, a: Math.random() * .65 + .12,
    s: Math.random() * .008 + .002
  }));
}
function drawStars(t) {
  ctx.clearRect(0,0,innerWidth,innerHeight);
  stars.forEach(star => {
    const alpha = star.a * (.72 + Math.sin(t * star.s) * .28);
    ctx.beginPath(); ctx.arc(star.x, star.y, star.r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(205,230,255,${alpha})`; ctx.fill();
  });
  requestAnimationFrame(drawStars);
}
window.addEventListener("resize", sizeCanvas);
sizeCanvas();
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) requestAnimationFrame(drawStars);
else drawStars(0);
