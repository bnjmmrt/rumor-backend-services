import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { SponsorshipOpportunity } from './sponsorship-opportunity.entity';
import { SponsorshipInquiryTargetSponsor } from './sponsorship-inquiry-target-sponsor.entity';
import { User } from '../../users/entities/user.entity';

@Entity('sponsorship_inquiry')
export class SponsorshipInquiry extends RumorBaseEntity {

  @ManyToOne(() => SponsorshipOpportunity, { nullable: false })  
  @JoinColumn({ name: 'sponsorship_opportunity_id' })  
  sponsorshipOpportunity: SponsorshipOpportunity;
  
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'inquirer_user_id' })
  inquirer: User;

  @OneToMany(() => SponsorshipInquiryTargetSponsor, sits => sits.sponsorshipInquiry, {
    cascade: ['soft-remove']
  })
  targetSponsors: SponsorshipInquiryTargetSponsor[];

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