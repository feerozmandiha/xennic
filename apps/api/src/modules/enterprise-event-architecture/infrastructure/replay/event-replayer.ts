import { Injectable } from '@nestjs/common';
import { EventReplayService } from '../../application/services/event-replay.service.js';

@Injectable()
export class EventReplayerImpl {
  constructor(public readonly delegate: EventReplayService) {}
}
