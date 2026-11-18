// Shared by both functions. The leaderboard travels inside the link as ?g=<base64url JSON>,
// in the same format the page writes: {v:1, p:[[name, internetAge, realAge, typeCode], ...]}.
export const TYPES = {TO: "Terminally Online", LA: "Legacy Account", BN: "Brainrot Native", VV: "Vine-Era Lifer", OL: "Offline Legend",
  PC: "Perfectly Calibrated", OS: "Old Soul, Older Browser", YH: "Chronically Young", CN: "Certified Netizen"};
export function cleanName(s) {
  return Array.from(String(s || "").replace(/[\u0000-\u001f<>]/g, "").trim()).slice(0, 14).join("");
}
export function decodeBoard(param) {
  if (!param || param.length > 2000) return [];
  try {
    let s = param.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    const bytes = Uint8Array.from(atob(s), c => c.charCodeAt(0));
    const o = JSON.parse(new TextDecoder().decode(bytes));
    if (!o || !Array.isArray(o.p)) return [];
    return o.p.slice(0, 16)
      .map(r => ({n: cleanName(r[0]) || "Someone", a: Math.round(+r[1]), r: Math.round(+r[2]) || 0, t: TYPES[r[3]] ? r[3] : "CN"}))
      .filter(e => e.a >= 8 && e.a <= 85 && e.r >= 0 && e.r <= 110);
  } catch (e) {
    return [];
  }
}
export function previewText(entries) {
  const sorted = entries.slice().sort((a, b) => b.a - a.a);
  const names = entries.map(e => e.n);
  const who = names.length === 2 ? `${names[0]} and ${names[1]}`
    : `${names[0]}, ${names[1]} and ${names.length - 2} other${names.length > 3 ? "s" : ""}`;
  const title = entries.length === 1 ? `${names[0]}'s internet age is ${entries[0].a}. What's yours?`
    : `${who} posted their internet ages`;
  const description = `Oldest online so far: ${sorted[0].n} (${sorted[0].a}). Take the 60-second test and join the board.`;
  return {title, description};
}
