import { readFile } from "node:fs/promises";
import { ImageResponse } from "@vercel/og";
import { decodeBoard } from "../lib/board.js";
import { boardImage } from "../lib/image.js";

// GET /api/og?g=<leaderboard> -> 1200x630 PNG with the names and internet ages in that link.
// Anything that goes wrong (bad link, missing font, render error) falls back to the generic /og.png,
// so a group link never shows a broken preview.

async function font(file, origin) {
  try {
    return await readFile(new URL(`../public/fonts/${file}`, import.meta.url));
  } catch {
    const res = await fetch(new URL(`/fonts/${file}`, origin));
    if (!res.ok) throw new Error(`font ${file}: ${res.status}`);
    return res.arrayBuffer();
  }
}

export async function GET(request) {
  const url = new URL(request.url);
  const fallback = () => Response.redirect(new URL("/og.png", url), 302);
  const entries = decodeBoard(url.searchParams.get("g"));
  if (!entries.length) return fallback();
  try {
    const [silk, archivo] = await Promise.all([font("Silkscreen-Regular.ttf", url), font("ArchivoBlack-Regular.ttf", url)]);
    const image = new ImageResponse(boardImage(entries, url.host), {
      width: 1200, height: 630,
      fonts: [
        { name: "Silkscreen", data: silk, weight: 400, style: "normal" },
        { name: "Archivo Black", data: archivo, weight: 400, style: "normal" },
      ],
    });
    const png = await image.arrayBuffer(); // render here, so a failure still reaches the fallback
    return new Response(png, {
      headers: { "content-type": "image/png", "cache-control": "public, max-age=86400, s-maxage=31536000, immutable" },
    });
  } catch (e) {
    console.error("og render failed:", e);
    return fallback();
  }
}
