const fs = require("fs");
const path = require("path");

const roots = ["app", "components", "lib"];
const pattern = /(繧|縺|蜷|邨|菴|螟|譛|鬮|髱|驕|遘|蝣|荳|陦|逕|縲)/;

let bad = [];
function scan(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) scan(p);
    else if (/\.(ts|tsx)$/.test(entry.name)) {
      const txt = fs.readFileSync(p, "utf8");
      if (pattern.test(txt)) bad.push(p);
    }
  }
}
for (const r of roots) scan(path.join(process.cwd(), r));

if (bad.length) {
  console.error("❌ Mojibake-like bytes were found in:");
  for (const b of bad) console.error(" - " + b);
  process.exit(1);
} else {
  console.log("✅ No mojibake patterns in app/components/lib.");
}