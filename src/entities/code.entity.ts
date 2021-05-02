import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity()
@Index(['codeId'])
export class Code {
	@PrimaryColumn({ type: 'varchar' })
	codeId: string;

	@Column({ type: 'varchar' })
	codeName: string;
}
