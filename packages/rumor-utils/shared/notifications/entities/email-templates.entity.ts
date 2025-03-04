import { Column, Entity, OneToMany } from 'typeorm';
import { ParamsEmailTemplateInterface } from '../interfaces/email-templates.interface';
// import { RumorBaseEntity } from '@rumor/shared/entities/rumor-base.entity';
import { RumorBaseEntity } from '../../../shared/entities/rumor-base.entity';
import { Notification } from './notification.entity';

@Entity()
export class EmailTemplate extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'template_name' })
  templateName: string;

  @Column({ type: 'varchar', name: 'template_sendgrid_id' })
  templateSendgridId: string;

  @Column({ type: 'jsonb', nullable: true, name: 'params' })
  params: ParamsEmailTemplateInterface[];

  @OneToMany(() => Notification, (notification) => notification.relatedTemplate)
  notifications: Notification[];
}
