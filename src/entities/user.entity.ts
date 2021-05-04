import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	OneToMany,
	PrimaryColumn,
	UpdateDateColumn
} from 'typeorm';
import { ItemChatRoomUserMsg } from './itemChatRoomUserMsg.entity';
import { ItemChatRoomUser } from './itemChatRoomUser.entity';
import { SaleItem } from './saleItem.entity';
import { DealChatRoomUser } from './dealChatRoomUser.entity';
import { DealChatRoomUserMsg } from './dealChatRoomUserMsg.entity';

@Entity('user')
@Index(['email'])
export class User {
	@PrimaryColumn({ type: 'varchar' })
	email: string;

	@Column({ type: 'varchar' })
	nickname: string;

	@Column({ type: 'varchar', default: null })
	password: string;

	@Column({ type: 'varchar', default: null })
	address: string;

	@CreateDateColumn()
	createdDt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	// user와 saleItem은 1 : N 관계입니다.
	@OneToMany(() => SaleItem, (saleItem) => saleItem.user, {
		onDelete: 'CASCADE'
	})
	saleItem: SaleItem[];

	// user와 itemChatRoomUser는 1 : N 관계입니다.
	@OneToMany(
		() => ItemChatRoomUser,
		(itemChatRoomUser) => itemChatRoomUser.user,
		{
			onDelete: 'CASCADE'
		}
	)
	itemChatRoomUser: ItemChatRoomUser[];

	// user와 itemChatRoomUserMsg는 1 : N 관계입니다.
	@OneToMany(
		() => ItemChatRoomUserMsg,
		(itemChatRoomUserMsg) => itemChatRoomUserMsg.user,
		{
			onDelete: 'CASCADE'
		}
	)
	itemChatRoomUserMsg: ItemChatRoomUserMsg[];

	// user와 dealChatRoomUser는 1 : N 관계입니다.
	@OneToMany(
		() => DealChatRoomUser,
		(dealChatRoomUser) => dealChatRoomUser.user,
		{
			onDelete: 'CASCADE'
		}
	)
	dealChatRoomUser: DealChatRoomUser[];

	// user와 dealChatRoomUserMsg는 1 : N 관계입니다.
	@OneToMany(
		() => DealChatRoomUserMsg,
		(dealChatRoomUserMsg) => dealChatRoomUserMsg.user,
		{
			onDelete: 'CASCADE'
		}
	)
	dealChatRoomUserMsg: DealChatRoomUserMsg[];
}
