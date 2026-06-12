export class WorkspaceEntity {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public name: string,
    public readonly createdBy: string,
    public updatedBy: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null,
  ) {}

  static create(name: string, createdBy: string): WorkspaceEntity {
    const now = new Date();
    const code = this.generateCode(name);

    return new WorkspaceEntity(
      crypto.randomUUID(),
      code,
      name,
      createdBy,
      null,
      now,
      now,
      null,
    );
  }

  static reconstitute(data: {
    id: string;
    code: string;
    name: string;
    createdBy: string;
    updatedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): WorkspaceEntity {
    return new WorkspaceEntity(
      data.id,
      data.code,
      data.name,
      data.createdBy,
      data.updatedBy,
      data.createdAt,
      data.updatedAt,
      data.deletedAt,
    );
  }

  updateName(newName: string, updatedBy: string): void {
    if (!newName || newName.trim().length < 2) {
      throw new Error('Workspace name must be at least 2 characters long');
    }
    if (newName.length > 100) {
      throw new Error('Workspace name must not exceed 100 characters');
    }
    this.name = newName;
    this.updatedBy = updatedBy;
    this.updatedAt = new Date();
  }

  softDelete(deletedBy: string): void {
    this.deletedAt = new Date();
    this.updatedBy = deletedBy;
    this.updatedAt = new Date();
  }

  restore(restoredBy: string): void {
    this.deletedAt = null;
    this.updatedBy = restoredBy;
    this.updatedAt = new Date();
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  private static generateCode(name: string): string {
    // FIX: حروف غیر ASCII (فارسی و ...) را با transliteration ساده یا حذف مدیریت می‌کنیم
    // ابتدا حروف لاتین و اعداد را نگه می‌داریم
    // حروف فارسی/عربی را حذف می‌کنیم و با WORKSPACE جایگزین می‌کنیم

    // تلاش برای استخراج حروف ASCII
    const asciiPart = name
      .normalize('NFD')             // decompose unicode
      .replace(/[\u0300-\u036f]/g, '') // حذف diacritics
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '') // فقط ASCII حروف و اعداد
      .trim()
      .replace(/\s+/g, '_')
      .slice(0, 20);

    // اگر هیچ حرف ASCII‌ای نماند، از WORKSPACE استفاده می‌کنیم
    const baseCode = asciiPart.length >= 2
      ? asciiPart
      : 'WORKSPACE';

    const uniqueSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${baseCode}_${uniqueSuffix}`;
  }
}
