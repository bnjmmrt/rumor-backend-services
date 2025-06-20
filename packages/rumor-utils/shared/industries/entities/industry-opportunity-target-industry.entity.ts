import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { IndustryOpportunity } from './industry-opportunity.entity';
import { TargetIndustry } from './target-industry.entity';

@Entity('industry_opportunity_target_industry')
@Index(['industryOpportunity', 'targetIndustry', 'deletedAt'], { 
  unique: true, 
  where: '"deleted_at" IS NULL' 
})
export class IndustryOpportunityTargetIndustry extends RumorBaseEntity {
  @ManyToOne(() => IndustryOpportunity, { nullable: false })
  @JoinColumn({ name: 'industry_opportunity_id' })
  industryOpportunity: IndustryOpportunity;

  @ManyToOne(() => TargetIndustry, { 
    nullable: false,
    cascade: ['soft-remove']  // Add this
  })
  @JoinColumn({ name: 'target_industry_id' })
  targetIndustry: TargetIndustry;

  @Column({ type: 'boolean', name: 'is_excluded', default: false })
  isExcluded: boolean;
} 