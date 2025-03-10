import { Role } from "rumor-utils/shared/entities/index";
import database from "../database";

export class Seeders {
  public static async seedRoles() {
    try {
      console.log("[SEEDER] Starting role seeding...");
      
      // Ensure database connection is initialized
      if (!database.connection || !database.connection.isInitialized) {
        console.log("[SEEDER] Initializing database connection...");
        await database.initializeDbConnection();
        
        // Add a small delay to ensure entity registration is complete
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log("[SEEDER] Database connection status:", database.connection?.isInitialized);
      console.log("[SEEDER] Available entities:", database.connection?.entityMetadatas.map(m => m.name));
      
      // Get Role repository directly
      const roleRepository = database.connection?.getRepository(Role);
      if (!roleRepository) {
        throw new Error("Failed to get Role repository - connection not initialized");
      }
      console.log("[SEEDER] Got Role repository successfully");
      
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
        let role = await roleRepository.findOne({
          where: { name: roleData.name },
        });
        if (!role) {
          role = new Role();
          role.name = roleData.name;
          await roleRepository.save(role);
        }

        for (const subRoleName of roleData.subRoles) {
          let subRole = await roleRepository.findOne({
            where: { name: subRoleName },
          });
          if (!subRole) {
            subRole = new Role();
            subRole.name = subRoleName;
            subRole.parentRole = role;
            await roleRepository.save(subRole);
          }
        }
      }
    } catch (error) {
      console.error("[SEEDER] Error in seedRoles:", error);
      throw error;
    }
  }
}
