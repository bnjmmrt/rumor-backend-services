import { RumorBaseEntity } from 'rumor-utils/entities/rumor-base.entity';
import { Entity, Column, Index } from 'typeorm';

@Entity()
export class XAuthSession extends RumorBaseEntity {
  @Index()
  @Column({ type: 'varchar', name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', name: 'code_verifier' })
  codeVerifier: string;
}
