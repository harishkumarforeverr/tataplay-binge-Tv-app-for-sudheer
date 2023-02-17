let environment = process.env.NODE_ENV !== undefined ? (process.env.NODE_ENV).toString().trim().toLowerCase() : 'qa';
switch (environment) {

    case 'development' :
        environment = 'dev';
        break;
    case 'production' :
        environment = 'prod';
        break;
    case 'qa' :
        environment = 'qa';
        break;
    case 'uat' :
        environment = 'uat';
        break;
    case 'staging' :
        environment = 'staging';
        break;
    case 'staging-dr' :
        environment = 'staging-dr';
        break;
    default :
        environment = 'qa';
}

// if (!process.env.BROWSER){
console.log("\n---------------------- Loading configurations for environment = " + environment + " ---------------------- ");
// }
const appConfig = require('./' + environment + '.js');

//export default appConfig.default;
module.exports = appConfig;