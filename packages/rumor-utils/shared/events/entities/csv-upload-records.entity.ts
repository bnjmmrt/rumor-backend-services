import { RumorBaseEntity } from '../../entities/rumor-base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UploadType } from '../interfaces/event.interface';
import { Event } from './event.entity';

@Entity()
export class CsvUploadRecords extends RumorBaseEntity {
  @Index()
  @ManyToOne(() => Event, (event) => event.csvUploads, { nullable: true, cascade: true })
  @JoinColumn({ name: 'event_id' })
  event: Event | null; // Nullable for cases where it's user upload

  @Index()
  @ManyToOne(() => User, (user) => user.csvUploads, { cascade: true })
  @JoinColumn({ name: 'owner_id' })
  host: User;

  @Column({ type: 'enum', enum: UploadType })
  uploadType: UploadType;

  @Column({ type: 'text' })
  originalCsvPath: string; // S3 path of the uploaded CSV

  @Column({ type: 'text', nullable: true })
  errorCsvPath?: string; // S3 path of the error CSV (garbageData), if applicable

  // New Relation: Users uploaded via this CSV
  @OneToMany(() => User, (user) => user.uploadedViaCsv)
  uploadedUsers: User[];
}