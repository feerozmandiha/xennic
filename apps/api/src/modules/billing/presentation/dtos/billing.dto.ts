import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsString, IsNumber, IsOptional, IsBoolean, Min, MaxLength } from 'class-validator';
import type { InvoiceEntity } from '../../domain/entities/invoice.entity.js';
import type { PaymentEntity } from '../../domain/entities/payment.entity.js';
import type { TransactionEntity } from '../../domain/entities/transaction.entity.js';
import type { PaymentMethodEntity } from '../../domain/entities/payment-method.entity.js';

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export class CreateInvoiceDto {
  @ApiProperty({ example: 1500000, description: 'Subtotal amount' })
  @IsNumber()
  @Min(0)
  subtotal!: number;

  @ApiPropertyOptional({ example: 135000, description: 'Tax amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @ApiProperty({ example: 1635000, description: 'Total amount' })
  @IsNumber()
  @Min(0)
  totalAmount!: number;

  @ApiPropertyOptional({ example: 'IRR', default: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;
}

export class CreatePaymentDto {
  @ApiProperty({ description: 'Invoice UUID' })
  @IsUUID()
  invoiceId!: string;

  @ApiProperty({ enum: ['zarinpal', 'payping'], example: 'zarinpal' })
  @IsString()
  gateway!: string;

  @ApiProperty({ example: 1635000 })
  @IsNumber()
  @Min(0)
  amount!: number;
}

export class RequestPaymentDto {
  @ApiProperty({ description: 'Payment UUID' })
  @IsUUID()
  paymentId!: string;

  @ApiProperty({ example: 'https://xennic.com/api/v1/billing/callback' })
  @IsString()
  callbackUrl!: string;
}

export class AddPaymentMethodDto {
  @ApiProperty({ enum: ['zarinpal', 'payping'], example: 'zarinpal' })
  @IsString()
  gateway!: string;

  @ApiPropertyOptional({ description: 'Gateway customer token' })
  @IsOptional()
  @IsString()
  gatewayCustomerId?: string;

  @ApiPropertyOptional({ example: '****1234' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  maskedNumber?: string;

  @ApiPropertyOptional({ example: 'علی احمدی' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  cardHolderName?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export class InvoiceResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() workspaceId!: string;
  @ApiProperty() invoiceNumber!: string;
  @ApiProperty({ enum: ['pending', 'paid', 'overdue', 'cancelled', 'refunded'] }) status!: string;
  @ApiProperty() currency!: string;
  @ApiProperty() subtotal!: number;
  @ApiProperty() taxAmount!: number;
  @ApiProperty() totalAmount!: number;
  @ApiProperty() issuedAt!: Date;
  @ApiProperty({ nullable: true }) dueAt!: Date | null;
  @ApiProperty({ nullable: true }) paidAt!: Date | null;
  @ApiProperty() createdAt!: Date;

  static fromEntity(e: InvoiceEntity): InvoiceResponseDto {
    const dto = new InvoiceResponseDto();
    dto.id = e.id;
    dto.workspaceId = e.workspaceId;
    dto.invoiceNumber = e.invoiceNumber;
    dto.status = e.status;
    dto.currency = e.currency;
    dto.subtotal = e.subtotal;
    dto.taxAmount = e.taxAmount;
    dto.totalAmount = e.totalAmount;
    dto.issuedAt = e.issuedAt;
    dto.dueAt = e.dueAt;
    dto.paidAt = e.paidAt;
    dto.createdAt = e.createdAt;
    return dto;
  }

  static fromEntities(list: InvoiceEntity[]): InvoiceResponseDto[] {
    return list.map(e => InvoiceResponseDto.fromEntity(e));
  }
}

export class PaymentResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() workspaceId!: string;
  @ApiProperty() invoiceId!: string;
  @ApiProperty() gateway!: string;
  @ApiProperty({ nullable: true }) gatewayReference!: string | null;
  @ApiProperty({ enum: ['pending', 'processing', 'paid', 'failed', 'refunded'] }) status!: string;
  @ApiProperty() amount!: number;
  @ApiProperty({ nullable: true }) paidAt!: Date | null;
  @ApiProperty() createdAt!: Date;

  static fromEntity(p: PaymentEntity): PaymentResponseDto {
    const dto = new PaymentResponseDto();
    dto.id = p.id;
    dto.workspaceId = p.workspaceId;
    dto.invoiceId = p.invoiceId;
    dto.gateway = p.gateway;
    dto.gatewayReference = p.gatewayReference;
    dto.status = p.status;
    dto.amount = p.amount;
    dto.paidAt = p.paidAt;
    dto.createdAt = p.createdAt;
    return dto;
  }

  static fromEntities(list: PaymentEntity[]): PaymentResponseDto[] {
    return list.map(p => PaymentResponseDto.fromEntity(p));
  }
}

export class TransactionResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() workspaceId!: string;
  @ApiProperty() paymentId!: string;
  @ApiProperty() type!: string;
  @ApiProperty() amount!: number;
  @ApiProperty({ enum: ['pending', 'completed', 'failed'] }) status!: string;
  @ApiProperty() createdAt!: Date;

  static fromEntity(t: TransactionEntity): TransactionResponseDto {
    const dto = new TransactionResponseDto();
    dto.id = t.id;
    dto.workspaceId = t.workspaceId;
    dto.paymentId = t.paymentId;
    dto.type = t.type;
    dto.amount = t.amount;
    dto.status = t.status;
    dto.createdAt = t.createdAt;
    return dto;
  }

  static fromEntities(list: TransactionEntity[]): TransactionResponseDto[] {
    return list.map(t => TransactionResponseDto.fromEntity(t));
  }
}

export class PaymentMethodResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() gateway!: string;
  @ApiProperty({ nullable: true }) maskedNumber!: string | null;
  @ApiProperty({ nullable: true }) cardHolderName!: string | null;
  @ApiProperty() isDefault!: boolean;
  @ApiProperty({ nullable: true }) expiresAt!: Date | null;
  @ApiProperty() createdAt!: Date;

  static fromEntity(m: PaymentMethodEntity): PaymentMethodResponseDto {
    const dto = new PaymentMethodResponseDto();
    dto.id = m.id;
    dto.gateway = m.gateway;
    dto.maskedNumber = m.maskedNumber;
    dto.cardHolderName = m.cardHolderName;
    dto.isDefault = m.isDefault;
    dto.expiresAt = m.expiresAt;
    dto.createdAt = m.createdAt;
    return dto;
  }

  static fromEntities(list: PaymentMethodEntity[]): PaymentMethodResponseDto[] {
    return list.map(m => PaymentMethodResponseDto.fromEntity(m));
  }
}

export class BillingDashboardDto {
  @ApiProperty() totalInvoiced!: number;
  @ApiProperty() totalPaid!: number;
  @ApiProperty() totalPending!: number;
  @ApiProperty() totalOverdue!: number;
  @ApiProperty({ type: [PaymentResponseDto] }) recentPayments!: PaymentResponseDto[];
}
