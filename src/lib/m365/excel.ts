import ExcelJS from 'exceljs';
import { BRAND_SYSTEM } from '../templates/brand-system';

export interface ExcelTableData {
  headers: string[];
  rows: (string | number)[][];
}

/**
 * Generates a branded Excel spreadsheet from structured AI data.
 * Useful for cap rate tables, rent rolls, and financial summaries.
 */
export async function generateBrandedSpreadsheet(title: string, data: ExcelTableData): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  
  workbook.creator = BRAND_SYSTEM.company.name;
  workbook.lastModifiedBy = BRAND_SYSTEM.company.name;
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Analysis');

  // 1. Add Title Header
  sheet.mergeCells('A1:E2');
  const titleCell = sheet.getCell('A1');
  titleCell.value = title.toUpperCase();
  titleCell.font = {
    name: 'Arial',
    size: 16,
    bold: true,
    color: { argb: 'FF' + BRAND_SYSTEM.colors.primary.replace('#', '') }
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };

  // 2. Add Branding Watermark / Tagline
  sheet.mergeCells('A3:E3');
  const tagCell = sheet.getCell('A3');
  tagCell.value = `${BRAND_SYSTEM.company.name} — Confidential`;
  tagCell.font = {
    name: 'Arial',
    size: 10,
    italic: true,
    color: { argb: 'FF' + BRAND_SYSTEM.colors.accent.replace('#', '') }
  };

  // 3. Add Data Table Headers
  const headerRowOffset = 5;
  const headerRow = sheet.getRow(headerRowOffset);
  data.headers.forEach((header, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = header;
    cell.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF' + BRAND_SYSTEM.colors.primary.replace('#', '') }
    };
    cell.alignment = { horizontal: 'center' };
  });

  // 4. Add Data Rows
  data.rows.forEach((row, rowIndex) => {
    const dataRow = sheet.getRow(headerRowOffset + 1 + rowIndex);
    row.forEach((cellValue, colIndex) => {
      const cell = dataRow.getCell(colIndex + 1);
      cell.value = cellValue;
      cell.font = { name: 'Arial', size: 11, color: { argb: 'FF' + BRAND_SYSTEM.colors.text.replace('#', '') } };
      
      // Basic formatting for numbers
      if (typeof cellValue === 'number') {
        if (cellValue > 1000) {
          cell.numFmt = '"$"#,##0.00';
        } else if (cellValue < 1 && cellValue > 0) {
          cell.numFmt = '0.00%'; // Assume decimal cap rates
        }
      }

      // Alternate row colors for readability
      if (rowIndex % 2 !== 0) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF' + BRAND_SYSTEM.colors.background.replace('#', '') }
        };
      }
    });
  });

  // Auto-fit columns
  sheet.columns.forEach(column => {
    column.width = 20; // Default reasonable width
  });

  // Export to Base64
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer).toString('base64');
}
