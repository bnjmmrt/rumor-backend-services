import { RumorBaseEntity } from 'rumor-utils/entities/rumor-base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Address extends RumorBaseEntity {
  @Column({ type: 'varchar', name: 'address' })
  address: string;

  @Column({ type: 'varchar', name: 'google_place_id' })
  googlePlaceId: string;

  @Column({ type: 'varchar', name: 'city', nullable: true })
  city?: string;

  @Column({ type: 'double precision', name: 'latitude', nullable: true })
  latitude?: number;

  @Column({ type: 'double precision', name: 'longitude', nullable: true })
  longitude?: number;
}
