import { getDaysInMonth, isSameMonth, isWithinInterval, parseISO } from 'date-fns';
import {
  monthTotals,
  spendingByCategory,
  analyticsSummary,
  rangeTotals,
  rangeSummary,
  spendingByCategoryRange,
} from './analytics';
import { formatRupiah } from './formatters';
import { getLang } from '../i18n';

const pct = (part, whole) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

/**
 * Turns raw finance + food data into honest, data-driven insights.
 * Bilingual: sentences follow the active UI language (id default / en).
 * Every line cites a real number from the user's own data,no generic filler.
 */
export function financialInsights(transactions, entries, monthlyBudget, ref = new Date()) {
  const en = getLang() === 'en';
  const { income, expense, net } = monthTotals(transactions, ref);
  const summary = analyticsSummary(transactions, entries, ref);
  const byCat = spendingByCategory(transactions, ref);

  const daysElapsed = ref.getDate();
  const daysInMonth = getDaysInMonth(ref);
  const avgPerDay = summary.avgPerDay;
  const projected = Math.round(avgPerDay * daysInMonth);

  const topCat = byCat[0];
  const topName = topCat?.name;
  const topPct = topCat ? pct(topCat.value, expense) : 0;
  const savingsRate = income > 0 ? pct(net, income) : null;

  const monthFood = entries.filter((e) => isSameMonth(parseISO(`${e.date}T00:00:00`), ref));
  const foodSpend = monthFood.reduce((s, e) => s + (e.cost || 0), 0);
  const cookCount = monthFood.filter((e) => e.category === 'masak').length;
  const buyCount = monthFood.length - cookCount;

  const appreciations = [];
  const conclusions = [];
  const recommendations = [];
  const hasData = transactions.length > 0;

  // ----------------------------------------------------------- APPRECIATION
  if (net > 0) {
    appreciations.push(
      en
        ? `You're in surplus by ${formatRupiah(net)} this month,spending is still below income. Keep it up.`
        : `Bulan ini kamu surplus ${formatRupiah(net)},pengeluaran masih di bawah pemasukan. Pertahankan.`
    );
  }
  if (monthlyBudget > 0 && expense <= monthlyBudget && expense > 0) {
    appreciations.push(
      en
        ? `Spending (${formatRupiah(expense)}) is still within the ${formatRupiah(monthlyBudget)} budget. Nice discipline.`
        : `Pengeluaran (${formatRupiah(expense)}) masih di dalam budget ${formatRupiah(monthlyBudget)}. Disiplinmu kelihatan.`
    );
  }
  if (savingsRate !== null && savingsRate >= 20) {
    appreciations.push(
      en
        ? `You're saving ${savingsRate}% of income,above the healthy 20% mark. Great.`
        : `Kamu nyisihin ${savingsRate}% dari pemasukan,di atas standar sehat 20%. Keren.`
    );
  }
  if (transactions.length >= 10) {
    appreciations.push(
      en
        ? `${transactions.length} transactions logged. This logging habit is what makes your finances readable.`
        : `Ada ${transactions.length} transaksi tercatat. Kebiasaan nyatat kayak gini yang bikin keuangan kebaca.`
    );
  }
  if (cookCount > 0 && cookCount >= buyCount && monthFood.length > 0) {
    appreciations.push(
      en
        ? `Of ${monthFood.length} meals logged, ${cookCount} were home-cooked. Cheap and healthy.`
        : `Dari ${monthFood.length} catatan makan, ${cookCount} di antaranya masak sendiri. Hemat dan sehat.`
    );
  }

  // ------------------------------------------------------------- CONCLUSION
  if (hasData) {
    conclusions.push(
      en
        ? `Total spending this month is ${formatRupiah(expense)}, averaging ${formatRupiah(Math.round(avgPerDay))}/day (over ${daysElapsed} days so far).`
        : `Total pengeluaran bulan ini ${formatRupiah(expense)}, rata-rata ${formatRupiah(Math.round(avgPerDay))}/hari (dari ${daysElapsed} hari berjalan).`
    );
    if (income > 0) {
      conclusions.push(
        en
          ? `Income is ${formatRupiah(income)}, so net cash flow is ${net >= 0 ? 'positive' : 'negative'} ${formatRupiah(Math.abs(net))}.`
          : `Pemasukan ${formatRupiah(income)}, sehingga arus kas bersih ${net >= 0 ? 'positif' : 'negatif'} ${formatRupiah(Math.abs(net))}.`
      );
    }
    if (topCat) {
      conclusions.push(
        en
          ? `Biggest category: ${topName} (${formatRupiah(topCat.value)}, ${topPct}% of total).`
          : `Pos terbesar: ${topName} (${formatRupiah(topCat.value)}, ${topPct}% dari total).`
      );
    }
    if (summary.worstDayAmount > 0) {
      conclusions.push(
        en
          ? `Most expensive day: ${summary.worstDay} with ${formatRupiah(summary.worstDayAmount)}.`
          : `Hari paling boros: ${summary.worstDay} dengan ${formatRupiah(summary.worstDayAmount)}.`
      );
    }
    if (monthFood.length > 0) {
      conclusions.push(
        en
          ? `${monthFood.length} meals logged, total food cost ${formatRupiah(foodSpend)}.`
          : `Tercatat ${monthFood.length} kali makan, total biaya makan ${formatRupiah(foodSpend)}.`
      );
    }
  } else {
    conclusions.push(
      en
        ? 'No transactions this month yet. Start logging income & expenses so this analysis has something to work with.'
        : 'Belum ada transaksi bulan ini. Mulai catat pemasukan & pengeluaran biar analitik ini berisi.'
    );
  }

  // ---------------------------------------------------------- RECOMMENDATION
  if (monthlyBudget > 0 && projected > monthlyBudget && expense > 0) {
    const over = projected - monthlyBudget;
    recommendations.push({
      level: 'danger',
      text: en
        ? `At ${formatRupiah(Math.round(avgPerDay))}/day, the month-end projection is ${formatRupiah(projected)},OVER the ${formatRupiah(monthlyBudget)} budget by ${formatRupiah(over)}. Slow down spending now, don't wait until month-end.`
        : `Dengan laju ${formatRupiah(Math.round(avgPerDay))}/hari, proyeksi akhir bulan ${formatRupiah(projected)},MELEBIHI budget ${formatRupiah(monthlyBudget)} sebesar ${formatRupiah(over)}. Rem pengeluaran mulai sekarang, jangan tunggu tanggal tua.`,
    });
  }
  if (income > 0 && net < 0) {
    recommendations.push({
      level: 'danger',
      text: en
        ? `You're in a ${formatRupiah(Math.abs(net))} deficit this month. If this keeps up, savings will erode. Cut the biggest category or add income.`
        : `Kamu defisit ${formatRupiah(Math.abs(net))} bulan ini. Kalau pola ini jalan terus, saldo bakal kegerus. Pangkas pos terbesar atau tambah pemasukan.`,
    });
  }
  if (topCat && topPct >= 40) {
    recommendations.push({
      level: 'warning',
      text: en
        ? `${topName} eats up ${topPct}% of spending,too concentrated. Try cutting it 15-20%; that hits the total hardest.`
        : `${topName} menyedot ${topPct}% pengeluaran,terlalu terpusat. Coba turunin pos ini 15-20%, dampaknya paling kerasa ke total.`,
    });
  }
  if (monthFood.length >= 5 && buyCount > cookCount * 2) {
    recommendations.push({
      level: 'warning',
      text: en
        ? `${buyCount} of ${monthFood.length} meals were bought/delivered, not cooked. A classic budget trap,cooking 2-3x a week already curbs food cost (${formatRupiah(foodSpend)}).`
        : `${buyCount} dari ${monthFood.length} makanmu beli/ojol, bukan masak. Ini jebakan boros klasik anak kost,masak 2-3x seminggu aja udah lumayan ngerem biaya makan (${formatRupiah(foodSpend)}).`,
    });
  }
  if (savingsRate !== null && savingsRate >= 0 && savingsRate < 10) {
    recommendations.push({
      level: 'warning',
      text: en
        ? `You're only saving ${savingsRate}% of income. Aim to set aside at least 10-20% at the start of the month, not from leftovers.`
        : `Kamu cuma nyisihin ${savingsRate}% dari pemasukan. Targetin minimal 10-20% disisihin di awal bulan, bukan dari sisa.`,
    });
  }
  if (expense > 0 && income === 0) {
    recommendations.push({
      level: 'info',
      text: en
        ? 'There are expenses but no income logged this month. Log money coming in too so cash flow is accurate.'
        : 'Ada pengeluaran tapi belum ada pemasukan tercatat bulan ini. Catat uang masuk juga biar arus kas akurat.',
    });
  }
  if (!monthlyBudget || monthlyBudget <= 0) {
    recommendations.push({
      level: 'info',
      text: en
        ? "No monthly budget set yet. Set a limit on the dashboard so the app can warn you before you overspend."
        : 'Belum set budget bulanan. Tetapin batas di dashboard biar app bisa ngingetin sebelum kebablasan.',
    });
  }
  if (recommendations.length === 0 && hasData) {
    recommendations.push({
      level: 'info',
      text: en
        ? 'Your finances look healthy this month,no red flags. Keep the rhythm and start building an emergency fund.'
        : 'Keuanganmu bulan ini sehat,nggak ada red flag. Pertahankan ritmenya dan mulai sisihin buat dana darurat.',
    });
  }

  return { appreciations, conclusions, recommendations };
}

