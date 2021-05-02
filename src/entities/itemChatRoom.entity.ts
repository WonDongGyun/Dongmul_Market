import { Entity, Index, OneToMany, PrimaryColumn } from 'typeorm';
import { ItemChatRoomUserMsg } from './itemChatRoomUserMsg.entity';
import { ItemChatRoomUser } from './itemChatRoomUser.entity';

@Entity()
@Index(['icrId'])
export class ItemChatRoom {
	@PrimaryColumn('uuid')
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
