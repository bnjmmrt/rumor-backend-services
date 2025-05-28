import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Entity, Column, Index, OneToMany } from 'typeorm';
import { SponsorshipOpportunity } from './sponsorship-opportunity.entity';

@Entity('cultural_moment')
@Index('idx_unique_name', ['name'], { unique: true, where: '"deleted_at" IS NULL' })
export class CulturalMoment extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'name', nullable: false })
  name: string;

  @OneToMany(() => SponsorshipOpportunity, opportunity => opportunity.culturalMoment)
  sponsorshipOpportunities: SponsorshipOpportunity[];
} 