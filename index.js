var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var clients = {}
var current_dim = null

app.get('/open/:dimID', function (req, res) {
	if(req.params.dimID in clients && req.params.dimID != current_dim){
		io.emit('deactivate')
		io.emit('leave')
		io.emit('activate',[req.params.dimID,current_dim])
		io.emit('arrive',req.params.dimID)
		res.send('Sucess\nConnected '+current_dim+' to '+req.params.dimID)
		current_dim = req.params.dimID
	} else {
		res.send('Error\nInvalid dimension selected.')
	}
})

app.get('/:dimID', function (req, res) {
	if (/[ABCDEF][1-9][0-9]{0,2}/.test(req.params.dimID)){
		res.sendFile(__dirname + "/public/index.html")
	} else {
		res.send("Incorrect format, should be a letter A-F and 1-3 digits\nEg: C137,A5,F22")
	}
})

app.get('/', function(req, res){
	res.redirect("http://portalgun.tk/"+randDim())
})

io.on('connection', function(socket){
	socket.emit('query',current_dim)
	//console.log('user connected')
	socket.on('setup', function(dimID){
		console.log(dimID, "connected")
		if(current_dim == null){
			current_dim = dimID
			io.emit('leave')
			socket.emit('arrive',dimID)
		}
		var found = false
		for(var property in clients){
			found = found || property == dimID
		}
		if(!found){	
			clients[dimID] = socket.id
			console.log(clients)
			console.log("Current Dimension:",current_dim)
		}
	})
	socket.on('disconnect', function(){
		for(var property in clients){
			if(clients[property] == socket.id){
				delete clients[property]
				console.log(property,'disconnected')
			}
		}
	})
})

http.listen(3000, function(){
	console.log('listening on *:3000')
})

function randDim(){
	letters = "ABCDEF"
	digits = "0123456789"
	s = letters[Math.floor(Math.random()*6)]+String(Math.floor(Math.random()*1000))
	return s
}