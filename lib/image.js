// The 1200x630 link-preview image for a leaderboard link, as plain element objects (no JSX build step).
const INK = "#121214", PAPER = "#FFFAEE", LIME = "#D8FF3C", PINK = "#FF5FB3", DESK = "#2B44FF", MUTED = "#4F4D57";
const h = (type, style, ...children) => ({type, props: {style, children: children.length === 0 ? undefined : children.length === 1 ? children[0] : children}});
const GLYPH = {
  "0": [" ### ", "#   #", "#  ##", "# # #", "##  #", "#   #", " ### "], "1": ["  #  ", " ##  ", "# #  ", "  #  ", "  #  ", "  #  ", "#####"],
  "2": [" ### ", "#   #", "    #", "   # ", "  #  ", " #   ", "#####"], "3": ["#### ", "    #", "    #", " ### ", "    #", "    #", "#### "],
  "4": ["   # ", "  ## ", " # # ", "#  # ", "#####", "   # ", "   # "], "5": ["#####", "#    ", "#### ", "    #", "    #", "#   #", " ### "],
  "6": [" ### ", "#    ", "#    ", "#### ", "#   #", "#   #", " ### "], "7": ["#####", "    #", "   # ", "  #  ", "  #  ", "  #  ", "  #  "],
  "8": [" ### ", "#   #", "#   #", " ### ", "#   #", "#   #", " ### "], "9": [" ### ", "#   #", "#   #", " ####", "    #", "    #", " ### "]};
function pixelNum(str, px) {
  const cells = []; let x = 0;
  for (const ch of String(str)) {
    (GLYPH[ch] || GLYPH["0"]).forEach((row, y) => [...row].forEach((c, i) => { if (c === "#") cells.push([x + i, y]); }));
    x += 6;
  }
  const off = Math.max(3, Math.round(px * 0.3));
  const sq = (cx, cy, col, d) => h("div", {position: "absolute", left: cx * px + d, top: cy * px + d, width: px + 1, height: px + 1, backgroundColor: col});
  return h("div", {position: "relative", display: "flex", width: (x - 1) * px + off, height: 7 * px + off},
    ...cells.map(([cx, cy]) => sq(cx, cy, PINK, off)), ...cells.map(([cx, cy]) => sq(cx, cy, INK, 0)));
}
function globe() {
  const g = ["0111110", "1101011", "1011101", "1111111", "1011101", "1101011", "0111110"], cells = [];
  g.forEach((row, y) => [...row].forEach((c, x) => { if (c === "1") cells.push(h("div", {position: "absolute", left: x * 6, top: y * 6, width: 6, height: 6, backgroundColor: INK})); }));
  return h("div", {position: "relative", display: "flex", width: 42, height: 42}, ...cells);
}
const box = () => h("div", {width: 36, height: 36, backgroundColor: PAPER, border: `5px solid ${INK}`, marginLeft: 8});
const pixelText = (text, size, color = INK) => h("div", {display: "flex", fontFamily: "Silkscreen", fontSize: size, color, letterSpacing: 1}, text);
const heavy = (text, size, color = INK) => h("div", {display: "flex", fontFamily: "Archivo Black", fontSize: size, color, lineHeight: 1}, text);

export function boardImage(entries, host) {
  const sorted = entries.slice().sort((a, b) => b.a - a.a), shown = sorted.slice(0, 4), more = sorted.length - shown.length;
  const fit = [null, [150, 14, 64], [110, 11, 52], [92, 9, 46], [70, 7, 38]].at(shown.length);
  const rowH = fit[0], px = fit[1], nameSize = fit[2];
  const rows = shown.map((e, i) => h("div", {display: "flex", alignItems: "center", height: rowH, marginTop: i ? 8 : 0, padding: "0 22px",
      backgroundColor: i === 0 && sorted.length > 1 ? LIME : "#FFFFFF", border: `5px solid ${INK}`},
    ...(sorted.length > 1 ? [pixelText(String(i + 1), 26, MUTED)] : []),
    h("div", {display: "flex", flexDirection: "column", marginLeft: sorted.length > 1 ? 22 : 6, flexGrow: 1},
      heavy(e.n, nameSize),
      e.r ? pixelText(`IRL ${e.r}`, 16, MUTED) : pixelText("", 16)),
    pixelNum(e.a, px)));
  const left = h("div", {display: "flex", flexDirection: "column", width: 700},
    pixelText(sorted.length > 1 ? "INTERNET AGES SO FAR" : "INTERNET AGE", 24, MUTED),
    h("div", {display: "flex", flexDirection: "column", marginTop: 16}, ...rows),
    more > 0 ? h("div", {display: "flex", marginTop: 8}, pixelText(`+ ${more} MORE ON THE BOARD`, 18, MUTED)) : h("div", {display: "flex"}));
  // The domain pill has ~225px for text; Silkscreen runs about 0.72em per character, so long hosts get smaller type.
  const label = String(host || "internetage.lol").replace(/^www\./, "").toUpperCase();
  const labelSize = Math.max(10, Math.min(24, Math.floor(225 / (label.length * 0.72))));
  const right = h("div", {display: "flex", flexDirection: "column", justifyContent: "center", marginLeft: 44, flexGrow: 1},
    heavy("YOUR", 88), heavy("TURN.", 88),
    h("div", {display: "flex", marginTop: 22}, pixelText("15 QUESTIONS", 20)),
    h("div", {display: "flex", marginTop: 4}, pixelText("60 SECONDS", 20)),
    h("div", {display: "flex", marginTop: 22, padding: "10px 16px", backgroundColor: PINK, border: `5px solid ${INK}`, alignSelf: "flex-start"},
      pixelText(label, labelSize)));
  const bar = h("div", {display: "flex", alignItems: "center", height: 86, padding: "0 18px 0 22px", backgroundColor: LIME, borderBottom: `8px solid ${INK}`},
    globe(), h("div", {display: "flex", marginLeft: 20}, pixelText("GROUP_CHAT.EXE", 30)),
    h("div", {display: "flex", marginLeft: "auto"}, box(), box(), box()));
  const windowEl = h("div", {position: "absolute", left: 40, top: 30, width: 1100, height: 548, display: "flex", flexDirection: "column",
      backgroundColor: PAPER, border: `8px solid ${INK}`, boxShadow: `20px 20px 0 ${INK}`},
    bar, h("div", {display: "flex", padding: "22px 34px 0 34px", flexGrow: 1}, left, right));
  return h("div", {display: "flex", position: "relative", width: 1200, height: 630, backgroundColor: DESK}, windowEl);
}
