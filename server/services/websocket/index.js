var TutorModel = require('../../models/TutorModel');

module.exports = (http) => { //maybe I should do the http as the parameter
    var io = require('socket.io')(http);
    const schedule = io.of("/Schedule");

    schedule.on("connection", (socket) => {
        console.log("successful connection from the server");
        //console.log(Tutor); //this is undefined, and it is what is causing problems
        socket.on("findTutors", async (request) => {
            console.log(`Request for a tutoring session received by the server: ${request.course}`);
            console.log(request)

            socket.emit("availTutors", TutorModel.find({ courses: request.course}));
        });
    });

    return io;
}