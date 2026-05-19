import fs from 'fs';
import JSZip from 'jszip';

const buf = fs.readFileSync('../template.xlsx');
const zip = await JSZip.loadAsync(buf);
const s2xml = await zip.file("xl/worksheets/sheet2.xml").async("string");

const rows = [6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30];

console.log("=== Sheet 2 G-column (% achievement) ===");
for (const r of rows) {
  const match = s2xml.match(new RegExp(`<c r="G${r}"[^>]*>([\\s\\S]*?)<\\/c>`));
  const fMatch = match?.[1].match(/<f[^>]*>([^<]+)<\/f>/);
  const vMatch = match?.[1].match(/<v>([^<]+)<\/v>/);
  console.log(`G${r}: f="${fMatch?.[1] || '(static)'}",  v="${vMatch?.[1] || 'n/a'}"`);
}

console.log("\n=== Sheet 2 J-column (payment) ===");
for (const r of rows) {
  const match = s2xml.match(new RegExp(`<c r="J${r}"[^>]*>([\\s\\S]*?)<\\/c>`));
  const fMatch = match?.[1].match(/<f[^>]*>([^<]+)<\/f>/);
  const vMatch = match?.[1].match(/<v>([^<]+)<\/v>/);
  console.log(`J${r}: f="${fMatch?.[1] || '(static)'}",  v="${vMatch?.[1] || 'n/a'}"`);
}


