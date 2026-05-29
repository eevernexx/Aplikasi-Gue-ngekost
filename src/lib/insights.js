import { getDaysInMonth, isSameMonth, parseISO } from 'date-fns';
import { monthTotals, spendingByCategory, analyticsSummary } from './analytics';
import { formatRupiah } from './formatters';

const d = (s) => (typeof s === 'string' ? parseISO(s) : s);
const pct = (part, whole) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

/**
 * Turns raw finance + food data into honest, data-driven insights:
 * - appreciations: what the user is doing well (positive reinforcement)
 * - conclusions:   neutral read of the numbers
 * - recommendations: critical, actionable advice with a severity level
 *
 * Every line cites a real number from the user's own data — no generic filler.
 */
export function financialInsights(
  transactions,
  entries,
  monthlyBudget,
  ref = new Date()
) {
  const { income, expense, net } = monthTotals(transactions, ref);
  const summary = analyticsSummary(transactions, entries, ref);
  const byCat = spendingByCategory(transactions, ref);

  const daysElapsed = ref.getDate();
  const daysInMonth = getDaysInMonth(ref);
  const avgPerDay = summary.avgPerDay;
  const projected = Math.round(avgPerDay * daysInMonth);

  const topCat = byCat[0];
  const topPct = topCat ? pct(topCat.value, expense) : 0;
  const savingsRate = income > 0 ? pct(net, income) : null;

  // Food: this month's entries, cost, and "beli vs masak" split.
  const monthFood = entries.filter((e) =>
    isSameMonth(parseISO(`${e.date}T00:00:00`), ref)
  );
  const foodSpend = monthFood.reduce((s, e) => s + (e.cost || 0), 0);
  const cookCount = monthFood.filter((e) => e.category === 'masak').length;
  const buyCount = monthFood.length - cookCount;

  const appreciations = [];
  const conclusions = [];
  const recommendations = [];

  const hasData = transactions.length > 0;

  // ---------------------------------------------------------------- APRESIASI
  if (net > 0) {
    appreciations.push(
      `Bulan ini kamu surplus ${formatRupiah(net)} — pengeluaran masih di bawah pemasukan. Pertahankan.`
    );
  }
  if (monthlyBudget > 0 && expense <= monthlyBudget && expense > 0) {
    appreciations.push(
      `Pengeluaran (${formatRupiah(expense)}) masih di dalam budget ${formatRupiah(
        monthlyBudget
      )}. Disiplinmu kelihatan.`
    );
  }
  if (savingsRate !== null && savingsRate >= 20) {
    appreciations.push(
      `Kamu nyisihin ${savingsRate}% dari pemasukan — di atas standar sehat 20%. Keren.`
    );
  }
  if (transactions.length >= 10) {
    appreciations.push(
      `Ada ${transactions.length} transaksi tercatat. Kebiasaan nyatat kayak gini yang bikin keuangan kebaca.`
    );
  }
  if (cookCount > 0 && cookCount >= buyCount && monthFood.length > 0) {
    appreciations.push(
      `Dari ${monthFood.length} catatan makan, ${cookCount} di antaranya masak sendiri. Hemat dan sehat.`
    );
  }

  // --------------------------------------------------------------- KESIMPULAN
  if (hasData) {
    conclusions.push(
      `Total pengeluaran bulan ini ${formatRupiah(
        expense
      )}, rata-rata ${formatRupiah(Math.round(avgPerDay))}/hari (dari ${daysElapsed} hari berjalan).`
    );
    if (income > 0) {
      conclusions.push(
        `Pemasukan ${formatRupiah(income)}, sehingga arus kas bersih ${
          net >= 0 ? 'positif' : 'negatif'
        } ${formatRupiah(Math.abs(net))}.`
      );
    }
    if (topCat) {
      conclusions.push(
        `Pos terbesar: ${topCat.name} (${formatRupiah(topCat.value)}, ${topPct}% dari total).`
      );
    }
    if (summary.worstDayAmount > 0) {
      conclusions.push(
        `Hari paling boros: ${summary.worstDay} dengan ${formatRupiah(
          summary.worstDayAmount
        )}.`
      );
    }
    if (monthFood.length > 0) {
      conclusions.push(
        `Tercatat ${monthFood.length} kali makan, total biaya makan ${formatRupiah(
          foodSpend
        )}.`
      );
    }
  } else {
    conclusions.push(
      'Belum ada transaksi bulan ini. Mulai catat pemasukan & pengeluaran biar analitik ini berisi.'
    );
  }

  // ------------------------------------------------------------- REKOMENDASI
  // Projected overspend vs budget (the most important warning).
  if (monthlyBudget > 0 && projected > monthlyBudget && expense > 0) {
    const over = projected - monthlyBudget;
    recommendations.push({
      level: 'danger',
      text: `Dengan laju ${formatRupiah(
        Math.round(avgPerDay)
      )}/hari, proyeksi akhir bulan ${formatRupiah(
        projected
      )} — MELEBIHI budget ${formatRupiah(monthlyBudget)} sebesar ${formatRupiah(
        over
      )}. Rem pengeluaran mulai sekarang, jangan tunggu tanggal tua.`,
    });
  }

  // Deficit this month.
  if (income > 0 && net < 0) {
    recommendations.push({
      level: 'danger',
      text: `Kamu defisit ${formatRupiah(
        Math.abs(net)
      )} bulan ini. Kalau pola ini jalan terus, saldo bakal kegerus. Pangkas pos terbesar atau tambah pemasukan.`,
    });
  }

  // Over-concentrated spending.
  if (topCat && topPct >= 40) {
    recommendations.push({
      level: 'warning',
      text: `${topCat.name} menyedot ${topPct}% pengeluaran — terlalu terpusat. Coba turunin pos ini 15–20%, dampaknya paling kerasa ke total.`,
    });
  }

  // Buy-heavy food habit.
  if (monthFood.length >= 5 && buyCount > cookCount * 2) {
    recommendations.push({
      level: 'warning',
      text: `${buyCount} dari ${monthFood.length} makanmu beli/ojol, bukan masak. Ini jebakan boros klasik anak kost — masak 2–3x seminggu aja udah lumayan ngerem biaya makan (${formatRupiah(
        foodSpend
      )}).`,
    });
  }

  // Low savings rate.
  if (savingsRate !== null && savingsRate >= 0 && savingsRate < 10) {
    recommendations.push({
      level: 'warning',
      text: `Kamu cuma nyisihin ${savingsRate}% dari pemasukan. Targetin minimal 10–20% disisihin di awal bulan, bukan dari sisa.`,
    });
  }

  // Expense but no income logged — data hygiene.
  if (expense > 0 && income === 0) {
    recommendations.push({
      level: 'info',
      text: 'Ada pengeluaran tapi belum ada pemasukan tercatat bulan ini. Catat uang masuk juga biar arus kas akurat.',
    });
  }

  // No budget set at all.
  if (!monthlyBudget || monthlyBudget <= 0) {
    recommendations.push({
      level: 'info',
      text: 'Belum set budget bulanan. Tetapin batas di dashboard biar app bisa ngingetin sebelum kebablasan.',
    });
  }

  // Everything looks healthy.
  if (recommendations.length === 0 && hasData) {
    recommendations.push({
      level: 'info',
      text: 'Keuanganmu bulan ini sehat — nggak ada red flag. Pertahankan ritmenya dan mulai sisihin buat dana darurat.',
    });
  }

  return { appreciations, conclusions, recommendations };
}
