import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { IndustryOpportunity } from './industry-opportunity.entity';
import { IndustryInquiryTargetIndustry } from './industry-inquiry-target-industry.entity';
import { User } from '../../users/entities/user.entity';

@Entity('industry_inquiry')
export class IndustryInquiry extends RumorBaseEntity {

  @ManyToOne(() => IndustryOpportunity, { nullable: false })  
  @JoinColumn({ name: 'industry_opportunity_id' })  
  industryOpportunity: IndustryOpportunity;
  
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'inquirer_user_id' })
  inquirer: User;

  @OneToMany(() => IndustryInquiryTargetIndustry, sits => sits.industryInquiry, {
    cascade: ['soft-remove']
  })
  targetIndustries: IndustryInquiryTargetIndustry[];

  @Column({ type: 'varchar', name: 'first_name', nullable: false })
  firstName: string;

  @Column({ type: 'varchar', name: 'company_name', nullable: false })
  companyName: string;

  @Column({ type: 'varchar', name: 'last_name', nullable: false })
  lastName: string;

  @Column({ type: 'varchar', name: 'email', nullable: false })
  email: string;

  @Column({ type: 'varchar', name: 'message', nullable: true })
  message: string;
} 