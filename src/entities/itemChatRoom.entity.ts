import {
	Entity,
	Index,
	OneToMany,
	PrimaryColumn,
	PrimaryGeneratedColumn
} from 'typeorm';
import { ItemChatRoomUserMsg } from './itemChatRoomUserMsg.entity';
import { ItemChatRoomUser } from './itemChatRoomUser.entity';

@Entity()
@Index(['icrId'])
export class ItemChatRoom {
	@PrimaryGeneratedColumn('uuid')
	icrId: string;

	// itemChatRoom은 itemChatRoomUser와 1 : N 관계입니다.
	@OneToMany(
		() => ItemChatRoomUser,
		(itemChatRoomUser) => itemChatRoomUser.itemChatRoom,
		{
			onDelete: 'CASCADE'
		}
	)
	itemChatRoomUser: ItemChatRoomUser[];

	// itemChatRoom은 itemChatRoomUserMsg와 1 : N 관계입니다.
	@OneToMany(
		() => ItemChatRoomUserMsg,
		(itemChatRoomUserMsg) => itemChatRoomUserMsg.itemChatRoom,
		{
			onDelete: 'CASCADE'
		}
	)
	itemChatRoomUserMsg: ItemChatRoomUserMsg[];
}
