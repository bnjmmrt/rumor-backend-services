#!/usr/bin/env node
const { cd, cp, exec, mkdir, pwd, rm } = require('shelljs');
const argv = require('yargs').argv;

const root = pwd();

const utils = 'rumor-utils';

const users = 'users';
const events = 'events';
const notifications = 'notifications';

const packageNames = [utils];
const appNames = [users, events, notifications];

const packagesToBuild = argv.packages ? argv.packages.split(',') : packageNames;
const appsToBuild = argv.apps ? argv.apps.split(',') : appNames;

const packages = [
    {
        name: utils,
        builder: 'rumor_utils_builder',
        path: `${root}/rumor-utils`
    }
];

const apps = [
    {
        name: users,
        appDirectory: `${root}/apps/users`,
        packagesDirectory: `${root}/apps/users/packages`,
        dependencies: [utils]
    },
    {
        name: events,
        appDirectory: `${root}/apps/events`,
        packagesDirectory: `${root}/apps/events/packages`,
        dependencies: [utils]
    },
    {
        name: notifications,
        appDirectory: `${root}/apps/notifications`,
        packagesDirectory: `${root}/apps/notifications/packages`,
        dependencies: [utils]
    }
];

const buildPackage = ({ path }) => {
    cd(path);
    exec(`npm install`);
};

const distributePackages = ({ appDirectory }) => {
    cd(appDirectory);
    exec('npm install');
    cd(root);
};

packages.filter(({ name }) => packagesToBuild.includes(name)).map(buildPackage);
apps.filter(({ name }) => appsToBuild.includes(name)).map(distributePackages);

console.log('Done 🌟');
