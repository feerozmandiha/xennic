/** مدل داده قبض — هم‌شکل با اسکیمای BillData در vision-service (سند ۰۴). */

export type ZoneId = 'normal' | 'tropical1' | 'tropical2' | 'tropical3' | 'tropical4';

export type Season = 'hot' | 'normal';

export type TariffType = 'خانگی' | 'تجاری' | 'صنعتی' | 'کشاورزی' | 'عمومی' | string;

export interface BillData {
  // شناسه‌ای
  billId?: string; // شناسه قبض ۱۳ رقمی
  paymentId?: string; // شناسه پرداخت ۱۳ رقمی
  fileNo?: string; // شماره پرونده
  billNumber?: string; // شماره قبض
  customerName?: string;
  address?: string;
  postalCode?: string;
  mobile?: string;
  tariffType?: TariffType;
  region?: ZoneId;
  // دوره و قرائت
  periodFrom?: string; // 1405-02-15
  periodTo?: string; // 1405-04-14
  periodDays?: number;
  prevReading?: number;
  curReading?: number;
  multiplier?: number;
  consumptionKwh?: number;
  tou?: { low?: number; mid?: number; peak?: number }; // سه‌زمانه (kWh)
  demandKw?: number;
  ampere?: number;
  // مالی (ریال)
  energyChargeRials?: number;
  note14Rials?: number;
  leviesRials?: number;
  vatRials?: number;
  insuranceRials?: number;
  subscriptionRials?: number;
  totalRials?: number;
  paymentStatus?: 'paid' | 'unpaid' | string;
  // متا
  rawText?: string;
  confidence?: Record<string, number>;
}

export interface TierResult {
  fromKwh: number;
  toKwh: number | null;
  kwh: number;
  factor: number;
  applyCoeff: number;
  rateRials: number; // factor × apply × C (گردشده)
  amountRials: number;
}

export type PatternStatus = 'under' | 'tier2' | 'tier3' | 'tier4';

export interface Recommendation {
  id: string;
  title: string;
  detail: string;
  saveRialsPerPeriod?: number;
}

export interface ReportModel {
  bill: BillData;
  tariffYear: number;
  supplyCostRials: number;
  zone: ZoneId;
  season: Season;
  monthlyAvgKwh: number;
  periodMonths: number;
  patternLimitKwh: number;
  relativeToPattern: number;
  patternStatus: PatternStatus;
  profileId: string;
  tiers: TierResult[];
  computedEnergyRials: number;
  effectiveRateRials: number;
  deviationPct: number | null;
  peakSurchargeRials: number | null;
  offpeakDiscountRials: number | null;
  recommendations: Recommendation[];
  llmNarrative?: string;
  warnings: string[];
}
