import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Entity, Column, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { IndustryCategory } from './industry-category.entity';

@Entity('target_industry')
@Index(['name', 'industryCategory', 'deletedAt'], { unique: true, where: '"deleted_at" IS NULL' })
export class TargetIndustry extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'name', nullable: false })
  name: string;

  @ManyToOne(() => IndustryCategory, { nullable: false })
  @JoinColumn({ name: 'industry_category_id' })
  industryCategory: IndustryCategory;
} 