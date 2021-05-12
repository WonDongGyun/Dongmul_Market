import {
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from 'typeorm';
import { SaleItem } from './saleItem.entity';
import { User } from './user.entity';

@Entity('kickUser')
@Index(['kickId'])
export class KickUser {
	@PrimaryGeneratedColumn('uuid')
	kickId: string;

	@CreateDateColumn()
	createdDt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	// user와 kickUser은 1 : N 관계입니다.
	@ManyToOne(() => User, (user) => user.kickUser)
	@JoinColumn([{ name: 'email', referencedColumnName: 'email' }])
	user: User;

	// user와 saleItem은 1 : N 관계입니다.
	@ManyToOne(() => SaleItem, (saleItem) => saleItem.kickUser)
	@JoinColumn([{ name: 'itemId', referencedColumnName: 'itemId' }])
	saleItem: SaleItem;
}
