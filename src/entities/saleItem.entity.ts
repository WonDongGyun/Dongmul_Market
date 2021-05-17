import {
	Column,
	CreateDateColumn,
	Entity,
	Generated,
	Index,
	JoinColumn,
	ManyToOne,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from 'typeorm';
import { DealChatRoom } from './dealChatRoom.entity';
import { ItemChatRoom } from './itemChatRoom.entity';
import { KickUser } from './kickUser.entity';
import { User } from './user.entity';

@Entity('saleItem')
@Index(['itemId'])
export class SaleItem {
	@PrimaryGeneratedColumn('uuid')
	itemId: string;

	// 물품의 이미지입니다.
	@Column({ type: 'varchar' })
	image: string;

	@Column({ type: 'varchar' })
	title: string;

	@Column({ type: 'varchar' })
	category: string;

	@Column({ type: 'varchar' })
	wantItem: string;

	@Column({ type: 'varchar' })
	comment: string;

	@Column({ type: 'timestamp' })
	deadLine: Date;

	// 현재 거래 상태를 나타냅니다.
	// SI01 - 경매 진행
	// SI02 - 교환 중
	// SI03 - 교환 완료
	// SI04 - 경매 실패
	@Column({ type: 'varchar', default: 'SI01' })
	status: string;

	// 교환이 완료되면 해당 교환자의 이메일이 입력됩니다.
	@Column({ type: 'varchar', default: null })
	buyerEmail: string;

	@CreateDateColumn()
	createdDt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	// user와 saleItem은 1 : N 관계입니다.
	@ManyToOne(() => User, (user) => user.saleItem)
	@JoinColumn([{ name: 'email', referencedColumnName: 'email' }])
	user: User;

	// saleItem와 kickUser은 1 : N 관계입니다.
	@OneToMany(() => KickUser, (kickUser) => kickUser.user, {
		onDelete: 'CASCADE'
	})
	kickUser: KickUser[];

	// saleItem과 itemChatRoom 1 : 1 관계입니다.
	@OneToOne(() => ItemChatRoom)
	@Generated('uuid')
	@JoinColumn([{ name: 'icrId', referencedColumnName: 'icrId' }])
	itemChatRoom: ItemChatRoom;

	// saleItem과 dealChatRoom 1 : 1 관계입니다.
	@OneToOne(() => DealChatRoom)
	@Generated('uuid')
	@JoinColumn([{ name: 'dicrId', referencedColumnName: 'dicrId' }])
	dealChatRoom: DealChatRoom;
}
