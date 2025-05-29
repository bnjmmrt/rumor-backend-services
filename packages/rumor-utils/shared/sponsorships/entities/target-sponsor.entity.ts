import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Entity, Column, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { SponsorshipCategory } from './sponsorship-category.entity';
import { SponsorshipOpportunityTargetSponsor } from './sponsorship-opportunity-target-sponsor.entity';
import { SponsorshipInquiryTargetSponsor } from './sponsorship-inquiry-target-sponsor.entity';

@Entity('target_sponsor')
@Index(['name', 'sponsorshipCategory', 'deletedAt'], { unique: true, where: '"deleted_at" IS NULL' })
export class TargetSponsor extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'name', nullable: false })
  name: string;

  @ManyToOne(() => SponsorshipCategory, { nullable: false })
  @JoinColumn({ name: 'sponsorship_category_id' })
  sponsorshipCategory: SponsorshipCategory;

  @OneToMany(() => SponsorshipOpportunityTargetSponsor, sots => sots.targetSponsor, {
    cascade: ['soft-remove']
  })
  sponsorshipOpportunities: SponsorshipOpportunityTargetSponsor[];

  @OneToMany(() => SponsorshipInquiryTargetSponsor, sits => sits.targetSponsor, {
    cascade: ['soft-remove']
  })
  sponsorshipInquiries: SponsorshipInquiryTargetSponsor[];
} 