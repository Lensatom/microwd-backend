import {
  HeadObjectCommand
} from "@aws-sdk/client-s3";
import fs from "fs";
import PDFDocument from "pdfkit";
import { R2_BUCKET } from "../../../config/env";
import { r2 } from "../../../config/r2";

const bucketFromEnv = R2_BUCKET!;
if (!bucketFromEnv) {
  throw new Error("Missing environment variable R2_BUCKET for Cloudflare R2 bucket.");
}
export const BUCKET = bucketFromEnv;
export const TMP_DIR = "./tmp";

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR);
}


type ReportRow = {
  first_name: string;
  last_name: string;
  email: string;
  additionalInfo: { field: string, value: string }[];
  created_at: Date;
};




export async function r2ObjectExists(key: string): Promise<boolean> {
  try {
    await r2.send(
      new HeadObjectCommand({
        Bucket: BUCKET,
        Key: key,
      })
    );
    return true;
  } catch (err: any) {
    if (err?.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw err;
  }
}




export function generatePdf(
  filePath: string,
  eventName: string,
  data: ReportRow[]
): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc.font("Helvetica-Bold").fontSize(16).text(`${eventName} Attendance List`, {
      align: "left",
    });
    doc.moveDown(0.5);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const contentLeft = doc.page.margins.left;
    const contentRight = pageWidth - doc.page.margins.right;
    const contentWidth = contentRight - contentLeft;

    const columns = [
      { header: "First Name", key: "first_name" as const, width: Math.floor(contentWidth * 0.18) },
      { header: "Last Name", key: "last_name" as const, width: Math.floor(contentWidth * 0.18) },
      { header: "Email", key: "email" as const, width: Math.floor(contentWidth * 0.44) },
      { header: "Submission Time", key: "created_at" as const, width: Math.floor(contentWidth * 0.20) },
    ];

    const headerHeight = 26;
    const rowHeight = 22;
    const cellPaddingX = 8;
    const cellPaddingY = 6;

    let cursorY = doc.y + 6;

    const drawHeader = () => {
      let x = contentLeft;
      doc.save();
      doc.font("Helvetica-Bold").fontSize(11);
      columns.forEach((col) => {
        doc.rect(x, cursorY, col.width, headerHeight).fillAndStroke("#f3f4f6", "#d1d5db");
        doc.fillColor("#111827")
          .text(col.header, x + cellPaddingX, cursorY + cellPaddingY, {
            width: col.width - cellPaddingX * 2,
            align: "left",
          });
        x += col.width;
      });
      doc.restore();
      cursorY += headerHeight;
      doc.moveTo(contentLeft, cursorY).lineTo(contentRight, cursorY).stroke("#d1d5db");
    };

    const drawRow = (row: ReportRow) => {
      let x = contentLeft;
      doc.font("Helvetica").fontSize(10).fillColor("#111827");

      const cells: Array<{ text: string }> = [
        { text: row.first_name ?? "" },
        { text: row.last_name ?? "" },
        { text: row.email ?? "" },
        { text: new Date(row.created_at).toLocaleString() },
      ];

      if (cursorY + rowHeight > pageHeight - doc.page.margins.bottom) {
        doc.addPage();
        cursorY = doc.page.margins.top;
        drawHeader();
      }

      columns.forEach((col, idx) => {
        doc.rect(x, cursorY, col.width, rowHeight).stroke("#e5e7eb");
        doc.text(cells[idx].text, x + cellPaddingX, cursorY + cellPaddingY, {
          width: col.width - cellPaddingX * 2,
          ellipsis: true,
        });
        x += col.width;
      });

      cursorY += rowHeight;
    };

    drawHeader();
    data.forEach((row) => drawRow(row));

    doc.moveTo(contentLeft, pageHeight - doc.page.margins.bottom + 20)
      .lineTo(contentRight, pageHeight - doc.page.margins.bottom + 20)
      .stroke("#d1d5db");
    doc.font("Helvetica-Oblique").fontSize(8).fillColor("#6b7280")
      .text(`Generated on ${new Date().toLocaleString()}`, contentLeft, pageHeight - doc.page.margins.bottom + 25, {
        width: contentWidth,
        align: "right",
      });

    doc.end();

    stream.on("finish", () => resolve());
    stream.on("error", reject);
  });
}


export function generateCsv(
  filePath: string,
  event: { additionalInfoFields: string[] },
  data: ReportRow[]
): Promise<void> {
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filePath);

    stream.on("error", reject);
    stream.on("finish", () => resolve());

    stream.write("\uFEFF");

    const additionalInfoFields = event.additionalInfoFields || [];
    const allHeaders = ["First Name", "Last Name", "Email", ...additionalInfoFields, "Submission Time"];
    stream.write(allHeaders.join(",") + "\n");

    const esc = (value: any) => {
      const str = value == null ? "" : String(value);
      const needsQuotes = /[",\n\r]/.test(str);
      const escaped = str.replace(/"/g, '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    };

    for (const row of data) {
      const line = [
        esc(row.first_name),
        esc(row.last_name),
        esc(row.email),
        ...[additionalInfoFields.map((field) => {
          const infoObj = row.additionalInfo.find(info => info.field === field);
          return infoObj ? esc(infoObj.value) : esc("");
        })],
        esc(new Date(row.created_at).toISOString()),
      ].join(",");
      stream.write(line + "\n");
    }

    stream.end();
  });
}