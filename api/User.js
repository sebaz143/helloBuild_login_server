const querystring = require('querystring');
const jwt = require('jsonwebtoken');
const get = require('lodash');
const axios = require("axios");
const request = require('superagent')
//import cookieParser from "cookie-parser";



const GITHUB_CLIENT_ID = "69207c6a2d88d1fde5e3";
const GITHUB_CLIENT_SECRET = "1faac56d3ae5bed1a310b1824c9910ac3ddef49c";
const secret = "123456789";
const COOKIE_NAME = "github-jwt";

const express = require('express');
const router = express.Router();

//mongodb User model
const User = require('./../models/User');
//password handlres
const bcrypt = require('bcrypt');
const e = require('express');

function getGitHubUserRepos(code){
    //return axios
    //.get("https://api.github.com/user", {
    //    headers: { Authorization: `Bearer ${accessToken}` },
    //})
    //.then((res) => res.data)
    //.catch((error) => {
    //    console.error(`Error getting user from GitHub`);
    //    throw error;
    //});
}

//test_hello world
router.get('/',(req,res) => {
    console.log("Hola Mundo")

    res.json({
        state: "SUCCESS",
        message: "Hola!"
    })
})

//signup
router.post('/signup',(req,res) => {
    let {name, email, password, gitHubUser} = req.body
    name = name.trim();
    email = email.trim();
    password = password.trim();
    gitHubUser = gitHubUser.trim();

    if(name=='' || email=='' || password=='' || gitHubUser=='') {
        res.json({
            state: "FAILED",
            message: "Empty input fields!"
        })
    }else if( !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email) ){
        res.json({
            state: "FAILED",
            message: "Invalid email entered!"
        })
    }else if(password.length < 8){
        res.json({
            state: "FAILED",
            message: "Password too short!"
        })
    }else{
        User.find({email}).then(result => {
            if(result.length){
                res.json({
                    status:"FAILED",
                    message:"User already exists."
                })
            }else{
                const saltRound = 6;
                bcrypt.hash(password, saltRound).then(hashedPassword =>{
                    const newUser = new User({
                        name,
                        email,
                        password: hashedPassword,
                        gitHubUser,
                    });

                    newUser.save().then(result=>{
                        res.json({
                            status:"SUCCESS",
                            message:"User created.",
                            data: result,
                        })
                    })
                    .catch(err=>{
                        res.json({
                            status:"FAILED",
                            message:"Could not create user."
                        })
                    })
                })
                .catch(err =>{
                    res.json({
                        status:"FAILED",
                        message:"An error occured while hashing the password."
                    })
                })
            }
        }).catch(err=>{
            console.log(err)
            res.json({
                status:"FAILED",
                message:"An error occured while checking the singup user in database."
            })
        })
    }

})

//signin
router.post('/login',(req,res) => {
    let {email, password} = req.body
    email = email.trim();
    password = password.trim();

    if(email == '' || password == ''){
        res.json({
            status:"FAILED",
            message:"Empty credentials." 
        });
    }else{
        User.find({email})
        .then(data=>{
            if (data.length){
                const hashedPassword = data[0].password;
                bcrypt.compare(password, hashedPassword)
                .then(result =>{
                    if(result){
                        res.json({
                            status:"SUCCESS",
                            message:"Signin successful",
                            data: data
                        })
                    }else{
                        res.json({
                            status:"FAILED",
                            message:"Incorrect password"
                        })
                    }
                })
                .catch(err =>{
                    console.log(err)

                    res.json({
                        status:"FAILED",
                        message:"error comparing password"
                    })
                })
            }else{
                res.json({
                    status:"FAILED",
                    message:"Invalid credentials entered"
                })
            }
        })
        .catch(err =>{
            console.log(err);
            res.json({
                status:"FAILED",
                message:"User does not exist"
            });
        })
    }

})

//get user likes
router.get('/likes/:email',(req,res) => {
    
    const email = req.params.email;
    console.log("likes de los usuarios");

    User.find({"email":email}).then(data => {
        if(data.length){
            res.json({
                status:"SUCCESS",
                message:"Signin successful",
                data: data
            });
        }else{
            res.json({
                status:"FAILED",
                message:"User does not exists."
            })
        }
    }).catch(err=>{
        console.log(err)
        res.json({
            status:"FAILED",
            message:"An error occured while getting the users likes."
        })
    })
    

})

//add likes
router.put('/likes',(req,res) => {
    let {email,likes} = req.body
    
    
    email = email.trim();
    

    if(email=='') {
        res.json({
            state: "FAILED",
            message: "Empty input fields!"
        })
    }else{

        User.find({email}).then(result => {
            if(result.length){
                User.updateOne({"email":email},{$set: { "likes" : likes}})
                .then(data =>{
                    res.json({
                        status:"SUCCESS",
                        message:"Signin successful",
                        data: data
                    });
                })
                .catch(err =>{
                    console.log(err)
                    res.json({
                        status:"FAILED",
                        message:"An error occured while updating the user's likes in the database."
                    });
                })
            }else{
                res.json({
                    status:"FAILED",
                    message:"User does not exists."
                })
            }
        }).catch(err=>{
            console.log(err)
            res.json({
                status:"FAILED",
                message:"An error occured while finding the user's likes in the database for updating."
            })
        })
    }

})

//github call back
router.get("/oauth/github", async (req, res) => {

    const {query} = req;
    const {code} = query;
    let githubToken;
    
    if (!code) {
        res.send({
            succes: false,
            message:'Error: no code'
        })
    }else{
        // callback
        githubToken = await request
        .post('https://github.com/login/oauth/access_token')
        .send({ client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET,scope:"user%20public_repo%20repo", code:code }) // sends a JSON post body
        .set('Accept', 'application/json')
        .then(function(result){
            const data = result.body;
            return data;
        })
    }

    console.log(githubToken.access_token);

    //const token = jwt.sign(githubToken.access_token, secret);

    res.cookie(COOKIE_NAME, githubToken.access_token, {
        httpOnly: false,
        domain: "localhost",
    });

    res.redirect(`http://localhost:3000/dashboard`);
    
});

module.exports = router;