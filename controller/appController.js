var bodyParser=require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var urlencodedParser=bodyParser.urlencoded({extended:false});

module.exports=function (app)
{
	app.use(cookieParser());
	app.use(session({secret: "Shh, its a secret!"}));

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
		
	})

	app.post('/login',urlencodedParser,function(req,res) 
	{
		//res.send(JSON.stringify(req.body));

		// If password is correct then proceed else show error

		req.session.uniqueID=req.body.userid;
		//console.log(req.session.uniqueID);
		res.redirect('/users'+'/'+req.body.userid);
	})

	app.get('/users/:userid',function(req,res) {
		
		console.log(req.params.userid);
		
		res.render('user');
	})

	app.get('/heynow',function(req,res) 
	{
		res.send('redirected');
	})

	app.get('/login',function(req,res) 
	{
		
		//console.log('1111');
		
		if(req.session.uniqueID)
		{
			res.redirect('/users'+'/'+session.uniqueID);
		}

		res.render('login');
	})

	app.get('/signup',function(req,res) 
	{
		res.render('signup');
	})

	app.get('/about',function(req,res) 
	{
		res.render('about');
	})

	app.get('/users/:userid/final',function(req,res) {
		res.render('final',{userid:req.params.userid});
		console.log(JSON.stringify(req.params));
	})

	app.post('/users/:userid/final',function(req,res) {
		res.send('<h2>Congrats '+req.params.userid+' Your Order has been successfully placed</h2>');
	})

	app.get('*', function(req, res){
  		res.status(404).send('Page Not Found')
})

}