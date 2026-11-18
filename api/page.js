import { readFile } from "node:fs/promises";
import { decodeBoard, previewText } from "../lib/board.js";

// Serves the normal page, but when the link carries a leaderboard (?g=), its link-preview tags
// show that board's names and ages. If anything fails, the visitor still gets the page.

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export async function GET(request) {
  const url = new URL(request.url);
  let html;
  try {
    html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
  } catch {
    return Response.redirect(new URL(`/index.html${url.search}`, url), 302);
  }
  try {
    const g = url.searchParams.get("g") || "";
    const entries = decodeBoard(g);
    if (entries.length) {
      const { title, description } = previewText(entries);
      const image = new URL("/api/og", url); image.searchParams.set("g", g);
      const shared = new URL("/", url); shared.searchParams.set("g", g);
      const tags = { "og:title": title, "og:description": description, "og:image": image.href, "og:url": shared.href };
      for (const [prop, value] of Object.entries(tags)) {
        html = html.replace(new RegExp(`<meta property="${prop}" content="[^"]*">`), () => `<meta property="${prop}" content="${esc(value)}">`);
      }
      html = html.replace('<meta name="twitter:card" content="summary_large_image">',
        () => `<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:image" content="${esc(image.href)}">`);
    }
  } catch (e) {
    console.error("preview tags failed:", e);
  }
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=0, s-maxage=3600" },
  });
}
