import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Entity, Column, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { IndustryCategory } from './industry-category.entity';
import { IndustryOpportunityTargetIndustry } from './industry-opportunity-target-industry.entity';
import { IndustryInquiryTargetIndustry } from './industry-inquiry-target-industry.entity';

@Entity('target_industry')
@Index(['name', 'industryCategory', 'deletedAt'], { unique: true, where: '"deleted_at" IS NULL' })
export class TargetIndustry extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'name', nullable: false })
  name: string;

  @ManyToOne(() => IndustryCategory, { nullable: false })
  @JoinColumn({ name: 'industry_category_id' })
  industryCategory: IndustryCategory;

  @OneToMany(() => IndustryOpportunityTargetIndustry, sots => sots.targetIndustry, {
    cascade: ['soft-remove']
  })
  industryOpportunities: IndustryOpportunityTargetIndustry[];

  @OneToMany(() => IndustryInquiryTargetIndustry, sits => sits.targetIndustry, {
    cascade: ['soft-remove']
  })
  industryInquiries: IndustryInquiryTargetIndustry[];
} 