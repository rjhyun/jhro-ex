import { QuoteItem, EvaluatedQuote, PRGroup } from '../types';

export const BASE_DATE_STR = '2026-08-27';

function parseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.trim().split(/[-/]/);
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const d = new Date(year, month, day);
  return isNaN(d.getTime()) ? null : d;
}

function getDaysDiff(date1: Date, date2: Date): number {
  const diffTime = date1.getTime() - date2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

function calculateMedian(numbers: number[]): number | null {
  if (numbers.length === 0) return null;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

export function evaluateQuotes(rawQuotes: QuoteItem[]): EvaluatedQuote[] {
  const baseDate = parseDate(BASE_DATE_STR)!;

  // 1. Group by pr_no to calculate median prices and outliers
  const prGroupsMap = new Map<string, QuoteItem[]>();
  rawQuotes.forEach(q => {
    const list = prGroupsMap.get(q.pr_no) || [];
    list.push(q);
    prGroupsMap.set(q.pr_no, list);
  });

  // Check item code name discrepancies
  const itemCodeNamesMap = new Map<string, Set<string>>();
  rawQuotes.forEach(q => {
    const names = itemCodeNamesMap.get(q.item_code) || new Set<string>();
    if (q.item_name) {
      names.add(q.item_name.trim());
    }
    itemCodeNamesMap.set(q.item_code, names);
  });

  // Check PR status duplicates (multiple '발주' in one PR)
  const prOrderCountsMap = new Map<string, number>();
  rawQuotes.forEach(q => {
    if (q.status === '발주') {
      prOrderCountsMap.set(q.pr_no, (prOrderCountsMap.get(q.pr_no) || 0) + 1);
    }
  });

  // First pass: evaluate price state and median per PR
  const intermediate: Array<{
    quote: QuoteItem;
    median: number | null;
    validPricesCount: number;
  }> = [];

  prGroupsMap.forEach((quotesInPr) => {
    const validPrices = quotesInPr
      .map(q => q.unit_price)
      .filter((p): p is number => p !== null && !isNaN(p) && p > 0);

    const median = calculateMedian(validPrices);

    quotesInPr.forEach(q => {
      intermediate.push({
        quote: q,
        median,
        validPricesCount: validPrices.length,
      });
    });
  });

  // Find lowest price candidate per PR among eligible quotes (status/price valid, not outlier)
  // We need priceState first, but priceState depends on outlier. Outlier depends on median.
  // Let's compute priceState for each quote first.
  const tempEvaluated: Array<{
    quote: QuoteItem;
    priceState: EvaluatedQuote['priceState'];
    deviation: number | null;
    medianPrice: number | null;
  }> = intermediate.map(item => {
    const { quote, median, validPricesCount } = item;
    if (quote.unit_price === null || quote.unit_price === undefined || isNaN(quote.unit_price)) {
      return { quote, priceState: '단가 미기재', deviation: null, medianPrice: median };
    }
    if (validPricesCount < 3) {
      return { quote, priceState: '비교 불가', deviation: null, medianPrice: median };
    }
    if (median === null || median === 0) {
      return { quote, priceState: '정상', deviation: 0, medianPrice: median };
    }

    const deviation = ((quote.unit_price - median) / median) * 100;
    // Boundary: |deviation| > 30 is outlier. 30.0 -> 정상, 30.1 -> 이상치
    const isOutlier = Math.abs(deviation) > 30.0001;
    return {
      quote,
      priceState: isOutlier ? '이상치' : '정상',
      deviation: Math.round(deviation * 10) / 10,
      medianPrice: median,
    };
  });

  // Group temp by pr_no to find lowest price candidate
  const prLowestMap = new Map<string, string>(); // pr_no -> quote_id of lowest
  prGroupsMap.forEach((_, prNo) => {
    const groupItems = tempEvaluated.filter(t => t.quote.pr_no === prNo);
    // Eligible for lowest: priceState is '정상' or '비교 불가'
    const eligible = groupItems.filter(t => t.priceState === '정상' || t.priceState === '비교 불가');
    if (eligible.length > 0) {
      // Sort by unit_price asc, then quote_date asc, then quote_id asc
      eligible.sort((a, b) => {
        const priceA = a.quote.unit_price ?? Infinity;
        const priceB = b.quote.unit_price ?? Infinity;
        if (priceA !== priceB) return priceA - priceB;

        const dateA = a.quote.quote_date || '';
        const dateB = b.quote.quote_date || '';
        if (dateA !== dateB) return dateA.localeCompare(dateB);

        return a.quote.quote_id.localeCompare(b.quote.quote_id);
      });
      prLowestMap.set(prNo, eligible[0].quote.quote_id);
    }
  });

  // Second pass: final evaluated quotes
  const evaluated: EvaluatedQuote[] = tempEvaluated.map(item => {
    const { quote, priceState, deviation, medianPrice } = item;
    const isLowest = prLowestMap.get(quote.pr_no) === quote.quote_id;

    const promisedDateObj = parseDate(quote.promised_date);
    const requiredDateObj = parseDate(quote.required_date);

    let dDays: number | null = null;
    if (promisedDateObj) {
      dDays = getDaysDiff(promisedDateObj, baseDate);
    }

    let deliveryState: EvaluatedQuote['deliveryState'] = '판정 대상 아님';
    if (quote.status === '발주') {
      if (dDays === null) {
        deliveryState = '납기 미기재';
      } else if (dDays < 0) {
        deliveryState = '지연';
      } else if (dDays <= 7) {
        deliveryState = '임박';
      } else {
        deliveryState = '정상';
      }
    }

    let isExceededRequired = false;
    if (promisedDateObj && requiredDateObj) {
      isExceededRequired = promisedDateObj.getTime() > requiredDateObj.getTime();
    }

    const nameSet = itemCodeNamesMap.get(quote.item_code);
    const isNameDiscrepant = nameSet ? nameSet.size >= 2 : false;
    const orderCount = prOrderCountsMap.get(quote.pr_no) || 0;
    const isStatusDuplicate = orderCount > 1;

    return {
      ...quote,
      priceState,
      deviation,
      medianPrice,
      isLowest,
      dDays,
      deliveryState,
      isExceededRequired,
      isNameDiscrepant,
      isStatusDuplicate,
    };
  });

  return evaluated;
}

export function getPRGroups(evaluatedQuotes: EvaluatedQuote[]): PRGroup[] {
  const map = new Map<string, EvaluatedQuote[]>();
  evaluatedQuotes.forEach(q => {
    const list = map.get(q.pr_no) || [];
    list.push(q);
    map.set(q.pr_no, list);
  });

  const groups: PRGroup[] = [];
  map.forEach((quotes, prNo) => {
    const first = quotes[0];
    const orderCount = quotes.filter(q => q.status === '발주').length;
    const lowestQuote = quotes.find(q => q.isLowest) || null;
    const hasOutlier = quotes.some(q => q.priceState === '이상치');
    const hasDiscrepancy = quotes.some(q => q.isNameDiscrepant);
    const hasDelay = quotes.some(q => q.deliveryState === '지연');

    groups.push({
      prNo,
      itemCode: first.item_code,
      itemName: first.item_name,
      unit: first.unit,
      qty: first.qty,
      quotes,
      hasOrder: orderCount > 0,
      orderCount,
      lowestQuote,
      hasOutlier,
      hasDiscrepancy,
      hasDelay,
    });
  });

  return groups;
}

export function sortEvaluatedQuotes(quotes: EvaluatedQuote[]): EvaluatedQuote[] {
  // delivery_rank: 지연(0) / 임박(1) / 정상(2) / 납기 미기재(3) / 판정 대상 아님(4)
  const deliveryRankMap: Record<EvaluatedQuote['deliveryState'], number> = {
    '지연': 0,
    '임박': 1,
    '정상': 2,
    '납기 미기재': 3,
    '판정 대상 아님': 4,
  };

  return [...quotes].sort((a, b) => {
    const rankA = deliveryRankMap[a.deliveryState];
    const rankB = deliveryRankMap[b.deliveryState];
    if (rankA !== rankB) return rankA - rankB;

    const daysA = a.dDays !== null ? a.dDays : 99999;
    const daysB = b.dDays !== null ? b.dDays : 99999;
    if (daysA !== daysB) return daysA - daysB;

    if (a.pr_no !== b.pr_no) return a.pr_no.localeCompare(b.pr_no);

    const priceA = a.unit_price ?? 999999999;
    const priceB = b.unit_price ?? 999999999;
    return priceA - priceB;
  });
}

export function parseCSVData(csvText: string): QuoteItem[] {
  const lines = csvText.split(/\r\n|\n/);
  if (lines.length === 0) return [];

  // Parse header
  const headerLine = lines[0];
  const headers = headerLine.split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));

  const items: QuoteItem[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV row parser handling quotes if needed or comma split
    const row: string[] = [];
    let inQuote = false;
    let currentVal = '';
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"' || char === "'") {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        row.push(currentVal.trim().replace(/^["']|["']$/g, ''));
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    row.push(currentVal.trim().replace(/^["']|["']$/g, ''));

    if (row.length < 13) continue; // insufficient columns

    const quote_id = row[0] || `QT-${i}`;
    const pr_no = row[1] || 'PR-2026-001';
    const item_code = row[2] || 'IT-001';
    const item_name = row[3] || '품목명';
    const supplier = row[4] || '공급사';
    const unit = row[5] || 'EA';
    const qty = parseFloat(row[6]) || 1;
    const rawPrice = row[7];
    const unit_price = rawPrice === '' || rawPrice === '-' || rawPrice.toLowerCase() === 'n/a' || isNaN(Number(rawPrice)) ? null : Number(rawPrice);
    const currency = row[8] || 'KRW';
    const quote_date = row[9] || '2026-08-01';
    const required_date = row[10] || '2026-09-01';
    const rawPromised = row[11];
    const promised_date = rawPromised === '' || rawPromised === '-' || rawPromised.toLowerCase() === 'n/a' ? null : rawPromised;
    const status = (row[12] === '발주' ? '발주' : '견적') as '견적' | '발주';
    const remark = row[13] || '';

    items.push({
      quote_id,
      pr_no,
      item_code,
      item_name,
      supplier,
      unit,
      qty,
      unit_price,
      currency,
      quote_date,
      required_date,
      promised_date,
      status,
      remark,
    });
  }

  return items;
}

export function exportQuotesToCSV(quotes: QuoteItem[]): string {
  const headers = [
    'quote_id',
    'pr_no',
    'item_code',
    'item_name',
    'supplier',
    'unit',
    'qty',
    'unit_price',
    'currency',
    'quote_date',
    'required_date',
    'promised_date',
    'status',
    'remark',
  ];

  const rows = quotes.map(q => [
    q.quote_id,
    q.pr_no,
    q.item_code,
    `"${q.item_name}"`,
    `"${q.supplier}"`,
    q.unit,
    q.qty,
    q.unit_price !== null ? q.unit_price : '',
    q.currency,
    q.quote_date,
    q.required_date,
    q.promised_date || '',
    q.status,
    `"${q.remark || ''}"`,
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
