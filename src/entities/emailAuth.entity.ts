import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	PrimaryColumn,
	UpdateDateColumn
} from 'typeorm';

@Entity()
@Index(['email'])
export class EmailAuth {
	@PrimaryColumn({ type: 'varchar' })
	email: string;

	@Column({ type: 'int' })
	authNum: number;
	
	@Column()
	newpassword: string

	@CreateDateColumn()
	createdDt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
