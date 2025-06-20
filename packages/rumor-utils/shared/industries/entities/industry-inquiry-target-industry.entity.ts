import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { IndustryInquiry } from './industry-inquiry.entity';
import { TargetIndustry } from './target-industry.entity';

@Entity('industry_inquiry_target_industry')
@Index(['industryInquiry', 'targetIndustry', 'deletedAt'], { 
  unique: true, 
  where: '"deleted_at" IS NULL' 
})
export class IndustryInquiryTargetIndustry extends RumorBaseEntity {
  @ManyToOne(() => IndustryInquiry, { nullable: false })
  @JoinColumn({ name: 'industry_inquiry_id' })
  industryInquiry: IndustryInquiry;

  @ManyToOne(() => TargetIndustry, { 
    nullable: false,
    cascade: ['soft-remove']
  },)
  @JoinColumn({ name: 'target_industry_id' })
  targetIndustry: TargetIndustry;

  @Column({ type: 'boolean', name: 'is_excluded', default: false })
  isExcluded: boolean;
} 