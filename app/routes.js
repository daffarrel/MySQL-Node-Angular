var dbconfig = require('../config/database');
var mysql = require('mysql');
var connection = mysql.createConnection(dbconfig.connection); 
var bcrypt = require('bcrypt-nodejs');
var bodyParser = require('body-parser');
var urlencodedparser = bodyParser.urlencoded({extended:false})
var nodemailer = require('nodemailer');
var schedule = require('node-schedule');

module.exports = function(app,passport) {

// Defining variables

    const output = '';

    // Send email

app.post('/send', (req, res) => {
  const output = `
    <p>You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>  
      <li>Name: ${req.body.name}</li>
      <li>Company: ${req.body.company}</li>
      <li>Email: ${req.body.email}</li>
      <li>Phone: ${req.body.phone}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
  `;

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: 'Mailgun',
    auth: {
        user: process.env.MAILGUN_USER, // generated ethereal user
        pass: process.env.MAILGUN_PASSWORD  // generated ethereal password
    },
    tls:{
      rejectUnauthorized:false
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
      from: '"Growth-X Team" <help@growth-x.com>', // sender address
      to: req.body.email, // list of receivers
      subject: 'Hey from GX', // Subject line
      text: 'Hello world?', // plain text body
      html: output // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);   
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

      res.render('index', {msg:'Email has been sent'});
  });
  });

// Sending at specific time:
     
    var j = schedule.scheduleJob('42 * * * * *', function(){
      console.log('The answer to life, the universe, and everything!');



// Getting info from DB and sending in email

      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
       service: 'Mailgun',
       auth: {
             user: process.env.MAILGUN_USER, // generated ethereal user
             pass: process.env.MAILGUN_PASSWORD  // generated ethereal password
             },
        tls:{
          rejectUnauthorized:false
        }
      });


