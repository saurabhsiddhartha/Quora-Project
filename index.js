const express = require("express");
const { v4: uuidv4 } = require('uuid');
const methodOverride = require('method-override');
const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const path = require("path");

const app = express();
app.use(methodOverride('_method'));

const port = 8080;

//--connection-of-DB
const connection = mysql.createConnection({
      host : 'localhost',
      port: 3306,
      user : 'root',
      password:'root@123',
      database:'quora'
  });
  

  let getRandomUser = ()=>{
    let post = 'Hello';
    return [
      faker.string.uuid(),
      faker.internet.userName(),
      faker.internet.email(),
      faker.internet.password(),
      post
    ];
  }

//---for parse data--//
app.use(express.urlencoded({extended : true}));
app.use(express.json());

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.static(path.join(__dirname,"public")))
//-----------------//


//--------API-------//
//-----index-API----//
app.get("/",(req,res)=>{
    let q = `select count(*) from user`;
    try {
      connection.query(q,(err,result)=>{
        if(err){
          throw err;
        }
        let count = result[0]['count(*)'];
        res.render("home.ejs",{count});
        console.log(result);
    });
    } catch (error) {
      console.log(error);
      res.send("Some error in DB");
    }
  });

  app.get("/posts",(req,res)=>{
    let q = `SELECT * FROM user`;
    try {
      connection.query(q,(err,result)=>{
        if(err){
          throw err;
        }
        res.render("index.ejs",{result});
        ///console.log(result);
      });
      } catch (error) {
        console.log(error);
        res.send("Some error in DB");
      }
  });
  

//-----Creat-post-----
app.get("/posts/new",(req,res)=>{
    res.render("new.ejs");
  });
  app.post("/posts",(req,res)=>{
    let{username,email,password,content}=req.body;
    let id = uuidv4();
    let q = "INSERT INTO user (id, username, email, password,post) VALUES (?,?,?,?,?);";
    let newdata = [id,username,email,password,content];
  
    try {
      connection.query(q,newdata,(err,result)=>{
        if(err){
          throw err;
        }
        console.log(result);
        res.redirect("/posts");
      });
    } catch (error) {
      console.log(error);
      res.send("some error in DB");
    }
  });

//------Read-post-----
app.get("/posts/:id",(req,res)=>{
  let {id} = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;
  try {
    connection.query(q,(err,result)=>{
      if(err){
        throw err;
      }
      let user = result[0];
      res.render("show.ejs",{user});
    });
    } catch (error) {
      console.log(error);
      res.send("Some error in DB");
    }
});

//-------update------
app.get("/posts/:id/edit",(req,res)=>{
    let {id} = req.params;
    let q = `SELECT * FROM user WHERE id='${id}'`;
    try {
    connection.query(q,(err,result)=>{
      if(err){
        throw err;
      }
      let user = result[0];
      res.render("edit.ejs",{user});
    });
    } catch (error) {
      console.log(error);
      res.send("Some error in DB");
    }
});

app.patch("/posts/:id",(req,res)=>{
    let {id} = req.params;
    let {password,content} = req.body;

  let q = `SELECT * FROM user WHERE id='${id}'`;
  try {
    connection.query(q,(err,result)=>{
      if(err){
        throw err;
      }
      let user = result[0];
      if(password===user.password){
        let q2 = `UPDATE user SET post = '${content}' WHERE id='${id}'`;
        connection.query(q2,(err,result)=>{
          if(err){
            throw err;
          }
          res.redirect("/posts");
        });
      }else{
        res.send("you enter wrong pass");
      }
    });
    } catch (error) {
      console.log(error);
      res.send("Some error in DB");
    }
});
//---update-upvote-downvote-
app.post("/posts/:id/upvote", (req, res) => {
  const { id } = req.params;
  const q = `UPDATE user SET upvote = upvote + 1 WHERE id = '${id}'`;
  connection.query(q, (err, result) => {
      if (err) {
          res.send({ success: false, message: 'Error updating upvote count' });
      } else {
          res.redirect("/posts");
      }
  });
});

app.post("/posts/:id/downvote", (req, res) => {
  const { id } = req.params;
  const q = `UPDATE user SET downvote = downvote + 1 WHERE id = '${id}'`;
  connection.query(q, (err, result) => {
      if (err) {
          res.send({ success: false, message: 'Error updating downvote count' });
      } else {
          res.redirect("/posts");
      }
  });
});
//--Delet-route
app.get("/posts/:id/delete",(req,res)=>{
  let {id} = req.params;
  res.render("delete.ejs",{id});
});
app.delete("/posts/:id", (req,res)=>{
  let {id} = req.params;
  let {password}= req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;
  try {
    connection.query(q,(err,result)=>{
      if(err){
        throw err;
      }
      let user = result[0];
      if(password===user.password){
        let q2 = `DELETE FROM user WHERE id='${id}'`;
        connection.query(q2,(err,result)=>{
          if(err){
            throw err;
          }
          res.redirect("/posts");
        });
      }else{
        res.send("you enter wrong pass");
      }
    });
    } catch (error) {
      console.log(error);
      res.send("Some error in DB");
    }
});

app.listen(port,()=>{
    console.log(`app is listening on the port ${port}`);
});