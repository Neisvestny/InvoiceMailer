import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SenderConfig } from '../../types';

@Injectable()
export class SenderService {
	constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

	getInfo(): SenderConfig {
		return this.config.get<SenderConfig>('sender')!;
	}
}
