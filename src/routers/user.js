const express = require("express");
const router= new express.Router();
const User = require("../model/user");
const auth = require("../middleware/auth");
const multer = require("multer")
const { sendWelcome } = require("../emails/acc");
const { sendRegards } = require("../emails/acc");
//const sharp = require('sharp')
const upload=multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return  cb(new Error('File must be jpg|jpeg|png'))
        }
        cb(undefined,true)
        //cb(undefined,false)
    }
})

router.post('/users/me/upload',auth,upload.single('avatar'),async (req,res)=>{
    // const buff = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    // req.user.avatar=buffer 
    req.user.avatar =req.file.buffer
    await req.user.save();
    res.status(200).send();
},(err,req,res,next )=>{
    res.status(400).send({ Error: err});
})
router.delete('/users/me/upload',auth,upload.single('avatar'),async (req,res)=>{
    req.user.avatar =undefined
    await req.user.save();
    res.status(200).send();
})

router.post("/users/signup", async (req,res)=>{
    const user = new User(req.body);
    try{
        await user.save()
        sendWelcome(user.email,user.name);
        const token = await user.genAuthToken();
        res.status(201).send({user,token});
    }
    catch(e){
        res.status(404).send(e);
        console.log(e);
    }
})


router.post('/users/login',async (req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password);
        const token = await user.genAuthToken();
        res.send({user,token});
    }
    catch(e){
        res.status(400).send(e);
        console.log(e)
    }
})

router.post('/users/logout',auth,async (req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token!==req.token;
        })
        await req.user.save()
        res.send();
    }
    catch(e){
        res.status(500).send(e);
        console.log(e);
    }
})

router.post('/users/logoutAll',auth,async (req,res)=>{
    try{
        req.user.tokens=[]
        await req.user.save();
        res.status(200).send();
    }catch(e){
        res.status(500).send(e);
    }
})

router.get("/users/me",auth,async (req, res)=>{
    res.send(req.user);
})

router.patch("/users/me",auth,async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdated=['name',"email","password","age"]
    const validd = updates.every((update)=>{
        return allowedUpdated.includes(update)
    })
    if(!validd){
        return res.status(400).send({error:"Error"})
    }
    
    try{ 
        updates.forEach((update)=>{
            req.user[updates]=req.body[updates];
        })
        await req.user.save();
        //const user = await User.findByIdAndUpdate(_id,req.body,{new:true,runValidators:true})
        
        res.status(200).send(req.user);
    }
    catch(e){
        res.status(400).send()
    }
})

router.delete("/users/me",auth,async(req,res)=>{
    try{
        sendRegards(req.user.email,req.user.name)
        await req.user.remove();
        res.send(req.user);
    }
    catch(e){
        res.status(400).send();
        console.log(e)
    }
});

router.get('/users/:id/avatar',async(req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar);
    }
    catch(e){res.status(404).send();}
})

module.exports=router