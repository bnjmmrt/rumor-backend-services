import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Entity, Column, OneToMany, Index } from 'typeorm';
import { TargetIndustry } from './target-industry.entity';

@Entity('industry_category')
export class IndustryCategory extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'name', nullable: false })
  name: string;

  @OneToMany(() => TargetIndustry, targetIndustry => targetIndustry.industryCategory, {
    cascade: ['soft-remove']
  })
  targetIndustries: TargetIndustry[];
}
