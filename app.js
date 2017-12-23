//-------------------------- imported packages----------------------------------
var fs = require('fs');
var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var bodyParser=require('body-parser');
var urlencodedParser=bodyParser.urlencoded({extended:false});
//var appController=require('./controller/appController');

//-------------------------Global Variables-----------------------------------
var userData;
var item_index;
var cost=[100,200,150,170,145,128];


app.set('view engine','ejs');
app.use(cookieParser());
app.use(session
	({
				  secret: "cjhkhgkh",
				  resave: true,
				  saveUninitialized: true,
				  cookie: { maxAge: 60000 }
	}));

//appController(app);

//---------------------------Home Page ----------------------------------------
	app.get('/home',function(req,res) 
	{
			
		if(req.session.uniqueID)
		{
			res.redirect('/users'+'/'+req.session.uniqueID);
		}
		else
		{
			res.render('home');
		}
			
	});



	app.post('/login',urlencodedParser,function(req,res) 
	{
		
		MongoClient.connect('mongodb://localhost:27017/test', function (err, db) 
		{
		  console.log('Connected to Database ');

		  if (err) throw err

		  db.collection('data').find({username:req.body.userid}).toArray(function (err, result) 
		  {
		  	console.log('Searching for the User ');
		  	console.log('Result length : '+result.length);

		    if (err) throw err

		    	if(result.length==0)
		    	{
		    		console.log('Not found');
		        	res.send('User not found');
		    	}
		        else
		        {
		        	if(result[0].password==req.body.password)
		        	{
		        		req.session.uniqueID=req.body.userid;
						userData=result;
						res.redirect('/users'+'/'+req.body.userid);
				  	}
				  	else
				  	{
				  		res.send('Incorrect Password');
				  	}
		        }
		  })

		})
		
	});

	app.get('/users/:userid',function(req,res) 
	{
		if(req.session.uniqueID)
		{
			console.log(req.params.userid);
			res.render('user',{userid:req.params.userid});
		}
		else
		{
			res.redirect('/home');
		}
		
	});

	app.get('/heynow',function(req,res) 
	{
		res.send('redirected');
	});

	app.get('/login',function(req,res) 
	{
		if(req.session.uniqueID)
		{
			res.redirect('/users'+'/'+req.session.uniqueID);
			console.log('redirected to users/userid');
		}
		else
		{
			res.render('login');
		}
		
	});

	app.get('/signup',function(req,res) 
	{
		res.render('signup');
	});

	app.post('/signup',urlencodedParser,function(req,res) 
	{
		console.log('Received from signup : '+req.body.userid+" password="+req.body.password);
		
		MongoClient.connect('mongodb://localhost:27017/test', function (err, db) 
		{
		  console.log('connected to database in signup');

		  if (err) throw err

		  db.collection('data').insertOne({"username":req.body.userid,"password":req.body.password,"address":req.body.address,"mobile":req.body.mobile},function(err, result) {
		  	if (err) throw err

		  	console.log('result '+ result);
		  	req.session.uniqueID=req.body.userid;
		  	userData=[{"username":req.body.userid,"password":req.body.password,"address":req.body.address,"mobile":req.body.mobile}];
			res.redirect('/users'+'/'+req.body.userid);
		  });
		  
	   })

	})

	app.get('/about',function(req,res) 
	{
		res.render('about');
	});

	app.get('/users/:userid/:final',function(req,res) {
		if(req.session.uniqueID)
		{
			res.render('final',{Obj:userData});
			item_index=req.params.final;
			console.log(userData);
		}
		else
		{
			res.redirect('/home');
		}
		
	});



	app.post('/users/:userid/:final',urlencodedParser,function(req,res) 
	{
		req.session.destroy(function(err) 
		{
			console.log('Destroying session');
		})

		var Obj1={"username":userData[0].username,"mobile":userData[0].mobile,"address":userData[0].address,"cost":cost[item_index]};

		if(req.body.existing_address)
		{			
			var datetime = new Date();
			console.log(datetime);
			
			fs.appendFile("./log",'log ID :'+datetime+ '<br>Customer ID : '+ userData[0].username +'<br>'+'Contact No :'+userData[0].mobile+'<br>Delivery Address :'+userData[0].address+'<br>Total Amount :'+cost[item_index], function(err) 
			{	    
			    if(err) 
			    {
			        return console.log(err);
			    }

			    console.log("The file was saved!");
			});

			userData=null; 

			res.render('bill',{Obj:Obj1});
			
		}
		else
		{
			Obj1.address=req.body.new_address;
			
			var datetime = new Date();
			console.log(datetime);
			
			fs.appendFile("./log",'log ID :'+datetime+ '<br>Customer ID : '+ userData[0].username +'<br>'+'Contact No :'+userData[0].mobile+'<br>Delivery Address :'+req.body.new_address+'<br>Total Amount :'+cost[item_index], function(err) 
			{
			    if(err) 
			    {
			        return console.log(err);
			    }

			    console.log("The file was saved!");
			}); 

			userData=null;
			
			res.render('bill',{Obj:Obj1});
			
		}
		
	});
	

	// Logout

	app.get('/destroy',function(req, res)
	{
		if(req.session)
		{
			req.session.destroy(function(err) {
				console.log('Destroying session');
			})
		}

  		console.log('destroyed session');
  		userData=null;
  		res.redirect('/home');
	});

	app.get('*', function(req, res)
	{
  		res.status(404).send('Page Not Found')
	});

	// start the server
	app.listen(3000,function(argument) 
	{
		console.log('App started');
	});