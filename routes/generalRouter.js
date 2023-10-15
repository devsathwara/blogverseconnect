const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Post = require('../models/Post');
const User=require('../models/User');
const Contact = require('../models/Contact');
router.get('/', async(req, res) => {
     const posts = await Post.find();
     const category=await Category.find();
     const usersCount = await User.aggregate([
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ]);
  
      const postsCount = await Post.aggregate([
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ]);
  
      const users = usersCount.length > 0 ? usersCount[0].count : 0;
      const postCount = postsCount.length > 0 ? postsCount[0].count : 0;
    if(req.session.userId!=null){
        const userExist = await User.findOne({_id:req.session.userId});
        
        if(userExist.profilePic!=null){
            
            res.render('homepage',{ userId: req.session.userId ,post:posts,img:userExist.profilePic,userCount:users,postCount:postCount,category:category});
        }
        else{
            res.render('homepage',{ userId: req.session.userId ,post:posts,img:null,userCount:users,postCount:postCount,category:category});
        }
        
    }
    else{
        res.render('homepage',{req: req, res: res ,userId:null,post:posts,userCount:users,postCount:postCount,category:category});
    }
});

router.get('/contact', async(req, res) => {
    const userExist = await User.findOne({_id:req.session.userId});
    if(req.session.userId!=null){
        res.render('contact',{ userId: req.session.userId,msg:null,img:userExist.profilePic });
    }
    else{
        res.render('contact',{req: req, res: res,userId:null,msg:null });
    }
});
router.post('/save-query', (req, res) => {
    if (req.session.userId != null) {
        const contact = new Contact({
            firstName: req.body.FirstName,
            lastName: req.body.LastName,
            email: req.body.Email,
            phoneNo: req.body.PhoneNumber,
            Query: req.body.query
        });
        contact.save();
        res.redirect('/contact?success=true'); // Redirect to the contact page
    } else {
        const contact = new Contact({
            firstName: req.body.FirstName,
            lastName: req.body.LastName,
            email: req.body.Email,
            phoneNo: req.body.PhoneNumber,
            Query: req.body.query
        });
        contact.save();
        res.redirect('/contact?success=true'); // Redirect to the contact page
    }
});


router.get('/about', async(req, res) => {
    const userExist = await User.findOne({_id:req.session.userId});
    if(req.session.userId!=null){
        res.render('about',{ userId: req.session.userId,img:userExist.profilePic });
    }
    else{
        res.render('about',{req: req, res: res ,userId:null});
    }
});

module.exports = router;
