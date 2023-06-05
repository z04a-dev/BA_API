var express = require('express'); // оснастка веб сервера
var app = express();
var mysql = require('mysql'); // клиент для MYSQL Server

const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

var pool = mysql.createPool({
	connectionLimit: 10,
	host: '172.17.0.2',
	user: 'root',
	password: '160301',
	database: 'info'
});

// сервер для http://localhost:8081/
var server = app.listen(8081, function () {
    var host = server.address().address 
    var port = server.address().port

    console.log("сервер доступен по url http://%s:%s", host, port)
});

function getDriver(info, callback) {
	pool.getConnection(function(err,con) {
		if(err) throw err;
		con.query("SELECT name FROM info where qr='" + info + "'", function (err, result) {
			if (err) throw err;
			if (result.length > 0) {
				callback(err, result[0].name)
			} else {
				callback(err, 'info')
			}
		})
		con.release()
	})
}

const fs = require('fs');

app.get('/api/sendfile', (req, res) => {
    filePath = `${__dirname}/res/${req.headers['info']}.zip`;
    fs.readFile(filePath, (err, file) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Could not download file');
        }

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'inline; filename="games.zip"');
		
        res.send(file);
        console.log("sending file")
		//console.log(req.headers)
    });
});

 
app.get('/', (req, res) => {
  res.send('Hello World!')
})
 
app.post('/api', (req, res) => {
    let data = req.body;
    //console.log(data)
    console.log("CONNECTION")
    //res.send('Data Received: ' + JSON.stringify(data['info']));
    if (JSON.stringify(data['info']) !== undefined) {
		info = JSON.stringify(data['info']).replace(/['"]+/g, '')
		getDriver(info, function (err, driverResult) {
			//console.log(driverResult)
			res.json({'info': driverResult})
		})
    }
})
 

app.get('/info', function (req, res) {
	
});
