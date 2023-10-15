const express = require('express');
const bcrypt = require('bcrypt');
const Category = require('../models/Category');
const Post = require('../models/Post');
// const session = require('express-session');
// const mongoDBsession = require('connect-mongodb-session')(session);
const User=require('../models/User');
const { json } = require('body-parser');
const router = express.Router();

// router.get('/fetch-user', async(req,res)=>{
//      const users = await User.find({});
//      res.json(users);

// })
// Assuming you have Express.js and EJS set up
router.get('/login', (req, res) => {
    res.render('login',{message:null,req: req, res: res,userId:null });
});

// Assuming you have Express.js and EJS set up
router.get('/register', (req, res) => {
    res.render('register',{message:null,req: req, res: res ,userId:null});
});

router.post('/save-user',async(req,res)=>{
    const {name,email,password}=req.body;
    const UserExist = await User.findOne({email:email})
    if(UserExist==null){
        const user= new User({
            email:email,
            username:name,
            password:await bcrypt.hash(password,10)
         })
         await user.save();
        //  console.log("Session Id",req.session);
         res.render('login',{message:'Register Successfull!! Please login now!!',userId:null})
    }
    else{
        res.render('login',{message:'Your Credential exist Please login now!!',userId:null})
    }
})
// router.post('/auth',async(req,res)=>{
//     const {email,password}= req.body;
//     if(email=="admin@gmail.com"&&password=="admin"){
//         req.session.username = "admin";
//         res.render('adminPage',{userId:req.session.username})
//     }
//     const userExist = await User.findOne({email:email});
//     const posts = await Post.find();
//     // console.log(userExist);
//     if(userExist){
//         // console.log(userExist);
//         const isPasswordvalid = await bcrypt.compare(password,userExist.password);
//         if(isPasswordvalid && userExist.profilePic!=null){
//             console.log(userExist);
//             req.session.userId = userExist._id;
//             // console.log(req.session.userId);
//             // console.log(req.session.username);
//             req.session.username = userExist.username;
//            res.render('homepage',{userId:req.session.userId,post:posts,img:null})
//         }
//         if(isPasswordvalid && userExist.profilePic==null){
//             req.session.userId = userExist._id;
//             req.session.username = userExist.username;
//            res.render('homepage',{userId:req.session.userId,post:posts,img:null})
//         }
//         else{
//             // res.json({message:'wrong password'})
//             res.render('login',{message:'wrong password',userId:null})
//         }
//     }
//     else{
//         // res.json({message:'user doesnt exist'})
//         res.render('register',{message:'user doesnt exist! Please Register Now',userId:null})
//     }
// })
router.post('/auth', async (req, res) => {
    const { email, password } = req.body;
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
    
      const userCount = usersCount.length > 0 ? usersCount[0].count : 0;
      const postCount = postsCount.length > 0 ? postsCount[0].count : 0;
    if (email === "admin@gmail.com" && password === "admin") {
        req.session.username = "admin";
        return res.render('adminPage', { userId: req.session.username });
    }

    const userExist = await User.findOne({ email: email });
    const posts = await Post.find();

    if (userExist) {
        const isPasswordValid = await bcrypt.compare(password, userExist.password);
        
        if (isPasswordValid) {
            req.session.userId = userExist._id;
            req.session.username = userExist.username;
            return res.render('homepage', { userId: req.session.userId, post: posts, img: userExist.profilePic,userCount:userCount,postCount:postCount,category:category});
        } else {
            return res.render('login', { message: 'Wrong password', userId: null });
        }
    } else {
        return res.render('register', { message: 'User doesnt exist! Please Register Now', userId: null });
    }
});


module.exports = router;
