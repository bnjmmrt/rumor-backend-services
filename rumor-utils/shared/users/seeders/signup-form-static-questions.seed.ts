// import { Repository } from 'typeorm';
// import { Role } from '../entities/roles/role.entity';

// export class RolesSeeder {
//   constructor(
//     @InjectRepository(Role)
//     private readonly roleRepository: Repository<Role>,
//   ) {}

//   async seedRoles() {
//     const rolesData = [
//       { name: 'admin', subRoles: ['rumor_super_admin', 'rumor_manager'] },
//       { name: 'host', subRoles: ['main_host', 'co_host', 'promoter', 'contributor', 'check_in'] },
//       { name: 'member', subRoles: ['non_member'] },
//     ];

//     for (const roleData of rolesData) {
//       let role = await this.roleRepository.findOne({ where: { name: roleData.name } });
//       if (!role) {
//         role = new Role();
//         role.name = roleData.name;
//         await this.roleRepository.save(role);
//       }

//       for (const subRoleName of roleData.subRoles) {
//         let subRole = await this.roleRepository.findOne({ where: { name: subRoleName } });
//         if (!subRole) {
//           subRole = new Role();
//           subRole.name = subRoleName;
//           subRole.parentRole = role;
//           await this.roleRepository.save(subRole);
//         }
//       }
//     }
//   }
// }
