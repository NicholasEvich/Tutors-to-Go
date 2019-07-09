const CronJob = require('cron').CronJob;
const TutorModel = require('../../models/TutorModel');

const options = {
    cronTime: '0 0,30 * * * *',
    onTick: duringCronJob, //I don't know if I need parentheses on these or not
    onComplete: afterCronJob,
    start: true, //if this is set to false, I will need to set the new CronJob equal to a variable and then call <var>.start() to start the process
    timeZone:'America/New_York', //I dont know if this is correct
    //context:, (his one may be important, idk: I currently have access to this.stop in the onTick function)
    //unrefTimeout: this may also be important for the Node.js event loop, which I should become familiar with
}

//The third option will be updated if I only want it running during certain hours, 
//the fifth option can be adjusted if I do not want it running during the summer
new CronJob('0 0,30 * * * *', () => {

}, options);

function duringCronJob() { //use this.stop() if necessary
    //check Tutor Model and update it
}

function afterCronJob() {
    console.log('Cron job complete')
}

//Where and how should I module.exports this? Should I import it into db.js, TutorModel.js, app.js, or www.js?
//Should I export it as a function or an object?