import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SenderService } from './sender.service';

@ApiTags('Sender')
@Controller('sender')
export class SenderController {
	constructor(private readonly senderService: SenderService) {}

	@Get()
	@ApiOperation({ summary: 'Get sender information' })
	@ApiResponse({ status: 200, description: 'Sender information' })
	getInfo() {
		return this.senderService.getInfo();
	}
}
