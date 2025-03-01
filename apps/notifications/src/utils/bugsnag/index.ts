import Bugsnag from '@bugsnag/js';
import BugsnagPluginExpress from '@bugsnag/plugin-express';
import config from '../../config';


const bugsnagClient = Bugsnag.start({
    apiKey: 'YOUR_API_KEY',
    plugins: [BugsnagPluginExpress]
})

// const bugsnagClient = Bugsnag.start({
//     apiKey: config.get('bugsnagApiKey'),
//     releaseStage: config.get('env'),
//     notifyReleaseStages: ['staging', 'production'],
//     logger: null
// });

export default bugsnagClient;
