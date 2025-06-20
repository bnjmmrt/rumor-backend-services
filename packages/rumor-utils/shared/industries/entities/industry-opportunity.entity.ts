import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Entity, Column, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { Event } from '../../events/entities/event.entity';
import { OpportunityType } from '../enums/opportunity-type.enum';
import { IndustryOpportunityTargetIndustry } from './industry-opportunity-target-industry.entity';
import { IndustryInquiry } from './industry-inquiry.entity';
import { CulturalMoment } from './cultural-moment.entity';

@Entity('industry_opportunity')
@Index(['event', 'deletedAt'], { unique: true, where: '"deleted_at" IS NULL' })
export class IndustryOpportunity extends RumorBaseEntity {

  @ManyToOne(() => Event, { nullable: true })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => CulturalMoment, { nullable: true })
  @JoinColumn({ name: 'cultural_moment_id' })
  culturalMoment?: CulturalMoment;

  @OneToMany(() => IndustryOpportunityTargetIndustry, sots => sots.industryOpportunity, {
    cascade: ['soft-remove']
  })
  targetIndustries: IndustryOpportunityTargetIndustry[];

  @OneToMany(() => IndustryInquiry, inquiry => inquiry.industryOpportunity, {
    cascade: ['soft-remove']
  })
  inquiries: IndustryInquiry[];

  @Column({ 
    type: 'enum', 
    name: 'opportunity_type', 
    enum: OpportunityType,
    nullable: false,
    default: OpportunityType.UNKNOWN
  })
  opportunityType: OpportunityType;

  @Column({ type: 'varchar', name: 'description', nullable: false })
  description: string;

  @Column({ type: 'varchar', name: 'promo_link', nullable: true })
  promoLink: string;

  @Column({ type: 'integer', name: 'paid_industry_minimum', nullable: true })
  paidIndustryMinimum: number;

  @Column({ type: 'integer', name: 'paid_industry_maximum', nullable: true })
  paidIndustryMaximum: number;

  @Column({ type: 'boolean', name: 'is_draft', nullable: false, default: true })
  isDraft: boolean;

  @Column({ type: 'varchar', name: 'image_url', nullable: false })
  imageUrl: string;

  @Column({ type: 'varchar', name: 'deck_url', nullable: false })
  deckUrl: string;  
}

