module.exports = function(server){
  var io = require('socket.io')(server);
  
  io.on('error', function(err){
    throw err;
   });
  
  io.on('connection', function (socket) {
    console.log("connected!");
  
  });

  return io;
}
