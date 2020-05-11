import { BID_QUEUE } from '@app/const';
import { PlaceBidData } from '@app/deal-data';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { EngineService } from './engine.service';

@Processor(BID_QUEUE)
export class EngineProcessor {
  private lastSuccessPrice: number;

  constructor(private readonly engineService: EngineService) {}

  @Process()
  async processBid(job: Job<PlaceBidData>) {
    const isSuccess =
      this.lastSuccessPrice && this.lastSuccessPrice >= job.data.price
        ? false
        : await this.engineService.checkIfBidSuccess(job.data);
    await this.engineService.announceBidResult(
      isSuccess ? 'bid_accepted' : 'bid_rejected',
      job.data
    );

    if (isSuccess) {
      this.lastSuccessPrice = job.data.price;
    }
  }
}
