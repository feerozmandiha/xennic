import { Prisma } from '@prisma/client';
import { TenantContext } from './tenant-context.js';

const MODELS_WITH_WORKSPACE_ID = new Set([
  'sessions',
  'user_roles',
  'workspace_members',
  'workspace_invitations',
  'workspace_settings',
  'subscriptions',
  'usage_logs',
  'invoices',
  'payments',
  'transactions',
  'payment_methods',
  'subscription_payments',
  'projects',
  'calculations',
  'conversations',
  'ai_usage',
  'knowledge',
  'orders',
  'files',
  'api_keys',
  'webhooks',
  'audit_logs',
  'feature_flags',
  'context_cache',
  'memories',
  'prompt_registry',
  'prompt_templates',
  'prompt_policies',
  'tool_registry',
  'skill_registry',
  'policies',
  'reasoning_plans',
  'reasoning_graphs',
  'evaluation_benchmarks',
  'evaluation_datasets',
  'evaluation_runs',
  'workflow_definitions',
  'workflow_templates',
  'workflow_executions',
  'compensation_entries',
  'execution_contexts',
  'execution_artifacts',
  'execution_memories',
  'execution_plans',
  'plan_steps',
  'conversation_stores',
  'cost_entries',
  'approval_requests',
  'review_tasks',
  'coordination_plans',
  'coordination_tasks',
  'decision_logs',
  'confidence_scores',
  'agent_sessions',
  'agent_runtime_memories',
]);

function applyTenantFilter(operation: string, args: any, workspaceId: string): any {
  switch (operation) {
    case 'findUnique':
    case 'findUniqueOrThrow':
      return args;

    case 'findMany':
    case 'findFirst':
    case 'findFirstOrThrow':
    case 'count':
    case 'aggregate':
    case 'groupBy':
      return { ...args, where: { ...args.where, workspace_id: workspaceId } };

    case 'create':
      return { ...args, data: { ...args.data, workspace_id: workspaceId } };

    case 'createMany':
      return {
        ...args,
        data: args.data.map((d: any) => ({ ...d, workspace_id: workspaceId })),
      };

    case 'update':
    case 'updateMany':
    {
      const where = args.where ?? {};
      return { ...args, where: { ...where, workspace_id: workspaceId } };
    }

    case 'delete':
    case 'deleteMany':
    {
      const where = args.where ?? {};
      return { ...args, where: { ...where, workspace_id: workspaceId } };
    }

    case 'upsert':
      return {
        ...args,
        create: { ...args.create, workspace_id: workspaceId },
      };

    default:
      return args;
  }
}

export function createTenantExtension() {
  return Prisma.defineExtension({
    name: 'tenant-isolation',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!MODELS_WITH_WORKSPACE_ID.has(model)) {
            return query(args);
          }

          const workspaceId = TenantContext.getWorkspaceId();
          if (!workspaceId) {
            return query(args);
          }

          return query(applyTenantFilter(operation, args, workspaceId));
        },
      },
    },
  });
}