// Pass in the client id here - in this case 404 (Hannah)
        connection.query('select * from client where client_id = ?',1, function (err, rows) {
       
        const output = `
        <p>You have a new contact request</p>
        <h3>New Email</h3>
        <ul>  
          <li>Name: 'Muchacho'</li>
          <li>Even the HTML Formatiing works!!! Also sent via Node</li>
          <li>Email: `+ rows[0].client_name + `<---- This is the sql results</li>
            
        </ul>
        <h3>Message</h3>
        <p>Generated by scheduler</p>
         `;

     

      // setup email data with unicode symbols
      let mailOptions = {
          from: '"Nodemailer Contact" <your@email.com>', // sender address
          to: 'alephmarketingpros@gmail.com', // list of receivers
          subject: 'New Email', // Subject line
          text: rows[0].client_name, // plain text body
          html: output // html body
              };


      // send mail with defined transport object
      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              return console.log(error);
          }
          console.log('Message sent: %s', info.messageId);   
          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

          res.render('index', {msg:'Email has been sent'});
      });

     });

      // End of mail sending


    });


      app.get('/',isLoggedIn,function(req,res){
        res.render('index.ejs'); 
    });


    app.get('/community', function(req, res) {
        var row = [];
        var row2=[];
        var row3=[];

        connection.query('select * from client where client_id = ?',[req.user.client_id], function (err, rows) {
            if (err) {
                console.log(err);
            } else {
                if (rows.length) {
                    for (var i = 0, len = rows.length; i < len; i++) {  //query den gelen bütün parametreleri rows sınıfına ekliyoruz .
                        row[i] = rows[i];
                        
                    }  
                }
                        
            }

            
         connection.query('select * from client inner join post on client.client_id = post.client_id', function (err, rows2) {
                if (err) {
                    console.log(err);
                } else {
                    if (rows2.length) {
                        for (var i = 0, len = rows2.length; i < len; i++) {  //query den gelen bütün parametreleri rows sınıfına ekliyoruz .
                            row3[i] = rows2[i];
                        }  
                    }            
                }
        res.render('community.ejs', {rows : row,rows3:row3});     
            }); 
        });
    });



      // Get row for the logged in user (i.e. client)
    app.get('/api/user',isLoggedIn,function(req,res){
        var row = [];
        connection.query('select * from client where client_id = ?',[req.user.client_id], function (err, rows) {
            
            res.json(rows);
        });
      
    });


    // Get all campaigns
     app.get('/api/campaigns',isLoggedIn,function(req,res){
        var row = [];
        connection.query('select * from campaign where client_id = ?',[req.user.client_id], function (err, rows) {
            
            res.json(rows);
        });
      
    });


     // Get all LinkedIn Users of the logged in client

     app.get('/api/users',isLoggedIn,function(req,res){
        var row = [];
        connection.query("select concat(user_first_name, ' ', user_last_name) as fullname from user where client_id = ?",[req.user.client_id], function (err, rows) {
            
            res.json(rows);
        });
      
    });




    app.get('/api/todos',function(req,res){
        var row = [];
      connection.query('select * from client inner join post on client.client_id = post.client_id', function (err, rows) {
            if (err) {
                console.log(err);
            } else {
                if (rows.length) {
                    for (var i = 0, len = rows.length; i < len; i++) {  //query den gelen bütün parametreleri rows sınıfına ekliyoruz .
                        row[i] = rows[i];
                    }  
                }
                console.log(row);
                
            }
            res.json(rows);
            
        });
    });

    app.get('/api/viewcomments/:postID',function(req,res){
        var postID = req.params.postID;
        var row = [];
        console.log(postID);
        connection.query('select client.client_email as u ,t1.y as t,t1.idsi as idsi1 from (select comment.comment_id as k,comment.text as y,comment.client_id as x,post.post_id as idsi from comment inner join post on post.post_id = comment.post_id where post.post_id= "'+postID+'" ) as t1 , client where client.client_id = t1.x  order by k desc limit 4 ', function (err, rows) {
            if (err) {
                console.log(err);
            } else {
                if (rows.length) {
                    for (var i = 0, len = rows.length; i < len; i++) {  //query den gelen bütün parametreleri rows sınıfına ekliyoruz .
                        row[i] = rows[i];
                    }  
                }
                console.log(row);
                
            }
            res.json(rows);
            
        });
    });

    app.post('/api/todos',function(req,res){
        var row = [];
        var row2=[];
        connection.query('select * from client where client_id = ?',[req.user.client_id], function (err, rows) {
            if (err) {
                console.log(err);
            } else {
                if (rows.length) {
                    for (var i = 0, len = rows.length; i < len; i++) {  //query den gelen bütün parametreleri rows sınıfına ekliyoruz .
                        row[i] = rows[i];  
                    }  
                }
                console.log(row);
            }
            connection.query('insert into post(text,client_id,likes) values("'+req.body.gonderi_icerik+'","'+req.user.client_id+'",0)');
            connection.query('select * from client inner join post on client.client_id = post.client_id',function(err,rows2){
                if(err){
                    console.log(err);
                }else{
                    res.json(rows2);
                }
                
            })
        });
  });


    app.post('/api/comments/:postID',isLoggedIn,function(req,res){
        var postID = req.params.postID;
        var comment = req.body.commenttext;
        connection.query('insert into comment(text,client_id,post_id) values("'+comment+'","'+req.user.client_id+'","'+postID+'")')


    });


    app.get('/api/viewlikes/:postID',isLoggedIn,function(req,res){
        var postID = req.params.postID;
        var row = [];
      connection.query('select likes from post where post_id=?',[postID], function (err, rows) {
            if (err) {
                console.log(err);
            } else {
                if (rows.length) {
                    for (var i = 0, len = rows.length; i < len; i++) {  //query den gelen bütün parametreleri rows sınıfına ekliyoruz .
                        row[i] = rows[i];
                    }  
                }
                console.log(row);
                
            }
            res.json(rows);
            
        });
    });

    app.get('/api/like/:postID',isLoggedIn,function(req,res){
        console.log("like post");
        var postID = req.params.postID;
        connection.query("update post set likes=likes+1 where post_id='"+postID+"'")
      
    });



    app.get('/error',function(req,res){

        res.render("error.ejs");

    });

    app.get('/login', function(req, res) {
        
        res.render('login.ejs',{ message: req.flash('loginMessage') });

    });

    app.get('/signup', function(req, res){
        res.render('signup.ejs',{message: req.flash('message')});
      });

    app.post('/signup', passport.authenticate('local-signup', {
            successRedirect: '/',
            failureRedirect: '/signup',
            failureFlash : true 
    }));

    app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/', 
            failureRedirect : '/login',
            failureFlash : true 
        }),
        function(req, res) {
            console.log("hello");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });


};


function isLoggedIn(req,res,next){
	if(req.isAuthenticated())
		return next();
	res.redirect('/login');
}

