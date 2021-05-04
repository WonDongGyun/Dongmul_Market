import {
	Entity,
	Index,
	OneToMany,
	PrimaryColumn,
	PrimaryGeneratedColumn
} from 'typeorm';
import { DealChatRoomUser } from './dealChatRoomUser.entity';
import { DealChatRoomUserMsg } from './dealChatRoomUserMsg.entity';

@Entity()
@Index(['dicrId'])
export class DealChatRoom {
	@PrimaryGeneratedColumn('uuid')
	dicrId: string;

	// dealChatRoom은 dealChatRoomUser와 1 : N 관계입니다.
	@OneToMany(
		() => DealChatRoomUser,
		(dealChatRoomUser) => dealChatRoomUser.dealChatRoom,
		{
			onDelete: 'CASCADE'
		}
	)
	dealChatRoomUser: DealChatRoomUser[];

	// dealChatRoom은 dealChatRoomUserMsg와 1 : N 관계입니다.
	@OneToMany(
		() => DealChatRoomUserMsg,
		(dealChatRoomUserMsg) => dealChatRoomUserMsg.dealChatRoom,
		{
			onDelete: 'CASCADE'
		}
	)
	dealChatRoomUserMsg: DealChatRoomUserMsg[];
}
