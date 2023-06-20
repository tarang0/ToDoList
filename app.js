//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const _ = require('lodash');
// Load the core build.
var lodashCore = require('lodash/core');
// Load the FP build for immutable auto-curried iteratee-first data-last methods.
var fp = require('lodash/fp');
// Load method categories.
var array = require('lodash/array');
var object = require('lodash/fp/object');
const mongoose=require("mongoose");
mongoose.set("strictQuery", true);
mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true,useUnifiedTopology:true})

const itemsSchema=new mongoose.Schema({
  name:String
});
const Item=mongoose.model("Item",itemsSchema);

const listSchema=new mongoose.Schema({
  name:String,
  items:[itemsSchema]
});
const List=mongoose.model("List",listSchema);

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
const item1=new Item({
  name:"first item.Welcome!"
});
const item2=new Item({
  name:"soo..i love y'all!"
});
const item3=new Item({
  name:"ADD MORE ITEMS"
});
const defaultItems=[item1,item2,item3];

// Item.insertMany(defaultItems).then(function(){
//     console.log("Default data added");
//   }).catch(function (err){
//     console.log(err);
//   });
app.get("/", function(req, res) {
  Item.find().then(function(result,err){
      console.log(result);
      if(result.length==0)
      {
          Item.insertMany(defaultItems).then(function(){
            console.log("Default data added");
          }).catch(function (err){
            console.log(err);
          });
          res.redirect("/");
      }
      else
      {
        res.render("list", {listTitle: "Today", newListItems: result});
      }
    }).catch(function (err){
      console.log(err);
    });
  
// const day = date.getDate();


});

app.post("/", async(req, res)=>{

  const NewItem=new Item({
    name:req.body.newItem
  })
  const listname=req.body.list;

  if(listname=="Today")
  {
    NewItem.save();
    res.redirect("/");
  }
  else
  {
    const foundlist=await List.findOne({name:listname}).exec();
    foundlist.items.push(NewItem);
    foundlist.save();
    
    res.redirect("/"+listname);
    // console.log("other list");
  }
  // const item = req.body.newItem;
  
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete",async(req,res) =>{
  const ListName=req.body.ListName;
  const id=req.body.check;
  console.log(ListName);
  console.log(id);
  if(ListName=="Today")
  {
    console.log("default list");
    await Item.deleteOne({_id:id});
    res.redirect("/");
  } 
  else
  {
    await List.updateOne({name:ListName},{$pull:{items:{_id:id}}});
    res.redirect("/"+ListName);
    // console.log("other list")
  }
});

app.get("/:newlistname", async(req,res) =>{
  const customListName=_.capitalize(req.params.newlistname);
  let newlist=await List.findOne({name:customListName}).exec();
  // console.log(newlist.length);
  if (!newlist)
  {
    console.log("list not found");
    const newlist= new List({
      name:customListName,
      items:defaultItems
    });

    newlist.save();
    res.redirect("/"+customListName);
  }
  else
  {
    res.render("list", {listTitle: newlist.name, newListItems:newlist.items });

  }
  
});


// app.get("/about", function(req, res){
//   res.render("about");
// });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
