//all dependencies ----------------------------------------------------

const auth = require('http-auth');
const express = require('express');
const session = require('express-session');

const path = require('path');

const fs = require('fs'); 
const multer = require('multer'); 
  
const storage = multer.diskStorage({ 
    destination: (req, file, cb) => { 
        cb(null, 'images') 
    }, 
    filename: (req, file, cb) => { 
        cb(null, file.fieldname + '-' + Date.now()) 
    } 
}); 
  
const upload = multer({ storage: storage }); 

const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator');

const router = express.Router();
const Registration = mongoose.model('Registration');
const Medicine = mongoose.model('Medicine');
const Contact = mongoose.model('Contact');
const basic = auth.basic({
  file: path.join(__dirname, '../users.htpasswd'),
});

const _ = require('underscore-node');
//-----------------------------------------------end of dependencies

router.use(session({secret : 'medicalstoreproject'}));

//link for home page-----------------------------------------------------------
router.get('/', (req, res) => {//path to indicate start page on 3000 port
	if (req.session.email){res.redirect('./postlogin');}
	else{res.render('home', { title: 'Home Page' });}
});

//link for registration page----------------------------------------------------
router.get('/register', (req, res) => {
	if (req.session.email){res.redirect('./postlogin');}
	else{res.render('register', { title: 'Registration Page' });}
});

//link for login page---------------------------------------------------
router.get('/login', (req, res) => {
	if (req.session.email){res.redirect('./postlogin');}
  else{res.render('login', { title: 'Login Page' });}//uses login.pug for ./login
});

//link for user---------------------------------------------------
router.get('/user', (req, res) => {
	if(req.session.accs==false){res.render('user', { title: 'User Home Page'});}
  else{res.redirect('/');}
});

//link for admin---------------------------------------------------
router.get('/admin', (req, res) => {
  if(req.session.accs==true){res.render('admin', { title: 'Admin Home Page'});}
  else{res.redirect('/');}
});


//action after pressing submit in registration page-------------------------------
router.post('/register',
  [
    check('password').isLength({ min: 5 })
      .withMessage('Password should have atleast 5 characters'),
  ],
 (req, res) => {
  const errors = validationResult(req);

    if (errors.isEmpty()) {
		Registration.findOne({email: req.body.email},function(error,result){
			if(result){
				var e = "Email already exists!";
				res.render('register', {
				title: 'Registration form',
				emailexist: true,
				data: req.body,
				});
			}
			else{
				  const registration = new Registration(req.body);
				  registration.save()
					.then(() => { res.redirect('./login'); })//enter for login page
					.catch((err) => {
					  console.log(err);
					  res.send('Sorry! Something went wrong.');
					});
			}
		});
    } else {
      res.render('register', {
        title: 'Registration form',
        errors: errors.array(),
        data: req.body,
      });
    }
  }
);

//action after pressing submit in sign in page------------------------------------
router.post('/login',
 (req, res) => {
	var errors=false;
	Registration.findOne({email: req.body.email, password: req.body.password}, 
	function(err, result){
	if (result){
		req.session.email = req.body.email;
		req.session.acc = result;
		req.session.accs = null;
		res.redirect('./postlogin');	
	}
	else{
		
		res.render('login', { 
			title: 'Login Page',
			errors: true,
			});
	}

    });
});

router.get('/postlogin',function(req,res){
		//res.send('progress:exist');
		if(req.session.email){
		if (req.session.acc.access){
			req.session.accs = true;
			res.redirect('./admin');
		}
		else{
			req.session.accs = false;
			res.redirect('./user');
		}
		}
});

//action to add contacts-------------------------------------------------------------
router.post('/addcon',
[
    (check('name').isLength({ min: 1 }) && check('description').isLength({ min: 1 })
	&& check('phone').isLength({ min: 1 }) && check('email').isLength({ min: 1 })
	&& check('address').isLength({ min: 1 }) && check('affiliation').isLength({ min: 1 })
      .withMessage('Name is required')),
  ],
 (req, res) => {
  const errors = validationResult(req);

    if (errors.isEmpty()) {
	  const addcontact = new Contact(req.body);
	  addcontact.save()
		.then(() => { res.redirect('./ucontacts'); })
		.catch((err) => {
		  console.log(err);
		  res.send('Sorry! Something went wrong.');
		});
    } else {
		res.redirect('./ucontacts');
    }
  }
);

//action to add items-------------------------------------------------------------
router.post('/additem', upload.single('image'),
[
    (check('name').isLength({ min: 1 }) && check('desc').isLength({ min: 1 })
	&& check('company').isLength({ min: 1 }) && check('baseunit').isLength({ min: 1 })
	&& check('baseprice').isLength({ min: 1 }) && check('category').isLength({ min: 1 })
      .withMessage('All fields are required')),
  ],
 (req, res) => {
  const errors = validationResult(req);

    if (errors.isEmpty()) {
		var obj = { 
        name: req.body.name, 
        desc: req.body.desc,
		company: req.body.company,
		baseunit: req.body.baseunit,
		baseprice: req.body.baseprice,
		category: req.body.category,
        img: { 
            data: fs.readFileSync(path.join(__dirname,'../public/images/' + req.body.image)).toString('base64'),
            contentType: 'image/jpg'
        } 
    } 
	  const additm = new Medicine(obj);
	  additm.save()
		.then(() => { res.redirect('./inventory'); })
		.catch((err) => {
		  console.log(err);
		  res.send('Sorry! Something went wrong.');
		});
    } else {
		res.redirect('./inventory');
    }
  }
);

