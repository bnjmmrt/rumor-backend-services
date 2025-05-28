import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Entity, Column, OneToMany, Index } from 'typeorm';
import { TargetSponsor } from './target-sponsor.entity';
import { SponsorshipOpportunityTargetSponsor } from './sponsorship-opportunity-target-sponsor.entity';

@Entity('sponsorship_category')
@Index('idx_unique_category_name', ['name'], { unique: true, where: '"deleted_at" IS NULL' })
export class SponsorshipCategory extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'name', nullable: false })
  name: string;

  @OneToMany(() => TargetSponsor, targetSponsor => targetSponsor.sponsorshipCategory, {
    cascade: ['soft-remove']
  })
  targetSponsors: TargetSponsor[];
}
