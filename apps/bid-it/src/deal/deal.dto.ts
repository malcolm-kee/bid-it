import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateDealDto {
  @ApiProperty({
    description: 'Name for the deal',
    example: 'Honda Accord 2015',
  })
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    description: 'Starting price for the deal',
  })
  @IsPositive()
  @IsNumber()
  readonly startingPrice: number;

  @ApiProperty({
    description: 'Start time for the deal',
  })
  @IsDateString()
  readonly startedAt: string;

  @ApiProperty({
    description: 'End time for the deal',
  })
  @IsDateString()
  readonly endedAt: string;
}

export class PostBidDto {
  @ApiProperty({
    description: 'Id for the deal',
  })
  @IsMongoId()
  readonly dealId: string;

  @ApiProperty({
    description: 'Id for the user that place the bid',
  })
  @IsMongoId()
  readonly dealerId: string;

  @ApiProperty({
    description: 'Amount of the bid',
  })
  @IsPositive()
  @IsNumber()
  readonly price: number;
}
