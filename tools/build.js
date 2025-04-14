#!/usr/bin/env node
const { cd, cp, exec, mkdir, pwd, rm } = require('shelljs');
const argv = require('yargs').argv;

const root = pwd();

const utils = 'rumor-utils';

const users = 'users';
const events = 'events';
const notifications = 'notifications';
const schedular = 'schedular';

const packageNames = [utils];
const appNames = [users, events, notifications, schedular];

const packagesToBuild = argv.packages ? argv.packages.split(',') : packageNames;
const appsToBuild = argv.apps ? argv.apps.split(',') : appNames;

const packages = [
    {
        name: utils,
        builder: 'rumor_utils_builder',
        path: `${root}/packages/rumor-utils`
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
    },
    {
        name: schedular,
        appDirectory: `${root}/apps/schedular`,
        packagesDirectory: `${root}/apps/schedular/packages`,
        dependencies: [utils]
    }
];

const copyDependencies = (dependencies, destinationName, destinationPath) => {
    console.log(`Copying packages over to ${destinationName}...`);
    rm('-rf', destinationPath);
    mkdir(destinationPath);

    dependencies.forEach(packageName => {
        const { path } = packages.find(({ name }) => name === packageName);
        rm('-rf', `${destinationPath}/${packageName}`);
        cp('-r', `${path}/dist/`, `${destinationPath}/${packageName}`);
    });
};

const buildPackage = ({ name, path }) => {
    console.log(`Building ${name} package...`);
    cd(path);
    rm('-rf', 'dist');
    exec('npm install');
    exec('npm run build');
    cd(root);
};

const distributePackages = ({ name: appName, appDirectory, packagesDirectory, dependencies }) => {
    copyDependencies(dependencies, appName, packagesDirectory);
    cd(appDirectory);
    exec('npm install');
    cd(root);
};

packages.filter(({ name }) => packagesToBuild.includes(name)).forEach(buildPackage);
apps.filter(({ name }) => appsToBuild.includes(name)).forEach(distributePackages);

// const containersString = appsToBuild.join(' ');

// console.log('Rebuilding dependent images...');
// exec(`docker-compose build ${containersString}`);

// console.log('Restarting dependent containers...');
// exec(`docker-compose up -d --no-deps ${containersString}`);

console.log('Done 🌟');
