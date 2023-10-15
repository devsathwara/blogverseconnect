const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const router = express.Router();
const Category = require('../models/Category');
const Post = require('../models/Post');
const Rating = require('../models/RatingPost')
const { QuillDeltaToHtmlConverter } = require('quill-delta-to-html');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/img/'); // Save uploaded files to the 'uploads' directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

router.get('/updateuser', async (req, res) => {
  if (req.session.userId != null) {
    const userExist = await User.findOne({ _id: req.session.userId });
    const category= await Category.find();
    // console.log(userExist);
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
    res.render('updateuser', { userId: req.session.userId, user: userExist, img: userExist.profilePic,userCount:userCount,postCount:postCount,category:category });
  }
  else {
    return res.redirect('/');
  }
});

router.get('/myBlogs', async (req, res) => {
  if (req.session.userId != null) {
    try {
      // const postId = req.query.postId;
      const post = await Post.find({ username: req.session.username });
      const userExist = await User.findOne({ _id: req.session.userId });
      if (post.length > 0) {
        // Render the page with posts if they exist
        res.render('myBlogs', { userId: req.session.userId, post: post, img: userExist.profilePic });
      } else {
        // Render the page with a message if no posts are found
        res.render('myBlogs', { userId: req.session.userId, post: null, img: userExist.profilePic });
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      res.redirect('/'); // Redirect to homepage or appropriate error page
    }
  }
})
router.get('/updateblog/:bid', async (req, res) => {
  // console.log(req.params.bid)
  // console.log(req.session.userId)
  if (req.session.userId != null) {
    try {
      const postExist = await Post.findOne({ _id: req.params.bid });
      const userExist = await User.findOne({ _id: req.session.userId });
      const category= await Category.find();
      if (!postExist) {
        // Handle when the post doesn't exist
        return res.redirect('/');
      }
      res.render('updateBlog', {
        userId: req.session.userId,
        post: postExist,
        img: userExist.profilePic,
        categories:category,

      });
    } catch (err) {
      // Handle database errors
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  } else {
    return res.redirect('/');
  }
});



router.get('/deleteblog/:bid', async (req, res) => {
  try {
    const blogId = req.params.bid;
    if (req.session.userId) {
      const blog = await Post.findById(blogId);
      if (blog.username === req.session.username) {
        await Post.deleteOne({ _id: blogId });

        console.log('Blog deleted successfully');
        res.redirect('/myBlogs');
      } else {
        console.log('Unauthorized to delete this blog');
        res.redirect('/');
      }
    } else {
      console.log('User is not logged in');
      res.redirect('/login');
    }
  } catch (err) {
    console.error(`Error in deleting blog: ${err}`);
    res.status(500).send('Internal Server Error')
  }
});

router.get('/single', async (req, res) => {
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
  if (req.session.userId != null) {
    try {
      const postId = req.query.postId;
      const post = await Post.findOne({ _id: postId });
      const feedbacks = await Rating.find({blogId:postId});
      // const averageRating= rating.rating/rating.length;
      const ratings = feedbacks.map((feedback) => feedback.rating);
      const totalRating = ratings.reduce((acc, rating) => acc + rating, 0);
      const averageRating = totalRating / ratings.length;
      const userExist = await User.findOne({ _id: req.session.userId });
      if (post && req.session.username != null) {
        console.log(post.title);
        res.render('single', { userId: req.session.userId, post: post, req: req, username: req.session.username, img: userExist.profilePic, userCount: userCount, postCount: postCount,category:category,rating:averageRating });
      }
      else {
        console.log('Post not found');
        res.redirect('/', { img: userExist.profilePic }); // Redirect to homepage or appropriate error page
      } 
    } catch (error) {
      console.error('Error fetching post:', error);
      res.redirect('/'); // Redirect to homepage or appropriate error page
    }
  } else {
    try {
      const postId = req.query.postId;
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
      const feedbacks = await Rating.find({blogId:postId});
      // const averageRating= rating.rating/rating.length;
      const ratings = feedbacks.map((feedback) => feedback.rating);
      const totalRating = ratings.reduce((acc, rating) => acc + rating, 0);
      const averageRating = totalRating / ratings.length;
      const post = await Post.findOne({ _id: postId });
      if (post) {
        console.log(post.title);
        res.render('single', { userId: null, post: post, username: null, userCount: userCount, postCount: postCount,rating:averageRating,req:req,category:category });
      } else {
        console.log('Post not found');
        res.redirect('/'); // Redirect to homepage or appropriate error page
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      res.redirect('/'); // Redirect to homepage or appropriate error page
    }
  }
});
router.post('/update-blog/:bid', upload.single('image'), async (req, res) => {
  try {
    const postId = req.params.bid; // Use req.params to get the post ID from the route parameter
    console.log(postId)
    const { title, ops, categories } = req.body;

    // Check if a file was uploaded and update the profile picture
    let updateFields = {};
    if (req.file) {
      const profilePic = '/img/' + req.file.filename;
      updateFields.photo = profilePic;
    }

    // Update the post's title, content, and categories
    updateFields.title = title;
    updateFields.ops = ops;
    updateFields.categories = categories.split(',');

    // Use a single findByIdAndUpdate call
    const update = await Post.findByIdAndUpdate(postId, updateFields);
    // Retrieve the updated post
    const updatedPost = await Post.findById(postId);

    console.log('Post updated successfully');
    res.status(200).send({ postId: postId, title: updatedPost.title });
  } catch (e) {
    console.error('Error updating Post:', e);
    res.redirect('/error');
  }
});

router.get('/posts/:cat', async (req, res) => {
  const catName = req.params['cat'];
  const postExist = await Post.find({ categories: catName })
  const userExist = await User.findOne({ _id: req.session.userId });
  console.log(postExist)
  if (postExist.length > 0) {
    if (req.session.userId != null) {

      res.render('categoryPost', { post: postExist, userId: req.session.userId, img: userExist.profilePic })
    }
    else {
      res.render('categoryPost', { post: postExist, userId: null, img: null })
    }
  }
  else {
    if (req.session.userId != null) {
      res.render('categoryPost', { post: null, userId: req.session.userId, img: userExist.profilePic })
    }
    else {
      res.render('categoryPost', { post: null, userId: null, img: null })
    }
  }

})


router.get('/write', async (req, res) => {
  const userExist = await User.findOne({ _id: req.session.userId });
  const category = await Category.find();
  const categories = category.map((category) => ({
    _id: category._id,
    name: category.name,
  }));
  console.log(categories)
  if (req.session.userId != null) {
    res.render('write', { userId: req.session.userId, img: userExist.profilePic, categories: categories });
  }
  else {
    return res.redirect('/');
  }
});
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
  });
});
router.post('/update-User', upload.single('image'), async (req, res) => {
  try {
    const { name, email } = req.body;
    const posts= await Post.find();
    const userId = req.session.userId; // Get the user's ID from the session
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
    // Check if a file was uploaded and update the profile picture
    if (req.file) {
      const profilePic = '/img/' + req.file.filename; // Assuming you store uploads in a "public/img" folder
      await User.findByIdAndUpdate(userId, { profilePic });
    }

    // Update other user information
    await User.findByIdAndUpdate(userId, { username: name, email });

    console.log('User updated successfully');
     res.redirect('/'); // Redirect to the homepage or another appropriate page
    //res.render('homepage', { userId: req.session.userId, post: posts, img: userExist.profilePic,userCount:userCount,postCount:postCount,category:category});
  } catch (e) {
    console.error('Error updating user:', e);
    // Handle the error (e.g., redirect to an error page)
    res.redirect('/error');
  }
});
router.get('/delete-user', async (req, res) => {
  try {
    // First, find the user by their ID and delete it
    const user = await User.findByIdAndDelete(req.session.userId);
    const feedback= await Rating.deleteMany({author: req.session.username})
    if (!user) {
      // Handle the case where the user doesn't exist
      console.log('User not found.');
      return res.redirect('/');
    }

    // Next, find all posts by the user's username and delete them
    const post = await Post.deleteMany({ username: req.session.username });
    if (!post) {
      console.log("Post not deleted")
    }
    console.log("User and posts of the user deleted");
    res.redirect('/logout');
  } catch (e) {
    console.error(`Error deleting the user and posts: ${e}`);
    res.redirect('/'); // You can redirect to an error page if needed
  }
});
router.post('/save', upload.single('image'), async (req, res) => {
  try {
    const content = JSON.parse(req.body.content);
    const title = req.body.title;
    const image = req.file;
    console.log('Request Body:', req.body);
    console.log('Selected Categories:', req.body.categories);

    // Checkboxes with the same name attribute are submitted as an array
    let selectedCategories = req.body.categories || [];
    console.log(selectedCategories)
    if (selectedCategories === null || selectedCategories === undefined) {
      selectedCategories = [];
    } else if (!Array.isArray(selectedCategories)) {
      // If it's not an array, split it
      selectedCategories = selectedCategories.split(',');
    }
    // Do something with the selected categories
    // if (selectedCategories.length > 0) {
    //   console.log('Selected categories:', selectedCategories);
    // } else {
    //   console.log('No categories selected');
    // }

    const converter = new QuillDeltaToHtmlConverter(content.ops, {});
    const htmlContent = converter.convert();

    const imagePath = image ? '/img/' + image.filename : null;
    const post = new Post({
      title: title,
      ops: htmlContent,
      photo: imagePath,
      username: req.session.username,
      categories: selectedCategories
    });

    const savedPost = await post.save();

    res.status(200).send({ postId: savedPost._id, title: savedPost.title });

  } catch (error) {
    console.error('Error saving post:', error);
    res.status(500).send('An error occurred while saving the post.');
  }
});
router.get('/rating/:bid/:author',async(req,res)=>{
  if(req.session.userId!=null){
   const bid= req.params.bid;
   const author=req.params.author;
  const userExist = await User.findOne({_id:req.session.userId});
res.render('ratingPost',{ userId: req.session.userId,msg:null,img:userExist.profilePic,bid:bid,author:author, statusMessage:null,success:false})
  }
  else{
    return res.redirect('/');
  }
})
router.post('/save-feedback', async (req, res) => {
  if (req.session.userId != null) {
    const bid = req.body.bid;
    const selectedRating = parseInt(req.body.rating);
    const feedback = req.body.feedback;
    const userExist = await User.findOne({ _id: req.session.userId });
    const post = await Post.findOne({ _id: bid });

    // Check if the user has already given feedback for this post
    const existingRating = await Rating.findOne({
      blogId: post._id,
      userId: userExist._id,
    });

    if (existingRating) {
      // User has already given feedback, set a flag
      const alreadyRated = true;
      const author=req.params.author;
      // Pass the flag and status message to the frontend
      res.render('ratingPost', {userId: req.session.userId,msg:null,img:userExist.profilePic,bid:bid,author:author,
        statusMessage: 'You have already given feedback for this post.', success:true
      });
    } else {
      const ratingPost = new Rating({
        blogId: post._id,
        userId: userExist._id,
        username: req.session.username,
        author: post.username,
        rating: selectedRating,
        feedback: feedback,
      });

      const savedRating = await ratingPost.save();

      if (savedRating) {
        res.redirect('/');
      }
    }
  } else {
    return res.redirect('/');
  }
});
router.get('/feedbacks',async(req,res)=>{
  if(req.session.userId!=null){
    const userExist = await User.findOne({_id:req.session.userId});
    const feedbacks = await Rating.find({author:req.session.username}).populate('blogId');
    res.render('feedbacks',{ userId: req.session.userId,msg:null,img:userExist.profilePic,feedbacks:feedbacks });
    }else{
      return res.redirect('/');
    }
});
router.post('/delete-feedback',async(req,res)=>{
    const bid=req.body.feedbackId;
    const rating=await Rating.findByIdAndDelete(bid);
  // await rating.remove();
    res.redirect('/feedbacks');
})
module.exports = router;
