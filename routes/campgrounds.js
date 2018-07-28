var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

//INDEX - show all campgrounds
router.get("/",function(req,res)
{
    //Get all camgrounds from DB and then render the file
    Campground.find({},function(err,allcampgrounds){
        if(err)
        {
            console.log(err)
        }
        else{
            
            res.render("campgrounds/index",{campgrounds: allcampgrounds , page: 'campgrounds'});
        }
        
    });
    
});

//CREATE - Add new campground to database
router.post("/",middleware.isLoggedIn,function(req,res)
{
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampGround = {name: name ,price: price, image: image , description: desc , author:author};
    //Create a new campground and save it to db
    Campground.create(newCampGround,function(err,newCreated){
        if(err)
        {
            //res.render("campgrounds/new");
            console.log(err);
        }
        else
        {
            res.redirect("/campgrounds");
        }
    });
    
});

//NEW - show form to create new campground
router.get("/new",middleware.isLoggedIn,function(req,res)
{
    res.render("campgrounds/new");
});

//SHOW : show more details about a specific campground
router.get("/:id",function(req,res){
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
        if(err || !foundCampground)
        {
            console.log(err)
            req.flash('error', 'Sorry, that campground does not exist!');
            return res.redirect('/campgrounds');
        }
        else{
            res.render("campgrounds/show",{campground: foundCampground});
        }
    });
});

//EDIT : Campground details
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

//UPDTAE : Campground details

router.put("/:id",middleware.checkCampgroundOwnership, function(req, res){
    // find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
       if(err){
           res.redirect("/campgrounds");
       } else {
           //redirect somewhere(show page)
           res.redirect("/campgrounds/" + req.params.id);
       }
    });
});

//DESTROY : campground
router.delete("/:id",middleware.checkCampgroundOwnership,function(req,res){
   Campground.findByIdAndRemove(req.params.id,function(err){
       if(err)
       {
           res.redirect("/campgrounds");
       }
       else
       {
           res.redirect("/campgrounds");
       }
   });
});

module.exports = router;