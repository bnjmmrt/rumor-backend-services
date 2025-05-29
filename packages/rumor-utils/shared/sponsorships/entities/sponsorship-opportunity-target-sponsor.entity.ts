import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { SponsorshipOpportunity } from './sponsorship-opportunity.entity';
import { TargetSponsor } from './target-sponsor.entity';

@Entity('sponsorship_opportunity_target_sponsor')
@Index(['sponsorshipOpportunity', 'targetSponsor', 'deletedAt'], { 
  unique: true, 
  where: '"deleted_at" IS NULL' 
})
export class SponsorshipOpportunityTargetSponsor extends RumorBaseEntity {
  @ManyToOne(() => SponsorshipOpportunity, { nullable: false })
  @JoinColumn({ name: 'sponsorship_opportunity_id' })
  sponsorshipOpportunity: SponsorshipOpportunity;

  @ManyToOne(() => TargetSponsor, { 
    nullable: false,
    cascade: ['soft-remove']  // Add this
  })
  @JoinColumn({ name: 'target_sponsor_id' })
  targetSponsor: TargetSponsor;

  @Column({ type: 'boolean', name: 'is_excluded', default: false })
  isExcluded: boolean;
} 