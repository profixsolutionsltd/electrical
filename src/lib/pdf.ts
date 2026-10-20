/**
 * Minimal PDF generator. Produces a valid, single-page PDF from text lines
 * using a built-in Helvetica font. This avoids a heavyweight PDF dependency
 * while still generating real, downloadable invoice documents from live data.
 */

function escapePdfText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

interface PdfLine {
  text: string;
  size?: number;
  bold?: boolean;
  gapBefore?: number;
}

/** Build a PDF document (as a Buffer) from a list of text lines. */
export function buildSimplePdf(title: string, lines: PdfLine[]): Buffer {
  const content: string[] = [];
  let y = 800;

  content.push("BT");
  content.push(`/F1 ${20} Tf`);
  content.push(`1 0 0 1 56 ${y} Tm`);
  content.push(`(${escapePdfText(title)}) Tj`);
  content.push("ET");
  y -= 34;

  for (const line of lines) {
    if (line.gapBefore) y -= line.gapBefore;
    const size = line.size ?? 11;
    const font = line.bold ? "/F2" : "/F1";
    content.push("BT");
    content.push(`${font} ${size} Tf`);
    content.push(`1 0 0 1 56 ${y} Tm`);
    content.push(`(${escapePdfText(line.text)}) Tj`);
    content.push("ET");
    y -= size + 7;
  }

  const stream = content.join("\n");

  // Assemble the PDF with correct xref offsets.
  const objects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((obj, i) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });

  const xrefStart = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(pdf, "latin1");
}
