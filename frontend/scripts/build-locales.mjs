/**
 * One-time helper: export public/locales from src/i18n/translations.js
 * Run: node scripts/build-locales.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const { TRANSLATIONS } = await import(pathToFileURL(path.join(root, "src/i18n/translations.js")).href);

const stripMeta = ({ code, label, name, ...rest }) => rest;

for (const [lang, bundle] of Object.entries(TRANSLATIONS)) {
  const payload = JSON.stringify(stripMeta(bundle), null, 2) + "\n";
  for (const base of [
    path.join(root, "public", "locales", lang),
    path.join(root, "src", "i18n", "locales", lang),
  ]) {
    fs.mkdirSync(base, { recursive: true });
    fs.writeFileSync(path.join(base, "translation.json"), payload, "utf8");
  }
  console.log("Wrote locales for", lang);
}
