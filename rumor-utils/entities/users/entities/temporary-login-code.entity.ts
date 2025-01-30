import { Column, Entity } from 'typeorm';
import { RumorBaseEntity } from '../../rumor-base.entity';

@Entity()
export class TemporaryLoginCode extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', name: 'email', nullable: true })
  email: string;

  @Column({ type: 'varchar', name: 'code' })
  code: string;
}
