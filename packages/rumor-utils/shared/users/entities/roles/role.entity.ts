import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { UserRole } from './user-role.entity';
import { Collaborator } from '../../../events/entities/collaborator.entity';
import { DefaultRoleSettings } from '../../../events/entities/default-role-settings.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @ManyToOne(() => Role, role => role.children)
  @JoinColumn({ name: 'parent_role_id' })
  parentRole: Role;

  @OneToMany(() => Role, role => role.parentRole)
  children: Role[];

  @OneToMany(() => UserRole, userRole => userRole.role)
  userRoles: UserRole[];

  @OneToMany(() => Collaborator, collaborator => collaborator.role)
  collaborators: Collaborator[];

  @OneToMany(() => DefaultRoleSettings, defaultRoleSetting => defaultRoleSetting.role)
  defaultRoleSettings: DefaultRoleSettings[];

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;
}
