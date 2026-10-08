import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");
const BRAND_DIR = join(ROOT, "brand");
const PUBLIC_DIR = join(ROOT, "public");
const ICONS_DIR = join(PUBLIC_DIR, "icons");
const SPLASH_DIR = join(PUBLIC_DIR, "splash");

const ICON_WITH_BG = join(BRAND_DIR, "icon.png");
const ICON_TRANSPARENT = join(BRAND_DIR, "icon-transparent.png");

const SPLASH_GRADIENT_TOP = "#429D51";
const SPLASH_GRADIENT_BOTTOM = "#0F180F";

const PORTRAIT_SPLASH_SPECS = [
  { imgW: 2048, imgH: 2732 },
  { imgW: 1668, imgH: 2388 },
  { imgW: 1668, imgH: 2224 },
  { imgW: 1536, imgH: 2048 },
  { imgW: 1640, imgH: 2360 },
  { imgW: 1620, imgH: 2160 },
  { imgW: 1488, imgH: 2266 },
  { imgW: 1320, imgH: 2868 },
  { imgW: 1206, imgH: 2622 },
  { imgW: 1290, imgH: 2796 },
  { imgW: 1284, imgH: 2778 },
  { imgW: 1179, imgH: 2556 },
  { imgW: 1170, imgH: 2532 },
  { imgW: 1125, imgH: 2436 },
  { imgW: 1242, imgH: 2688 },
  { imgW: 828, imgH: 1792 },
  { imgW: 1242, imgH: 2208 },
  { imgW: 750, imgH: 1334 },
  { imgW: 640, imgH: 1136 },
];

async function generate() {
  console.log("🎨 Starting PWA Assets Generation for Recordzzz...");

  if (!existsSync(ICON_WITH_BG) || !existsSync(ICON_TRANSPARENT)) {
    console.error("❌ Missing brand assets in brand/ directory!");
    process.exit(1);
  }

  mkdirSync(ICONS_DIR, { recursive: true });
  mkdirSync(SPLASH_DIR, { recursive: true });

  // 1. Standard PWA Icons from icon.png
  console.log("📦 Generating Standard PWA Icons...");
  await sharp(ICON_WITH_BG)
    .resize(192, 192)
    .png()
    .toFile(join(ICONS_DIR, "icon-192.png"));

  await sharp(ICON_WITH_BG)
    .resize(512, 512)
    .png()
    .toFile(join(ICONS_DIR, "icon-512.png"));

  await sharp(ICON_WITH_BG)
    .resize(180, 180)
    .png()
    .toFile(join(ICONS_DIR, "apple-touch-icon.png"));

  // 2. Favicons
  console.log("🌟 Generating Favicons...");
  await sharp(ICON_WITH_BG)
    .resize(32, 32)
    .png()
    .toFile(join(PUBLIC_DIR, "favicon.ico"));

  await sharp(ICON_WITH_BG)
    .resize(32, 32)
    .png()
    .toFile(join(PUBLIC_DIR, "favicon.png"));

  // SVG favicon (simple mark matching Noom palette)
  const faviconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="Recordzzz">
  <rect width="32" height="32" rx="8" fill="#0F180F"/>
  <circle cx="16" cy="16" r="10" fill="none" stroke="#429D51" stroke-width="2.5"/>
  <circle cx="16" cy="16" r="3" fill="#429D51"/>
</svg>
`;
  writeFileSync(join(PUBLIC_DIR, "favicon.svg"), faviconSvg, "utf8");

  // 3. Maskable Icons (padding safe zone with background color)
  console.log("🎭 Generating Maskable PWA Icons...");
  const createMaskable = async (size: number, outPath: string) => {
    const logoSize = Math.round(size * 0.72);
    const resizedLogo = await sharp(ICON_TRANSPARENT)
      .resize(logoSize, logoSize, { fit: "contain" })
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 15, g: 24, b: 15, alpha: 1 },
      },
    })
      .composite([
        {
          input: resizedLogo,
          gravity: "center",
        },
      ])
      .png()
      .toFile(outPath);
  };

  await createMaskable(192, join(ICONS_DIR, "icon-192-maskable.png"));
  await createMaskable(512, join(ICONS_DIR, "icon-512-maskable.png"));

  // TODO: remove icon from shortcuts (use custom ones)
  // 4. Shortcut Icons
  console.log("⚡ Generating Shortcut Icons...");
  const createShortcutIcon = async (
    name: string,
    badgeSvg: string
  ) => {
    const size = 192;
    const logoSize = 130;
    const logoBuf = await sharp(ICON_TRANSPARENT)
      .resize(logoSize, logoSize, { fit: "contain" })
      .toBuffer();

    const badgeBuf = Buffer.from(badgeSvg);

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 22, g: 32, b: 22, alpha: 1 },
      },
    })
      .composite([
        {
          input: logoBuf,
          gravity: "center",
        },
        {
          input: badgeBuf,
          gravity: "southeast",
        },
      ])
      .png()
      .toFile(join(ICONS_DIR, `shortcut-${name}.png`));
  };

  const newBadge = `<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="30" r="26" fill="#429D51" stroke="#0F180F" stroke-width="4"/>
    <path d="M30 18V42M18 30H42" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
  </svg>`;

  const reportsBadge = `<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="30" r="26" fill="#429D51" stroke="#0F180F" stroke-width="4"/>
    <path d="M22 38V30M30 38V22M38 38V26" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
  </svg>`;

  const settingsBadge = `<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="30" r="26" fill="#429D51" stroke="#0F180F" stroke-width="4"/>
    <circle cx="30" cy="30" r="6" stroke="#FFFFFF" stroke-width="3" fill="none"/>
  </svg>`;

  await createShortcutIcon("new", newBadge);
  await createShortcutIcon("reports", reportsBadge);
  await createShortcutIcon("settings", settingsBadge);

  // 5. iOS Startup Splash Screens
  console.log("📱 Generating iOS Startup Splash Screens...");
  for (const spec of PORTRAIT_SPLASH_SPECS) {
    const { imgW, imgH } = spec;
    const logoW = Math.max(120, Math.round(Math.min(imgW, imgH) * 0.28));

    const resizedLogo = await sharp(ICON_TRANSPARENT)
      .resize(logoW, logoW, { fit: "contain" })
      .toBuffer();

    const bgSvg = Buffer.from(`
      <svg width="${imgW}" height="${imgH}" viewBox="0 0 ${imgW} ${imgH}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${SPLASH_GRADIENT_TOP}" />
            <stop offset="100%" stop-color="${SPLASH_GRADIENT_BOTTOM}" />
          </linearGradient>
        </defs>
        <rect width="${imgW}" height="${imgH}" fill="url(#g)" />
      </svg>
    `);

    const bg = await sharp(bgSvg).png().toBuffer();

    await sharp(bg)
      .composite([
        {
          input: resizedLogo,
          gravity: "center",
        },
      ])
      .png()
      .toFile(join(SPLASH_DIR, `apple-${imgW}x${imgH}.png`));
  }

  console.log("✅ All PWA assets generated successfully!");
}

generate().catch((err) => {
  console.error("Asset generation error:", err);
  process.exit(1);
});
