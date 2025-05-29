import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { SponsorshipInquiry } from './sponsorship-inquiry.entity';
import { TargetSponsor } from './target-sponsor.entity';

@Entity('sponsorship_inquiry_target_sponsor')
@Index(['sponsorshipInquiry', 'targetSponsor', 'deletedAt'], { 
  unique: true, 
  where: '"deleted_at" IS NULL' 
})
export class SponsorshipInquiryTargetSponsor extends RumorBaseEntity {
  @ManyToOne(() => SponsorshipInquiry, { nullable: false })
  @JoinColumn({ name: 'sponsorship_inquiry_id' })
  sponsorshipInquiry: SponsorshipInquiry;

  @ManyToOne(() => TargetSponsor, { 
    nullable: false,
    cascade: ['soft-remove']
  },)
  @JoinColumn({ name: 'target_sponsor_id' })
  targetSponsor: TargetSponsor;

  @Column({ type: 'boolean', name: 'is_excluded', default: false })
  isExcluded: boolean;
} 