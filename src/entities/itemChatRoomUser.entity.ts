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
@Index(['icruId'])
export class ItemChatRoomUser {
	@PrimaryGeneratedColumn('uuid')
	icruId: string;

	@Column({ type: 'varchar', default: 'N' })
	chooseYn: string;

	@CreateDateColumn()
	createdDt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	// user는 itemChatRoomUser와 1 : N 관계입니다.
	@ManyToOne(() => User, (user) => user.itemChatRoomUser)
	@JoinColumn([{ name: 'email', referencedColumnName: 'email' }])
	user: User;

	// itemChatRoom은 itemChatRoomUser와 1 : N 관계입니다.
	@ManyToOne(
		() => ItemChatRoom,
		(itemChatRoom) => itemChatRoom.itemChatRoomUser
	)
	@JoinColumn([{ name: 'icrId', referencedColumnName: 'icrId' }])
	itemChatRoom: ItemChatRoom;
}
