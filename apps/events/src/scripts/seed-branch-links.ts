#!/usr/bin/env ts-node

import config from '../config';
import connectionManager from '../database';
import { Seeders } from '../seeders';

const runBranchLinksSeeder = async () => {
  console.info('[BRANCH-LINKS-SEEDER] - Starting branch links seeder...');
  try {
    // Load configuration
    await config.load();

    // Initialize database connection
    await connectionManager.initializeDbConnection();

    // Run the branch links seeder
    await Seeders.seedEventBranchLinks();

    console.info('[BRANCH-LINKS-SEEDER] - Branch links seeder completed successfully! 🚀');
    process.exit(0);
  } catch (err) {
    console.error('[BRANCH-LINKS-SEEDER] - Failed to run branch links seeder:', err);
    process.exit(1);
  }
};

// Run the seeder if this script is executed directly
if (require.main === module) {
  runBranchLinksSeeder();
}

export default runBranchLinksSeeder;
