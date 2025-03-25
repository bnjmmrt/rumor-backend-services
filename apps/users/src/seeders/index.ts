import { Role } from "rumor-utils/shared/entities/index";
import database from "../database";

export class Seeders {
  public static dbConnection = database;

  public static async seedRoles() {
    try {
      const rolesData = [
        { name: "admin", subRoles: ["rumor_super_admin", "rumor_manager"] },
        {
          name: "host",
          subRoles: [
            "main_host",
            "co_host",
            "promoter",
            "contributor",
            "check_in",
          ],
        },
        { name: "member", subRoles: ["non_member"] },
      ];

      for (const roleData of rolesData) {
        let role = await this.dbConnection.getRepository(Role).findOne({
          where: { name: roleData.name },
        });
        if (!role) {
          role = new Role();
          role.name = roleData.name;
          await this.dbConnection.getRepository(Role).save(role);
        }

        for (const subRoleName of roleData.subRoles) {
          let subRole = await this.dbConnection.getRepository(Role).findOne({
            where: { name: subRoleName },
          });
          if (!subRole) {
            subRole = new Role();
            subRole.name = subRoleName;
            subRole.parentRole = role;
            await this.dbConnection.getRepository(Role).save(subRole);
          }
        }
      }
    } catch (error) {
      console.log(error)
    }
  }
}
