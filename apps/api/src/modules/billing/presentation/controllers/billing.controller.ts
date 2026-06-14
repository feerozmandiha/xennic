import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { BillingService } from '../../application/services/billing.service.js';
import { SubscriptionBillingService } from '../../application/services/subscription-billing.service.js';
import {
  CreateInvoiceDto,
  CreatePaymentDto,
  RequestPaymentDto,
  AddPaymentMethodDto,
  InvoiceResponseDto,
  PaymentResponseDto,
  TransactionResponseDto,
  PaymentMethodResponseDto,
  BillingDashboardDto,
} from '../dtos/billing.dto.js';

@ApiTags('billing')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly subscriptionBillingService: SubscriptionBillingService,
  ) {}

  // ══════════════════════════════════════════════════════════════════════════
  // INVOICES
  // ══════════════════════════════════════════════════════════════════════════

  @Get('invoices')
  @ApiOperation({ summary: 'List invoices', description: 'Paginated list of workspace invoices.' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Invoices retrieved', type: [InvoiceResponseDto] })
  async getInvoices(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const result = await this.billingService.getInvoicesByWorkspace(req.workspaceId, pageNum, limitNum);
    return {
      success: true,
      data: InvoiceResponseDto.fromEntities(result.data),
      meta: result.meta,
    };
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  @ApiResponse({ status: 200, type: InvoiceResponseDto })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async getInvoice(@Param('id') id: string, @Req() req: any) {
    const invoice = await this.billingService.getInvoice(id, req.workspaceId);
    return { success: true, data: InvoiceResponseDto.fromEntity(invoice) };
  }

  @Post('invoices')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create invoice', description: 'Creates a new invoice for the workspace.' })
  @ApiBody({ type: CreateInvoiceDto })
  @ApiResponse({ status: 201, description: 'Invoice created', type: InvoiceResponseDto })
  async createInvoice(@Body() dto: CreateInvoiceDto, @Req() req: any) {
    const invoice = await this.billingService.createInvoice({
      workspaceId: req.workspaceId,
      ...dto,
    });
    return { success: true, data: InvoiceResponseDto.fromEntity(invoice) };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAYMENTS
  // ══════════════════════════════════════════════════════════════════════════

  @Get('payments')
  @ApiOperation({ summary: 'List payments', description: 'Paginated list of workspace payments.' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Payments retrieved', type: [PaymentResponseDto] })
  async getPayments(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const result = await this.billingService.getPaymentsByWorkspace(req.workspaceId, pageNum, limitNum);
    return {
      success: true,
      data: PaymentResponseDto.fromEntities(result.data),
      meta: result.meta,
    };
  }

  @Post('payments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create payment', description: 'Creates a payment record for an invoice.' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({ status: 201, description: 'Payment created', type: PaymentResponseDto })
  async createPayment(@Body() dto: CreatePaymentDto, @Req() req: any) {
    const payment = await this.billingService.createPayment({
      workspaceId: req.workspaceId,
      invoiceId: dto.invoiceId,
      gateway: dto.gateway as any,
      amount: dto.amount,
    });
    return { success: true, data: PaymentResponseDto.fromEntity(payment) };
  }

  @Post('payments/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request gateway payment', description: 'Redirects to Zarinpal payment page.' })
  @ApiBody({ type: RequestPaymentDto })
  @ApiResponse({ status: 200, description: 'Payment URL generated' })
  async requestPayment(@Body() dto: RequestPaymentDto, @Req() req: any) {
    const result = await this.billingService.requestGatewayPayment(
      dto.paymentId,
      req.workspaceId,
      dto.callbackUrl,
    );
    return { success: true, data: result };
  }

  @Post('payments/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify gateway payment', description: 'Verifies payment after gateway callback.' })
  @ApiResponse({ status: 200, description: 'Payment verified' })
  async verifyPayment(
    @Body() body: { authority: string; amount: number },
  ) {
    const payment = await this.billingService.verifyGatewayPayment(body.authority, body.amount);
    return { success: true, data: PaymentResponseDto.fromEntity(payment) };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TRANSACTIONS
  // ══════════════════════════════════════════════════════════════════════════

  @Get('transactions')
  @ApiOperation({ summary: 'List transactions', description: 'Paginated list of workspace transactions.' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Transactions retrieved', type: [TransactionResponseDto] })
  async getTransactions(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const result = await this.billingService.getTransactionsByWorkspace(req.workspaceId, pageNum, limitNum);
    return {
      success: true,
      data: TransactionResponseDto.fromEntities(result.data),
      meta: result.meta,
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAYMENT METHODS
  // ══════════════════════════════════════════════════════════════════════════

  @Get('payment-methods')
  @ApiOperation({ summary: 'List payment methods', description: 'Saved payment methods for workspace.' })
  @ApiResponse({ status: 200, type: [PaymentMethodResponseDto] })
  async getPaymentMethods(@Req() req: any) {
    const methods = await this.billingService.getPaymentMethods(req.workspaceId);
    return { success: true, data: PaymentMethodResponseDto.fromEntities(methods) };
  }

  @Post('payment-methods')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add payment method' })
  @ApiBody({ type: AddPaymentMethodDto })
  @ApiResponse({ status: 201, type: PaymentMethodResponseDto })
  async addPaymentMethod(@Body() dto: AddPaymentMethodDto, @Req() req: any) {
    const method = await this.billingService.addPaymentMethod({
      workspaceId: req.workspaceId,
      userId: req.user.id,
      gateway: dto.gateway as any,
      gatewayCustomerId: dto.gatewayCustomerId,
      maskedNumber: dto.maskedNumber,
      cardHolderName: dto.cardHolderName,
      isDefault: dto.isDefault,
    });
    return { success: true, data: PaymentMethodResponseDto.fromEntity(method) };
  }

  @Delete('payment-methods/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete payment method' })
  @ApiParam({ name: 'id', description: 'Payment method UUID' })
  @ApiResponse({ status: 204, description: 'Payment method deleted' })
  async deletePaymentMethod(@Param('id') id: string, @Req() req: any): Promise<void> {
    await this.billingService.deletePaymentMethod(id, req.workspaceId);
  }

  @Post('payment-methods/:id/default')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set default payment method' })
  @ApiParam({ name: 'id', description: 'Payment method UUID' })
  @ApiResponse({ status: 200, type: PaymentMethodResponseDto })
  async setDefaultPaymentMethod(@Param('id') id: string, @Req() req: any) {
    const method = await this.billingService.setDefaultPaymentMethod(id, req.workspaceId);
    return { success: true, data: PaymentMethodResponseDto.fromEntity(method) };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SUBSCRIPTION PAYMENTS
  // ══════════════════════════════════════════════════════════════════════════

  @Get('subscription-payments')
  @ApiOperation({ summary: 'Subscription payment history', description: 'History of subscription payments.' })
  @ApiResponse({ status: 200, description: 'History retrieved' })
  async getSubscriptionPayments(@Req() req: any) {
    const history = await this.subscriptionBillingService.getSubscriptionPaymentHistory(req.workspaceId);
    return { success: true, data: history };
  }

  @Post('subscription-payments/renew')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process subscription renewal payment' })
  @ApiResponse({ status: 200, description: 'Renewal processed' })
  async processRenewal(@Req() req: any) {
    const result = await this.subscriptionBillingService.processSubscriptionRenewal(
      req.workspaceId,
      req.workspaceId, // subscription lookup by workspace
    );
    return { success: true, data: result };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DASHBOARD
  // ══════════════════════════════════════════════════════════════════════════

  @Get('dashboard')
  @ApiOperation({ summary: 'Billing dashboard', description: 'Financial overview for workspace.' })
  @ApiResponse({ status: 200, type: BillingDashboardDto })
  async getDashboard(@Req() req: any) {
    const dashboard = await this.billingService.getDashboard(req.workspaceId);
    return { success: true, data: dashboard };
  }
}
