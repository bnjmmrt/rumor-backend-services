import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class InstagramProfile extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'username', nullable: false })
  username: string;

  @Column({ type: 'int', name: 'follower_count', default: 0 })
  followerCount: number;
}