/**
 * Aggregate, period-aware insights for multi-month reports (6 months / 1 year).
 * Wording is neutral about time ("dalam X bulan ini" / "over these X months")
 * and the budget is compared against the period (monthlyBudget * months),
 * since a single month-end projection makes no sense across a long span.
 */
export function periodInsights(transactions, entries, monthlyBudget, range) {
  const { start, end, months } = range;
  const en = getLang() === 'en';
  const periodWord = en ? `over these ${months} months` : `dalam ${months} bulan ini`;
  const perMonth = en ? '/month' : '/bulan';

  const { income, expense, net } = rangeTotals(transactions, start, end);
  const summary = rangeSummary(transactions, entries, start, end);
  const byCat = spendingByCategoryRange(transactions, start, end);
  const avgPerDay = summary.avgPerDay;
  const avgExpensePerMonth = Math.round(expense / months);
  const avgIncomePerMonth = Math.round(income / months);

  const topCat = byCat[0];
  const topName = topCat?.name;
  const topPct = topCat ? pct(topCat.value, expense) : 0;
  const savingsRate = income > 0 ? pct(net, income) : null;

  const periodFood = entries.filter((e) =>
    isWithinInterval(parseISO(`${e.date}T00:00:00`), { start, end })
  );
  const foodSpend = periodFood.reduce((s, e) => s + (e.cost || 0), 0);
  const cookCount = periodFood.filter((e) => e.category === 'masak').length;
  const buyCount = periodFood.length - cookCount;

  const txCount = transactions.filter((t) => isWithinInterval(parseISO(t.date), { start, end })).length;
  const budgetForPeriod = monthlyBudget > 0 ? monthlyBudget * months : 0;

  const appreciations = [];
  const conclusions = [];
  const recommendations = [];
  const hasData = txCount > 0;

  // ----------------------------------------------------------- APPRECIATION
  if (net > 0) {
    appreciations.push(
      en
        ? `You're in surplus by ${formatRupiah(net)} ${periodWord}, spending stayed below income. Keep it up.`
        : `${periodWord[0].toUpperCase()}${periodWord.slice(1)} kamu surplus ${formatRupiah(net)}, pengeluaran tetap di bawah pemasukan. Pertahankan.`
    );
  }
  if (budgetForPeriod > 0 && expense <= budgetForPeriod && expense > 0) {
    appreciations.push(
      en
        ? `Spending averaged ${formatRupiah(avgExpensePerMonth)}${perMonth}, within the ${formatRupiah(monthlyBudget)}${perMonth} budget. Nice discipline.`
        : `Pengeluaran rata-rata ${formatRupiah(avgExpensePerMonth)}${perMonth}, masih di dalam budget ${formatRupiah(monthlyBudget)}${perMonth}. Disiplinmu kelihatan.`
    );
  }
  if (savingsRate !== null && savingsRate >= 20) {
    appreciations.push(
      en
        ? `You saved ${savingsRate}% of income ${periodWord}, above the healthy 20% mark. Great.`
        : `Kamu nyisihin ${savingsRate}% dari pemasukan ${periodWord}, di atas standar sehat 20%. Keren.`
    );
  }
  if (cookCount > 0 && cookCount >= buyCount && periodFood.length > 0) {
    appreciations.push(
      en
        ? `Of ${periodFood.length} meals logged, ${cookCount} were home-cooked. Cheap and healthy.`
        : `Dari ${periodFood.length} catatan makan, ${cookCount} di antaranya masak sendiri. Hemat dan sehat.`
    );
  }

  // ------------------------------------------------------------- CONCLUSION
  if (hasData) {
    conclusions.push(
      en
        ? `Total spending ${periodWord} is ${formatRupiah(expense)}, averaging ${formatRupiah(avgExpensePerMonth)}${perMonth} (${formatRupiah(Math.round(avgPerDay))}/day).`
        : `Total pengeluaran ${periodWord} ${formatRupiah(expense)}, rata-rata ${formatRupiah(avgExpensePerMonth)}${perMonth} (${formatRupiah(Math.round(avgPerDay))}/hari).`
    );
    if (income > 0) {
      conclusions.push(
        en
          ? `Income totals ${formatRupiah(income)} (${formatRupiah(avgIncomePerMonth)}${perMonth}), so net cash flow is ${net >= 0 ? 'positive' : 'negative'} ${formatRupiah(Math.abs(net))}.`
          : `Pemasukan total ${formatRupiah(income)} (${formatRupiah(avgIncomePerMonth)}${perMonth}), sehingga arus kas bersih ${net >= 0 ? 'positif' : 'negatif'} ${formatRupiah(Math.abs(net))}.`
      );
    }
    if (topCat) {
      conclusions.push(
        en
          ? `Biggest category: ${topName} (${formatRupiah(topCat.value)}, ${topPct}% of total).`
          : `Pos terbesar: ${topName} (${formatRupiah(topCat.value)}, ${topPct}% dari total).`
      );
    }
    if (summary.worstDayAmount > 0) {
      conclusions.push(
        en
          ? `Most expensive single day: ${summary.worstDay} with ${formatRupiah(summary.worstDayAmount)}.`
          : `Hari paling boros: ${summary.worstDay} dengan ${formatRupiah(summary.worstDayAmount)}.`
      );
    }
    if (periodFood.length > 0) {
      conclusions.push(
        en
          ? `${periodFood.length} meals logged, total food cost ${formatRupiah(foodSpend)}.`
          : `Tercatat ${periodFood.length} kali makan, total biaya makan ${formatRupiah(foodSpend)}.`
      );
    }
  } else {
    conclusions.push(
      en
        ? 'No transactions in this period yet. Start logging income & expenses so this report has something to work with.'
        : 'Belum ada transaksi di periode ini. Mulai catat pemasukan & pengeluaran biar laporan ini berisi.'
    );
  }

  // ---------------------------------------------------------- RECOMMENDATION
  if (budgetForPeriod > 0 && expense > budgetForPeriod && expense > 0) {
    const over = expense - budgetForPeriod;
    recommendations.push({
      level: 'danger',
      text: en
        ? `Spending of ${formatRupiah(expense)} is OVER the ${formatRupiah(budgetForPeriod)} budget for this period by ${formatRupiah(over)} (avg ${formatRupiah(avgExpensePerMonth)}${perMonth} vs ${formatRupiah(monthlyBudget)}${perMonth}). Tighten the biggest categories.`
        : `Pengeluaran ${formatRupiah(expense)} MELEBIHI budget ${formatRupiah(budgetForPeriod)} untuk periode ini sebesar ${formatRupiah(over)} (rata-rata ${formatRupiah(avgExpensePerMonth)}${perMonth} vs ${formatRupiah(monthlyBudget)}${perMonth}). Rem pos terbesar.`,
    });
  }
  if (income > 0 && net < 0) {
    recommendations.push({
      level: 'danger',
      text: en
        ? `You're in a ${formatRupiah(Math.abs(net))} deficit ${periodWord}. If this keeps up, savings will erode. Cut the biggest category or add income.`
        : `Kamu defisit ${formatRupiah(Math.abs(net))} ${periodWord}. Kalau pola ini jalan terus, saldo bakal kegerus. Pangkas pos terbesar atau tambah pemasukan.`,
    });
  }
  if (topCat && topPct >= 40) {
    recommendations.push({
      level: 'warning',
      text: en
        ? `${topName} eats up ${topPct}% of spending, too concentrated. Trimming it 15-20% hits the total hardest.`
        : `${topName} menyedot ${topPct}% pengeluaran, terlalu terpusat. Turunin pos ini 15-20%, dampaknya paling kerasa ke total.`,
    });
  }
  if (periodFood.length >= 5 && buyCount > cookCount * 2) {
    recommendations.push({
      level: 'warning',
      text: en
        ? `${buyCount} of ${periodFood.length} meals were bought/delivered, not cooked. Cooking 2-3x a week curbs food cost (${formatRupiah(foodSpend)} so far).`
        : `${buyCount} dari ${periodFood.length} makanmu beli/ojol, bukan masak. Masak 2-3x seminggu aja udah lumayan ngerem biaya makan (${formatRupiah(foodSpend)}).`,
    });
  }
  if (savingsRate !== null && savingsRate >= 0 && savingsRate < 10) {
    recommendations.push({
      level: 'warning',
      text: en
        ? `You only saved ${savingsRate}% of income across this period. Aim for at least 10-20%, set aside at the start of each month.`
        : `Kamu cuma nyisihin ${savingsRate}% dari pemasukan sepanjang periode ini. Targetin minimal 10-20%, disisihin di awal tiap bulan.`,
    });
  }
  if (!monthlyBudget || monthlyBudget <= 0) {
    recommendations.push({
      level: 'info',
      text: en
        ? 'No monthly budget set yet. Set a limit on the dashboard so the app can warn you before you overspend.'
        : 'Belum set budget bulanan. Tetapin batas di dashboard biar app bisa ngingetin sebelum kebablasan.',
    });
  }
  if (recommendations.length === 0 && hasData) {
    recommendations.push({
      level: 'info',
      text: en
        ? 'Your finances look healthy across this period, no red flags. Keep the rhythm and keep building your emergency fund.'
        : 'Keuanganmu sehat sepanjang periode ini, nggak ada red flag. Pertahankan ritmenya dan terus isi dana darurat.',
    });
  }

  return { appreciations, conclusions, recommendations };
}
