import { differenceInCalendarDays, format, parseISO, startOfDay, endOfDay } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  rangeTotals,
  spendingByCategoryRange,
  incomeByCategoryRange,
  foodBreakdownRange,
  rangeSummary,
  dailyBreakdownRange,
  transactionsInRange,
  foodEntriesInRange,
  totalBalance,
} from './analytics';
import { formatRupiah } from './formatters';
import { periodInsights } from './insights';
import { FOOD_CATEGORIES } from '../store/useFoodStore';

const GREEN   = [27, 67, 50];
const MID     = [64, 145, 108];
const LIGHT   = [149, 213, 178];
const TEXT    = [28, 25, 23];
const SUB     = [107, 114, 128];
const DANGER  = [220, 38, 38];
const WARNING = [217, 151, 6];
const BGROW   = [248, 250, 252];
const WHITE   = [255, 255, 255];

const LEVEL_COLOR = { danger: DANGER, warning: WARNING, info: MID };
const LEVEL_TAG   = { danger: 'PENTING', warning: 'PERHATIAN', info: 'INFO' };

const FOOD_CAT_LABEL = Object.fromEntries(
  FOOD_CATEGORIES.map((c) => [c.key, c.label])
);
const TIME_LABEL = { '06': 'Pagi', '07': 'Pagi', '08': 'Pagi', '09': 'Pagi', '10': 'Pagi', '11': 'Pagi',
                     '12': 'Siang', '13': 'Siang', '14': 'Siang', '15': 'Siang',
                     '16': 'Sore', '17': 'Sore', '18': 'Sore',
                     '19': 'Malam', '20': 'Malam', '21': 'Malam', '22': 'Malam', '23': 'Malam',
                     '00': 'Malam', '01': 'Malam', '02': 'Malam', '03': 'Malam', '04': 'Pagi', '05': 'Pagi' };

function timeLabel(timeStr) {
  if (!timeStr) return '-';
  const hh = timeStr.slice(0, 2);
  return TIME_LABEL[hh] || timeStr;
}

/**
 * Builds and downloads a comprehensive PDF analytics report
 * for a custom date range (max 30 days).
 */
