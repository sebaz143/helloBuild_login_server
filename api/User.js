const express = require('express');
const router = express.Router();

//mongodb User model
const User = require('./../models/User');
//password handlres
const bcrypt = require('bcrypt');
const e = require('express');

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
    }else if( !/^[a-zA-Z ]*$/.test(name) ){
        res.json({
            state: "FAILED",
            message: "Invalid name entered!"
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


module.exports = router;