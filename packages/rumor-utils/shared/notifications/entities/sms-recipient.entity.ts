import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { RumorBaseEntity } from '../../../shared/entities/rumor-base.entity';

@Entity({ name: 'sms_recipients' })
export class SmsRecipient extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'phone_number', nullable: false, unique: true })
  phoneNumber: string;

  @Column({ type: 'boolean', name: 'has_received_compliance_message', default: false })
  hasReceivedComplianceMessage: boolean;

  @Column({ type: 'timestamp', name: 'last_message_sent_at', nullable: true })
  lastMessageSentAt?: Date;
}
