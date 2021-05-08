import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	Unique,
	UpdateDateColumn
} from 'typeorm';
import { DealChatRoom } from './dealChatRoom.entity';
import { User } from './user.entity';

@Entity()
@Index(['dicruId'])
@Unique(['user', 'dealChatRoom'])
export class DealChatRoomUser {
	@PrimaryGeneratedColumn('uuid')
	dicruId: string;

	@Column({ type: 'varchar', default: null })
	changeYn: string;

	@CreateDateColumn()
	createdDt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	// user는 dealChatRoomUser와 1 : N 관계입니다.
	@ManyToOne(() => User, (user) => user.dealChatRoomUser)
	@JoinColumn([{ name: 'email', referencedColumnName: 'email' }])
	user: User;

	// dealChatRoom은 dealChatRoomUser와 1 : N 관계입니다.
	@ManyToOne(
		() => DealChatRoom,
		(dealChatRoom) => dealChatRoom.dealChatRoomUser
	)
	@JoinColumn([{ name: 'dicrId', referencedColumnName: 'dicrId' }])
	dealChatRoom: DealChatRoom;
}