//action for on click of underdev parts-------------------------------------------------------------
router.get('/underdev',

 (req, res) => {  
	
     res.send('IDEA STILL UNDER DEVELOPMENT');
    
});

//action to add to cart-------------------------------------------------------------
router.post('/addcart',function(req, res){
	
	var tem = String(req.body.addtocart);
	Registration.findOneAndUpdate(
   { email: req.session.email }, 
   { $push: { incart: tem  } },
  function (error, success) {
        if (error) {
            console.log(error);
        } else {
            res.redirect('./search');
        }
    });

});

//action to remove from cart-------------------------------------------------------------
router.post('/removefromcart',function(req, res){
	
	var tem = String(req.body.removecart);
	Registration.findOneAndUpdate(
   { email: req.session.email }, 
   { $pull: { incart: tem  } },
  function (error, success) {
        if (error) {
            console.log(error);
        } else {
            res.redirect('./cart');
        }
    });

});
    

//action to delete contacts-------------------------------------------------------------
router.post('/delcon',

 (req, res) => {  
	
    Contact.findOneAndRemove({name: req.body.del})
	.then((err,contacts) => { 
      res.redirect('./ucontacts');
    })
    .catch((err) => {
      console.log(err);
      res.send('Sorry! Something went wrong.');
    });
});

//action to delete registers-------------------------------------------------------------
router.post('/delreg',

 (req, res) => {  
	
    Registration.findOneAndRemove({email: req.body.del})
	.then((err,regs) => { 
      res.redirect('./registrations');
    })
    .catch((err) => {
      console.log(err);
      res.send('Sorry! Something went wrong.');
    });
});

//action to delete items-------------------------------------------------------------
router.post('/delitem',

 (req, res) => {  
	
    Medicine.findOneAndRemove({name: req.body.del})
	.then((err,regs) => { 
      res.redirect('./inventory');
    })
    .catch((err) => {
      console.log(err);
      res.send('Sorry! Something went wrong.');
    });
});

//link for list of contacts-------------------------------------------------------------
router.get('/ucontacts', (req, res) => { //for authentication of admin rights
  if(req.session.accs){
  Contact.find()
    .then((contacts) => { 
      res.render('contacts', { title: 'Contacts Page', contacts});
    })
    .catch((err) => {
      console.log(err);
      res.send('Sorry! Something went wrong.');
    });
  }
  else{
	  res.redirect('/');
  }
});


//link for list of registers-------------------------------------------------------------
router.get('/registrations', basic.check((req, res) => { //for authentication of admin rights
   if(req.session.accs){
  Registration.find()
    .then((registrations) => { //send over collection registration to index.pug
      res.render('index', { title: 'Users Page', registrations });
    })
    .catch((err) => {
      console.log(err);
      res.send('Sorry! Something went wrong.');
    });
	 }
  else{
	  res.redirect('/');
  }
}));


//link for search---------------------------------------------------
router.get('/search',(req, res) => {
	if(req.session.accs==false){
	Medicine.find()
	.then((items) => { 
      res.render('items', { title: 'Find Medicine', items });
    })
    .catch((err) => {
      console.log(err);
      res.send('Sorry! Something went wrong.');
    });
	}
  else{
	  res.redirect('/');
  }
});

//link for cart---------------------------------------------------
router.get('/cart',function(req, res) {
	if(req.session.accs==false){
	Registration.findOne({email: req.session.email}, function(error,success){
		if(error){console.log(error);}
		else{
				Medicine.find({name: {$in: success.incart}})
	.then((items) => { 
		let sum = _.reduce(items, function(memo, reading){ return memo + reading.baseprice; }, 0);
      res.render('cart', { title: 'Your Cart', items, total: sum });
    })
    .catch((err) => {
      console.log(err);
      res.send('Sorry! Something went wrong.');
    });
		}		
	}
	);
	}
  else{
	  res.redirect('/');
  }
});


//link for non logged contacts find---------------------------------------------------
router.get('/nonlogfindcontact',(req, res) => {
	if(req.session.accs!=true && req.session.accs!=false){
	Contact.find()
	.then((cons) => { 
      res.render('nonlogcontact', { title: 'Find Contacts', cons});
    })
    .catch((err) => {
      console.log(err);
      res.send('Sorry! Something went wrong.');
    });
	}
	else{
	  res.redirect('/');
  }
});

//link for contacts---------------------------------------------------
router.get('/fcontact', (req, res) => {
	if(req.session.accs==false){
	Contact.find()
	.then((cons) => { 
      res.render('fcontact', { title: 'Find Contacts', cons });
    })
    .catch((err) => {
      console.log(err);
      res.send('Sorry! Something went wrong.');
    });
	}
  else{
	  res.redirect('/');
  }
});

//link for list of inventory-------------------------------------------------------------
router.get('/inventory', basic.check((req, res) => { //for authentication of admin rights
	if(req.session.accs){
	Medicine.find()
    .then((medicines) => { 
      res.render('inventory', { title: 'Inventory Page', medicines });
    })
    .catch((err) => {
      console.log(err);
      res.send('Sorry! Something went wrong.');
    });
	}
  else{
	  res.redirect('/');
  }
}));

router.get('/logout',function(req,res){
	req.session.destroy(function(err){
		if(err){
			res.negotiate(err);
		}
		res.redirect('/');
	});
});
module.exports = router;
