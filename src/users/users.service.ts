import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
	async findOne(username: string): Promise<User | undefined> {
		return null;
	}
}