export async function exportAnalyticsPdf({
  transactions,
  entries,
  monthlyBudget,
  startDate,
  endDate,
  userName = '',
}) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = margin;

  const start = startOfDay(typeof startDate === 'string' ? parseISO(startDate) : startDate);
  const end   = endOfDay(typeof endDate === 'string' ? parseISO(endDate) : endDate);
  const totalDays = differenceInCalendarDays(end, start) + 1;

  const periodLabel = `${format(start, 'd MMM yyyy', { locale: id })} - ${format(end, 'd MMM yyyy', { locale: id })}`;

  // ─── data ────────────────────────────────────────────────────────────────
  const { income, expense, net } = rangeTotals(transactions, start, end);
  const summary   = rangeSummary(transactions, entries, start, end);
  const byCat     = spendingByCategoryRange(transactions, start, end);
  const byIncome  = incomeByCategoryRange(transactions, start, end);
  const food      = foodBreakdownRange(entries, start, end);
  const balance   = totalBalance(transactions);
  const daily     = dailyBreakdownRange(transactions, start, end);
  const txList    = transactionsInRange(transactions, start, end);
  const foodList  = foodEntriesInRange(entries, start, end);
  const insights  = periodInsights(transactions, entries, monthlyBudget, {
    start,
    end: endOfDay(end),
    months: Math.max(1, Math.ceil(totalDays / 30)),
  });

  const savingsRate = income > 0 ? Math.round((net / income) * 100) : null;
  const foodSpend   = foodList.reduce((s, e) => s + (e.cost || 0), 0);
  const foodKcal    = foodList.reduce((s, e) => s + (e.calories || 0), 0);
  const cookCount   = foodList.filter((e) => e.category === 'masak').length;

  // ─── helpers ─────────────────────────────────────────────────────────────
  const ensure = (h) => {
    if (y + h > pageH - 12) {
      doc.addPage();
      y = margin;
    }
  };

  const sectionHeading = (text) => {
    ensure(16);
    y += 4;
    doc.setFillColor(...GREEN);
    doc.rect(margin, y - 4, contentW, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...WHITE);
    doc.text(text.toUpperCase(), margin + 3, y);
    y += 7;
  };

  const kv = (key, value, valueColor = TEXT, bg = null) => {
    ensure(7);
    if (bg) {
      doc.setFillColor(...bg);
      doc.rect(margin, y - 4.5, contentW, 6.5, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...SUB);
    doc.text(key, margin + 3, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...valueColor);
    doc.text(value, margin + contentW - 3, y, { align: 'right' });
    y += 6.5;
  };

  const divider = () => {
    ensure(4);
    doc.setDrawColor(...LIGHT);
    doc.setLineWidth(0.25);
    doc.line(margin, y, margin + contentW, y);
    y += 3;
  };

  // Wrapped bullet point.
  const bullet = (text, color = TEXT, tag = null) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const indent = 5;
    const lines = doc.splitTextToSize(text, contentW - indent - 2);
    ensure(lines.length * 5 + 3);
    doc.setTextColor(...MID);
    doc.text('•', margin + 1, y);
    if (tag) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...color);
      doc.text(`[${tag}]`, margin + indent, y);
      const tagW = doc.getTextWidth(`[${tag}]`) + 2;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...TEXT);
      const firstLine = doc.splitTextToSize(text, contentW - indent - tagW - 1)[0];
      doc.text(firstLine, margin + indent + tagW, y);
      const rest = text.slice(firstLine.length).trim();
      y += 5;
      if (rest) {
        const restLines = doc.splitTextToSize(rest, contentW - indent - 1);
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

  // Category row with inline progress bar.
  const catRow = (name, value, total, idx) => {
    ensure(8);
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    const bg = idx % 2 === 0 ? BGROW : WHITE;
    doc.setFillColor(...bg);
    doc.rect(margin, y - 4.5, contentW, 7, 'F');

    // Bar
    const barMaxW = contentW * 0.35;
    const barW = Math.max(0.5, (pct / 100) * barMaxW);
    doc.setFillColor(...LIGHT);
    doc.rect(margin + contentW * 0.49, y - 3, barMaxW, 3, 'F');
    doc.setFillColor(...MID);
    doc.rect(margin + contentW * 0.49, y - 3, barW, 3, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...TEXT);
    doc.text(name, margin + 3, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...TEXT);
    doc.text(formatRupiah(value), margin + contentW * 0.46, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...SUB);
    doc.text(`${pct}%`, margin + contentW, y, { align: 'right' });
    y += 7;
  };

  // Generic table helpers
  const tRow = (cells, cols, { bold = false, colors = [], bg = null, fontSize = 8.5 } = {}) => {
    ensure(6.5);
    if (bg) {
      doc.setFillColor(...bg);
      doc.rect(margin, y - 4, contentW, 6, 'F');
    }
    doc.setFontSize(fontSize);
    cells.forEach((text, i) => {
      const col = cols[i];
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setTextColor(...(colors[i] || TEXT));
      const str = String(text ?? '');
      if (col.maxW) {
        const lines = doc.splitTextToSize(str, col.maxW);
        doc.text(lines[0], col.x, y, { align: col.align || 'left' });
      } else {
        doc.text(str, col.x, y, { align: col.align || 'left' });
      }
    });
    y += 6;
  };

  // ─── HEADER ───────────────────────────────────────────────────────────────
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, pageW, 30, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(...WHITE);
  doc.text('Gue Ngekost', margin, 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(216, 243, 220);
  doc.text('Laporan Keuangan Lengkap', margin, 17);
  doc.setFontSize(9);
  doc.text(`Periode: ${periodLabel}  (${totalDays} hari)`, margin, 22);
  doc.text(
    `Dibuat: ${format(new Date(), 'd MMM yyyy, HH:mm', { locale: id })}${userName ? `  •  ${userName}` : ''}`,
    margin, 27
  );
  y = 38;

  // ─── 1. RINGKASAN KEUANGAN ────────────────────────────────────────────────
  sectionHeading('1. Ringkasan Keuangan');
  kv('Saldo Total (Lifetime)', formatRupiah(balance), balance >= 0 ? GREEN : DANGER, BGROW);
  kv('Total Pemasukan', formatRupiah(income), GREEN);
  kv('Total Pengeluaran', formatRupiah(expense), DANGER, BGROW);
  kv('Arus Kas Bersih', formatRupiah(net), net >= 0 ? GREEN : DANGER);
  kv('Rata-rata Pengeluaran / Hari', formatRupiah(Math.round(summary.avgPerDay)), TEXT, BGROW);
  kv('Jumlah Transaksi', `${txList.length} transaksi`);
  kv('Rentang Laporan', `${totalDays} hari (${format(start, 'd MMM', { locale: id })} - ${format(end, 'd MMM yyyy', { locale: id })})`, TEXT, BGROW);

  if (savingsRate !== null) {
    kv(
      'Tingkat Tabungan',
      `${savingsRate}%${savingsRate >= 20 ? ' (Sehat)' : savingsRate >= 10 ? ' (Cukup)' : ' (Rendah)'}`,
      savingsRate >= 20 ? GREEN : savingsRate >= 10 ? WARNING : DANGER
    );
  }

  if (monthlyBudget > 0) {
    divider();
    const budgetPeriod = Math.round(monthlyBudget * (totalDays / 30));
    const remain = budgetPeriod - expense;
    kv('Budget (Proporsional)', formatRupiah(budgetPeriod), TEXT, BGROW);
    kv(
      remain >= 0 ? 'Sisa Budget' : 'Melewati Budget',
      formatRupiah(Math.abs(remain)),
      remain >= 0 ? GREEN : DANGER
    );
    if (expense > 0) {
      const usedPct = Math.round((expense / budgetPeriod) * 100);
      kv('Budget Terpakai', `${usedPct}%`, usedPct > 100 ? DANGER : usedPct > 80 ? WARNING : MID, BGROW);
    }
  }

  if (summary.worstDayAmount > 0) {
    divider();
    kv('Hari Paling Boros', summary.worstDay, DANGER);
    kv('Pengeluaran Hari Terboros', formatRupiah(summary.worstDayAmount), DANGER, BGROW);
  }

  // ─── 2. PEMASUKAN PER KATEGORI ────────────────────────────────────────────
  if (byIncome.length) {
    sectionHeading('2. Pemasukan per Kategori');
    byIncome.forEach((c, i) => catRow(c.name, c.value, income, i));
    y += 2;
    kv('Total Pemasukan', formatRupiah(income), GREEN, BGROW);
  }

  // ─── 3. PENGELUARAN PER KATEGORI ─────────────────────────────────────────
  if (byCat.length) {
    sectionHeading('3. Pengeluaran per Kategori');
    byCat.forEach((c, i) => catRow(c.name, c.value, expense, i));
    y += 2;
    kv('Total Pengeluaran', formatRupiah(expense), DANGER, BGROW);
  }

  // ─── 4. RINCIAN HARIAN ───────────────────────────────────────────────────
  if (daily.length) {
    sectionHeading('4. Rincian Harian (Hari Aktif)');
    const cols4 = [
      { x: margin + 3,              maxW: 36 },
      { x: margin + contentW * 0.44, align: 'right' },
      { x: margin + contentW * 0.72, align: 'right' },
      { x: margin + contentW - 3,   align: 'right' },
    ];
    tRow(['Tanggal', 'Pemasukan', 'Pengeluaran', 'Bersih'], cols4, { bold: true, colors: [SUB, SUB, SUB, SUB], bg: BGROW, fontSize: 8 });
    let runNet = 0;
    daily.forEach((d, i) => {
      runNet += d.net;
      tRow(
        [d.label, formatRupiah(d.income), formatRupiah(d.expense), formatRupiah(d.net)],
        cols4,
        { bg: i % 2 === 0 ? null : BGROW, colors: [TEXT, d.income > 0 ? GREEN : SUB, d.expense > 0 ? DANGER : SUB, d.net >= 0 ? GREEN : DANGER] }
      );
    });
    tRow(['Total', formatRupiah(income), formatRupiah(expense), formatRupiah(net)], cols4, {
      bold: true, bg: BGROW, colors: [TEXT, GREEN, DANGER, net >= 0 ? GREEN : DANGER],
    });
  }

  // ─── 5. DAFTAR TRANSAKSI ─────────────────────────────────────────────────
  if (txList.length) {
    sectionHeading('5. Daftar Transaksi');
    const cols5 = [
      { x: margin + 3,               maxW: 24 },
      { x: margin + 28,              maxW: 32 },
      { x: margin + 62,              maxW: 58 },
      { x: margin + contentW * 0.77, align: 'right' },
      { x: margin + contentW - 3,    align: 'right' },
    ];
    tRow(['Tanggal', 'Kategori', 'Keterangan', 'Masuk', 'Keluar'], cols5, { bold: true, colors: [SUB, SUB, SUB, SUB, SUB], bg: BGROW, fontSize: 7.5 });

    txList.forEach((t, i) => {
      const dateStr = format(parseISO(t.date), 'd MMM yyyy', { locale: id });
      const note = t.note || '-';
      tRow(
        [dateStr, t.category, note, t.type === 'income' ? formatRupiah(t.amount) : '', t.type === 'expense' ? formatRupiah(t.amount) : ''],
        cols5,
        { bg: i % 2 === 0 ? null : BGROW, colors: [SUB, TEXT, TEXT, GREEN, DANGER], fontSize: 8 }
      );
    });
  }

  // ─── 6. KEBIASAAN MAKAN ──────────────────────────────────────────────────
  if (food.length || foodList.length) {
    sectionHeading('6. Kebiasaan Makan');
    kv('Total Catatan Makan', `${foodList.length} menu`, TEXT, BGROW);
    if (foodSpend > 0) kv('Total Biaya Makan', formatRupiah(foodSpend), DANGER);
    if (foodKcal > 0)  kv('Total Kalori', `${foodKcal.toLocaleString('id-ID')} kkal`, TEXT, BGROW);
    if (foodList.length > 0) {
      const avgCost = foodSpend > 0 ? Math.round(foodSpend / foodList.length) : 0;
      if (avgCost > 0) kv('Rata-rata Biaya / Menu', formatRupiah(avgCost), TEXT);
    }
    if (cookCount > 0) {
      kv('Masak Sendiri', `${cookCount} menu (${Math.round((cookCount / foodList.length) * 100)}%)`, GREEN, BGROW);
    }
    if (food.length) {
      divider();
      food.forEach((f, i) => {
        ensure(7);
        const bg = i % 2 === 0 ? null : BGROW;
        if (bg) { doc.setFillColor(...bg); doc.rect(margin, y - 4.5, contentW, 7, 'F'); }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...TEXT);
        doc.text(FOOD_CAT_LABEL[f.name] || f.name, margin + 3, y);
        doc.setFont('helvetica', 'bold');
        doc.text(`${f.value} menu`, margin + contentW - 3, y, { align: 'right' });
        y += 7;
      });
    }
  }

  // ─── 7. DAFTAR CATATAN MAKAN ─────────────────────────────────────────────
  if (foodList.length) {
    sectionHeading('7. Daftar Catatan Makan');
    const cols7 = [
      { x: margin + 3,               maxW: 22 },
      { x: margin + 26,              maxW: 14 },
      { x: margin + 42,              maxW: 50 },
      { x: margin + 94,              maxW: 28 },
      { x: margin + contentW * 0.76, align: 'right' },
      { x: margin + contentW - 3,    align: 'right' },
    ];
    tRow(['Tanggal', 'Waktu', 'Nama', 'Sumber', 'Kalori', 'Biaya'], cols7, { bold: true, colors: Array(6).fill(SUB), bg: BGROW, fontSize: 7.5 });

    foodList.forEach((e, i) => {
      tRow(
        [
          format(parseISO(`${e.date}T00:00:00`), 'd MMM', { locale: id }),
          timeLabel(e.time),
          e.name,
          FOOD_CAT_LABEL[e.category] || e.category,
          e.calories ? `${e.calories} kkal` : '-',
          e.cost ? formatRupiah(e.cost) : '-',
        ],
        cols7,
        { bg: i % 2 === 0 ? null : BGROW, colors: [SUB, SUB, TEXT, TEXT, TEXT, e.cost ? MID : SUB], fontSize: 8 }
      );
    });
  }

  // ─── 8. APRESIASI ────────────────────────────────────────────────────────
  if (insights.appreciations.length) {
    sectionHeading('8. Apresiasi');
    insights.appreciations.forEach((t) => bullet(t, GREEN));
  }

  // ─── 9. KESIMPULAN ───────────────────────────────────────────────────────
  if (insights.conclusions.length) {
    sectionHeading('9. Kesimpulan & Analisis');
    insights.conclusions.forEach((t) => bullet(t));
  }

  // ─── 10. REKOMENDASI ─────────────────────────────────────────────────────
  if (insights.recommendations.length) {
    sectionHeading('10. Rekomendasi Kritis');
    insights.recommendations.forEach((r) =>
      bullet(r.text, LEVEL_COLOR[r.level] || TEXT, LEVEL_TAG[r.level])
    );
  }

  // ─── FOOTER ──────────────────────────────────────────────────────────────
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    doc.setFillColor(...GREEN);
    doc.rect(0, pageH - 10, pageW, 10, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(216, 243, 220);
    doc.text('Gue Ngekost  •  Data tersimpan lokal di perangkatmu.', margin, pageH - 4);
    doc.text(`Hal. ${i}/${pages}`, pageW - margin, pageH - 4, { align: 'right' });
  }

  const startTag = format(start, 'yyyy-MM-dd');
  const endTag   = format(end,   'yyyy-MM-dd');
  doc.save(`gue-ngekost-laporan-${startTag}_${endTag}.pdf`);
}
