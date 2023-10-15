const express = require('express');
const multer = require('multer');
const path = require('path');
const userdetail = require('../models/User');
const router = express.Router();
const catdetail = require('../models/Category');
const postdetails = require('../models/Post');
const Rating = require('../models/RatingPost');
const contactdetails= require('../models/Contact');
const archivedetails= require('../models/ArchivePost')

// router.get('/',(req,res)=>{
//     res.render('home',{userId:null})
// })

router.get('/users', async (req,res)=>{
    let data = await userdetail.find();
    // console.log(data)
    res.render('users',{user:data})
})

router.get('/contactadmin',async (req,res)=>{
    let data = await contactdetails.find()
    // console.log(data)
    res.render('contactAdmin',{contact:data})
})

router.post('/delete', async(req,res)=>{
    let {email} = req.body;
    let data = await contactdetails.deleteOne({email:email})
    res.redirect('/contactAdmin')
})

router.post('/deleteUser',async(req,res)=>{
    let {email} = req.body
    let data = await userdetail.deleteOne({email:email})
    res.redirect('/users')
})

router.post('/deleteCategory', async(req,res)=>{
    let {names}= req.body;
    let data = await catdetail.deleteOne({name:names})
    res.redirect('/categoryAdmin')
})

router.post('/addCategory',async (req,res)=>{
    let {name} = req.body;
    console.log(name)
    let data = new catdetail({
        name: name
    })
    data.save();
    res.redirect('/categoryAdmin')
    console.log(data)
})

router.post('/deletepost', async(req,res)=>{
    let {postID} = req.body;
    const data = await postdetails.deleteOne({_id:postID})
    if(data){
        res.redirect('/postAdmin')
    }
   else{
    // res.render('Not Deleted')
    console.log("!deleted")
   }
})
router.post('/deletearchivepost', async(req,res)=>{
  let {postID} = req.body;
  const data = await archivedetails.deleteOne({_id:postID})
  if(data){
      res.redirect('/archive')
  }
 else{
  // res.render('Not Deleted')
  console.log("!deleted")
 }
})

// router.post('/delete',async (req,res)=>{
//     let {email} = req.body;
//     let data = await User.deleteOne({email : email})
//     res.redirect('/users')
// })

router.get('/archive',async(req,res)=>{
    const archivedata = await archivedetails.find()
    const category = await catdetail.find()
    res.render('archive',{post:archivedata, category:category})
})

router.post('/archivepost', async(req,res)=>{
    let {postID} = req.body;
    const data = await postdetails.findOne({_id:postID})
    if(data){
        const archivePost= new archivedetails({
            title: data.title,
            ops: data.ops,
            photo: data.photo,
            username: data.username,
            categories: data.categories
        })
        try {
            const savedArchivePost = await archivePost.save();
            console.log('Archive post saved:', savedArchivePost);
            const deldata = await postdetails.deleteOne({ _id: postID });
            if (deldata) {
                console.log('Post deleted from postdetails');
            }
            res.redirect('/archive');
        } catch (error) {
            console.error('Error:', error);
            res.send('Error saving or deleting post');
        }
    }
})

router.post('/archiveselected', async (req, res) => {
  const { category, month } = req.body;

  // Build a filter object based on the selected category and month
  const filter = {};

  if (category !== '0') {
    filter.categories = category;
  }

  if (month !== '000') {
    const parsedMonth = parseInt(month);
    
    // Check if the parsed month is a valid number (1 to 12 for January to December)
    if (!isNaN(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12) {
      filter.createdAt = {
        $gte: new Date(2023, parsedMonth - 1, 1, 0, 0, 0, 0), // Adjust for zero-based months
        $lt: new Date(2023, parsedMonth, 1, 0, 0, 0, 0),
      };
    } else {
      // Handle invalid month here, for example, by sending an error response.
      res.status(400).json({ error: 'Invalid month value' });
      return;
    }
  }

  try {
    const filteredPosts = await archivedetails.find(filter);
    const categoryList = await catdetail.find();

    if (filteredPosts && categoryList) {
      res.render('archive', { post: filteredPosts, category: categoryList });
    } else {
      // Send empty arrays when data is not available
      res.render('archive', { post: [], category: [] });
    }
  } catch (error) {
    console.error('Error:', error);
    res.send('Error filtering posts');
  }
});
// router.post('/postselects', async (req, res) => {
//   const { category, month } = req.body;

//   // Build a filter object based on selected category and month
//   const filter = {};

//   if (category !== '0') {
//     filter.categories = category;
//   }

//   if (month !== '000') {
//     const parsedMonth = parseInt(month);
    
//     // Check if parsedMonth is a valid number (1 to 12 for January to December)
//     if (!isNaN(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12) {
//       filter.createdAt = {
//         $gte: new Date(`${2023}-${parsedMonth}-01T00:00:00.000Z`),
//         $lt: new Date(`${2023}-${parsedMonth + 1}-01T00:00:00.000Z`),
//       };
//     } else {
//       // Handle invalid month value here, for example, by sending an error response.
//       res.status(400).json({ error: 'Invalid month value' });
//       return;
//     }
//   }

//   try {
//       const filteredPosts = await postdetails.find(filter);
//       const categoryList = await catdetail.find();
//       if (filteredPosts && categoryList) {
//         res.render('postAdmin', { post: filteredPosts, category: categoryList });
//       } else {
//         // Send empty arrays when data is not available
//         res.render('postAdmin', { post: [], category: [] });
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       res.send('Error filtering posts');
//     }      
// });















// const postdetails = async ()=>{
//     router.get('/post',(req,res)=>{
//         res.render('post',{userId:null})
//     })
// }

router.post('/postselects', async (req, res) => {
  const { category, month } = req.body;

  // Build a filter object based on the selected category and month
  const filter = {};

  if (category !== '0') {
    filter.categories = category;
  }

  if (month !== '000') {
    const parsedMonth = parseInt(month);
    
    // Check if the parsed month is a valid number (1 to 12 for January to December)
    if (!isNaN(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12) {
      filter.createdAt = {
        $gte: new Date(2023, parsedMonth - 1, 1, 0, 0, 0, 0), // Adjust for zero-based months
        $lt: new Date(2023, parsedMonth, 1, 0, 0, 0, 0),
      };
    } else {
      // Handle invalid month here, for example, by sending an error response.
      res.status(400).json({ error: 'Invalid month value' });
      return;
    }
  }

  try {
    const filteredPosts = await postdetails .find(filter);
    const categoryList = await catdetail.find();

    if (filteredPosts && categoryList) {
      res.render('postAdmin', { post: filteredPosts, category: categoryList });
    } else {
      // Send empty arrays when data is not available
      res.render('postAdmin', { post: [], category: [] });
    }
  } catch (error) {
    console.error('Error:', error);
    res.send('Error filtering posts');
  }
});
router.get('/postAdmin',async(req,res)=>{
    let data = await postdetails.find()
    const categoryList=await catdetail.find();
    res.render('postAdmin',{post:data, category: categoryList})
})
router.get('/categoryAdmin',async (req,res)=>{
    let data = await catdetail.find()
    console.log(data)
    res.render('category',{category:data})
})
// router.get('/users',(req,res)=>{
//     res.render('users')
// })
// router.get('/contact',(req,res)=>{
//     res.render('contact')
// })
module.exports = router;