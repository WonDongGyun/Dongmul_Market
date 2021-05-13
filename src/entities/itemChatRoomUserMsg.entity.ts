import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from 'typeorm';
import { ItemChatRoom } from './itemChatRoom.entity';
import { User } from './user.entity';

@Entity()
@Index(['icruMsgId'])
export class ItemChatRoomUserMsg {
	@PrimaryGeneratedColumn('uuid')
	icruMsgId: string;

	@Column({ type: 'varchar' })
	chatMsg: string;

	@Column({ type: 'varchar' })
	textStatus: string;

	@CreateDateColumn()
	createdDt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	// user는 itemChatRoomUserMsg와 1 : N 관계입니다.
	@ManyToOne(() => User, (user) => user.itemChatRoomUserMsg)
	@JoinColumn([{ name: 'email', referencedColumnName: 'email' }])
	user: User;

	// itemChatRoom은 itemChatRoomUserMsg와 1 : N 관계입니다.
	@ManyToOne(
		() => ItemChatRoom,
		(itemChatRoom) => itemChatRoom.itemChatRoomUserMsg
	)
	@JoinColumn([{ name: 'icrId', referencedColumnName: 'icrId' }])
	itemChatRoom: ItemChatRoom;
}
