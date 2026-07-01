import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowEngine } from '../application/services/workflow-engine.service.js';

describe('WorkflowEngine', () => {
  let service: WorkflowEngine;
  const mockPlan = { id: 'plan-1', goal: {} as any, dag: [{ id: 'n1', type: 'calculation' as any, label: 'calc', input: {}, output: {}, evidence: [], config: {} }], edges: [], metadata: {} as any };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkflowEngine],
    }).compile();
    service = module.get<WorkflowEngine>(WorkflowEngine);
  });

  it('starts a workflow execution', async () => {
    const exec = await service.start(mockPlan, 'session-1');
    expect(exec.status).toBe('running');
    expect(exec.nodes).toHaveLength(1);
  });

  it('cancels a running workflow', async () => {
    const exec = await service.start(mockPlan, 'session-1');
    await service.cancel(exec.id);
    const status = await service.getStatus(exec.id);
    expect(status.status).toBe('cancelled');
  });

  it('pauses and resumes workflow', async () => {
    const exec = await service.start(mockPlan, 'session-1');
    const paused = await service.pause(exec.id);
    expect(paused.status).toBe('paused');
    const resumed = await service.resume(exec.id);
    expect(resumed.status).toBe('running');
  });

  it('throws for nonexistent execution on pause', async () => {
    await expect(service.pause('nonexistent')).rejects.toThrow();
  });

  it('creates checkpoints', async () => {
    const exec = await service.start(mockPlan, 'session-1');
    const cp = await service.checkpoint(exec.id);
    expect(cp).toBeTruthy();
    const recovered = await service.recover(cp);
    expect(recovered.status).toBe('running');
  });

  it('throws for nonexistent checkpoint recovery', async () => {
    await expect(service.recover('nonexistent')).rejects.toThrow();
  });

  it('executes a node and returns completed state', async () => {
    const exec = await service.start(mockPlan, 'session-1');
    const state = await service.executeNode(exec, 'n1');
    expect(state.status).toBe('completed');
    expect(state.output.nodeId).toBe('n1');
  });
});
