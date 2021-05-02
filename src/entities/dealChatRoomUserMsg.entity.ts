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
import { DealChatRoom } from './dealChatRoom.entity';
import { User } from './user.entity';

@Entity()
@Index(['dicruMsgId'])
export class DealChatRoomUserMsg {
	@PrimaryGeneratedColumn('uuid')
	dicruMsgId: string;

	@Column({ type: 'varchar' })
	chatMsg: string;

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
		() => DealChatRoom,
		(dealChatRoom) => dealChatRoom.dealChatRoomUserMsg
	)
	@JoinColumn([{ name: 'dicrId', referencedColumnName: 'dicrId' }])
	dealChatRoom: DealChatRoom;
}
