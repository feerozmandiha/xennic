export interface PlanFeatures {
  projects: number;              // -1 = unlimited
  calculations_month: number;    // -1 = unlimited
  ai_requests_month: number;     // -1 = unlimited
  storage_gb: number;            // -1 = unlimited
  api_access: boolean;
  api_level?: number;            // 0=none, 1=read, 2=read+write, 3=partner
  report_formats: string[];
  sso?: boolean;
  custom_agents?: boolean;
  dedicated_support?: boolean;
}

export class PlanEntity {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly monthlyPrice: number,
    public readonly yearlyPrice: number,
    public readonly features: PlanFeatures,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static reconstitute(data: {
    id: string;
    name: string;
    slug: string;
    monthlyPrice: number;
    yearlyPrice: number;
    features: PlanFeatures;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): PlanEntity {
    return new PlanEntity(
      data.id, data.name, data.slug,
      data.monthlyPrice, data.yearlyPrice,
      data.features, data.isActive,
      data.createdAt, data.updatedAt,
    );
  }

  // ── helpers ─────────────────────────────────────────────────────────────

  isFree(): boolean       { return this.slug === 'free'; }
  isPro(): boolean        { return this.slug === 'pro'; }
  isEnterprise(): boolean { return this.slug === 'enterprise'; }

  /** آیا تعداد projects محدود است */
  hasProjectLimit(): boolean {
    return this.features.projects !== -1;
  }

  /** آیا تعداد calculations در ماه محدود است */
  hasCalculationLimit(): boolean {
    return this.features.calculations_month !== -1;
  }

  /** آیا تعداد AI requests محدود است */
  hasAiLimit(): boolean {
    return this.features.ai_requests_month !== -1;
  }
}
