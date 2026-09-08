export interface QuoteItem {
  quote_id: string;
  pr_no: string;
  item_code: string;
  item_name: string;
  supplier: string;
  unit: string;
  qty: number;
  unit_price: number | null;
  currency: string;
  quote_date: string;
  required_date: string;
  promised_date: string | null;
  status: '견적' | '발주';
  remark: string;
}

export type PriceState = '정상' | '이상치' | '비교 불가' | '단가 미기재';
export type DeliveryState = '지연' | '임박' | '정상' | '납기 미기재' | '판정 대상 아님';

export interface EvaluatedQuote extends QuoteItem {
  priceState: PriceState;
  deviation: number | null; // % from median
  medianPrice: number | null;
  isLowest: boolean;
  dDays: number | null;
  deliveryState: DeliveryState;
  isExceededRequired: boolean;
  isNameDiscrepant: boolean;
  isStatusDuplicate: boolean;
}

export interface PRGroup {
  prNo: string;
  itemCode: string;
  itemName: string;
  unit: string;
  qty: number;
  quotes: EvaluatedQuote[];
  hasOrder: boolean;
  orderCount: number;
  lowestQuote: EvaluatedQuote | null;
  hasOutlier: boolean;
  hasDiscrepancy: boolean;
  hasDelay: boolean;
}

export type FilterState = {
  searchQuery: string;
  statusFilter: 'all' | '발주' | '견적';
  deliveryFilter: 'all' | '지연' | '임박' | '정상' | '납기 미기재';
  warningFilter: 'all' | '이상치' | '표기상이' | '지연' | '임박' | '결측';
  viewMode: 'table' | 'pr_group';
};
