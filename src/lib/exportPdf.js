import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  periodRange,
  rangeTotals,
  spendingByCategoryRange,
  foodBreakdownRange,
  rangeSummary,
  monthlyBreakdown,
  totalBalance,
} from './analytics';
import { formatRupiah } from './formatters';
import { financialInsights, periodInsights } from './insights';

const GREEN = [27, 67, 50];
const MID = [64, 145, 108];
const TEXT = [28, 25, 23];
const SUB = [107, 114, 128];
const DANGER = [220, 38, 38];
const WARNING = [217, 151, 6];

const LEVEL_COLOR = { danger: DANGER, warning: WARNING, info: MID };
const LEVEL_TAG = { danger: 'PENTING', warning: 'PERHATIAN', info: 'INFO' };

/**
 * Builds and downloads a one-or-more page PDF analytics report for the chosen
 * `period`: 'month' (current month), '6months', or 'year' (trailing 6/12 months).
 * Multi-month reports add a per-month breakdown table and use aggregate,
 * period-aware insights. jsPDF is imported dynamically so it stays out of the
 * initial bundle.
 */
export async function exportAnalyticsPdf({
  transactions,
  entries,
  monthlyBudget,
  period = 'month',
  ref = new Date(),
}) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentW = pageW - margin * 2;
  let y = margin;

  const { start, end, months } = periodRange(period, ref);
  const single = months === 1;

  // "Juni 2026" for a single month, "Jan 2026 - Jun 2026" across a range.
  const periodLabel = single
    ? format(end, 'MMMM yyyy', { locale: id })
    : `${format(start, 'MMM yyyy', { locale: id })} - ${format(end, 'MMM yyyy', { locale: id })}`;
  const periodNoun = single
    ? 'Bulan ini'
    : months === 6
      ? '6 bulan terakhir'
      : '1 tahun terakhir';

  const { income, expense, net } = rangeTotals(transactions, start, end);
  const summary = rangeSummary(transactions, entries, start, end, ref);
  const byCat = spendingByCategoryRange(transactions, start, end);
  const food = foodBreakdownRange(entries, start, end);
  const balance = totalBalance(transactions);
  const breakdown = single ? [] : monthlyBreakdown(transactions, start, end);
  const budgetForPeriod = monthlyBudget > 0 ? monthlyBudget * months : 0;
  const insights = single
    ? financialInsights(transactions, entries, monthlyBudget, ref)
    : periodInsights(transactions, entries, monthlyBudget, { start, end, months });

  const ensure = (h) => {
    if (y + h > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const sectionHeading = (text) => {
    ensure(14);
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...GREEN);
    doc.text(text, margin, y);
    y += 2;
    doc.setDrawColor(...MID);
    doc.setLineWidth(0.4);
    doc.line(margin, y, margin + contentW, y);
    y += 5;
  };

  // Wrapped body text; returns the new y.
  const bullet = (text, color = TEXT, tag = null) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const indent = 4;
    const lines = doc.splitTextToSize(text, contentW - indent - 2);
    ensure(lines.length * 5 + 2);
    doc.setTextColor(...MID);
    doc.text('•', margin, y);
    if (tag) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...color);
      doc.text(`[${tag}] `, margin + indent, y);
      const tagW = doc.getTextWidth(`[${tag}] `);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...TEXT);
      // Re-wrap the first line to account for the tag width.
      const firstLine = doc.splitTextToSize(text, contentW - indent - 2 - tagW)[0];
      doc.text(firstLine, margin + indent + tagW, y);
      const rest = text.slice(firstLine.length).trim();
      y += 5;
      if (rest) {
        const restLines = doc.splitTextToSize(rest, contentW - indent - 2);
        ensure(restLines.length * 5);
        doc.text(restLines, margin + indent, y);
        y += restLines.length * 5;
      }
    } else {
      doc.setTextColor(...color);
      doc.text(lines, margin + indent, y);
      y += lines.length * 5;
    }
    y += 1.5;
  };

  // Two-column key/value row.
  const kv = (key, value, valueColor = TEXT) => {
    ensure(7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...SUB);
    doc.text(key, margin, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...valueColor);
    doc.text(value, margin + contentW, y, { align: 'right' });
    y += 6;
  };

  // Four-column row for the per-month breakdown table (month + 3 figures).
  const tableCols = [
    { x: margin, align: 'left' },
    { x: margin + contentW * 0.52, align: 'right' },
    { x: margin + contentW * 0.76, align: 'right' },
    { x: margin + contentW, align: 'right' },
  ];
  const tableRow = (cells, { bold = false, colors = [] } = {}) => {
    ensure(6);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(9);
    cells.forEach((text, i) => {
      doc.setTextColor(...(colors[i] || TEXT));
      doc.text(String(text), tableCols[i].x, y, { align: tableCols[i].align });
    });
    y += 5.5;
  };

  // ---------------------------------------------------------------- HEADER
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, pageW, 26, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('Gue Ngekost - Laporan Analitik', margin, 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(216, 243, 220);
  doc.text(
    `${periodNoun}: ${periodLabel}  •  Dibuat ${format(new Date(), 'd MMM yyyy, HH:mm', {
      locale: id,
    })}`,
    margin,
    20
  );
  y = 34;

  // --------------------------------------------------------------- RINGKASAN
  sectionHeading('Ringkasan Keuangan');
  kv('Saldo total (lifetime)', formatRupiah(balance), balance >= 0 ? GREEN : DANGER);
  kv(single ? 'Pemasukan bulan ini' : 'Total pemasukan', formatRupiah(income), GREEN);
  kv(single ? 'Pengeluaran bulan ini' : 'Total pengeluaran', formatRupiah(expense), DANGER);
  kv('Arus kas bersih', formatRupiah(net), net >= 0 ? GREEN : DANGER);
  kv('Rata-rata pengeluaran/hari', formatRupiah(Math.round(summary.avgPerDay)));
  if (!single) {
    kv('Rata-rata pengeluaran/bulan', formatRupiah(Math.round(expense / months)));
  }
  if (monthlyBudget > 0) {
    const remain = budgetForPeriod - expense;
    kv(
      single ? 'Budget bulanan' : `Budget ${months} bulan`,
      formatRupiah(budgetForPeriod)
    );
    kv(
      remain >= 0 ? 'Sisa budget' : 'Lewat budget',
      formatRupiah(Math.abs(remain)),
      remain >= 0 ? GREEN : DANGER
    );
  }

  // ------------------------------------------------------- RINCIAN PER BULAN
  if (breakdown.length) {
    sectionHeading('Rincian per Bulan');
    tableRow(['Bulan', 'Masuk', 'Keluar', 'Bersih'], { bold: true, colors: [SUB, SUB, SUB, SUB] });
    breakdown.forEach((m) => {
      tableRow(
        [m.label, formatRupiah(m.income), formatRupiah(m.expense), formatRupiah(m.net)],
        { colors: [TEXT, GREEN, DANGER, m.net >= 0 ? GREEN : DANGER] }
      );
    });
    tableRow(
      ['Total', formatRupiah(income), formatRupiah(expense), formatRupiah(net)],
      { bold: true, colors: [TEXT, GREEN, DANGER, net >= 0 ? GREEN : DANGER] }
    );
  }

  // ---------------------------------------------------- PENGELUARAN/KATEGORI
  if (byCat.length) {
    sectionHeading('Pengeluaran per Kategori');
    byCat.forEach((c) => {
      const p = expense > 0 ? Math.round((c.value / expense) * 100) : 0;
      kv(c.name, `${formatRupiah(c.value)}  (${p}%)`);
    });
  }

  // ----------------------------------------------------------- KEBIASAAN MAKAN
  if (food.length) {
    sectionHeading('Kebiasaan Makan');
    food.forEach((f) => kv(f.name, `${f.value} menu`));
  }

  // -------------------------------------------------------------- APRESIASI
  if (insights.appreciations.length) {
    sectionHeading('Apresiasi');
    insights.appreciations.forEach((t) => bullet(t, GREEN));
  }

  // -------------------------------------------------------------- KESIMPULAN
  if (insights.conclusions.length) {
    sectionHeading('Kesimpulan');
    insights.conclusions.forEach((t) => bullet(t));
  }

  // ------------------------------------------------------------- REKOMENDASI
  if (insights.recommendations.length) {
    sectionHeading('Rekomendasi Kritis');
    insights.recommendations.forEach((r) =>
      bullet(r.text, LEVEL_COLOR[r.level] || TEXT, LEVEL_TAG[r.level])
    );
  }

  // ------------------------------------------------------------------ FOOTER
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...SUB);
    doc.text(
      'Dibuat dengan Gue Ngekost. Data tersimpan lokal di perangkatmu.',
      margin,
      pageH - 8
    );
    doc.text(`Hal. ${i}/${pages}`, margin + contentW, pageH - 8, { align: 'right' });
  }

  const fileTag = single ? format(end, 'yyyy-MM') : `${months}bulan-${format(end, 'yyyy-MM')}`;
  const fileName = `gue-ngekost-analitik-${fileTag}.pdf`;
  doc.save(fileName);
}
