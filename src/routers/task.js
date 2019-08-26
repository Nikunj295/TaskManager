const Task = require("../model/task"); 
const express = require("express");
const router= new express.Router();
const auth = require("../middleware/auth");

router.get("/task",auth,async(req,res)=>{
    try{
        const match ={}
        const sort={}
        if(req.query.completed){
            match.completed=req.query.completed==='true'
        }
        if(req.query.sortBy){
            const parts= req.query.sortBy.split(":")
            sort[parts[0]]=parts[1]==='desc'?-1:1
        }

        
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks);
    }
    catch(e){
        res.status(400).send()
        console.log(e)
    }
})
router.post("/task",auth, async (req,res)=>{
    const task= new Task({
        ...req.body,
        userId: req.user._id
    });
    try{
        await task.save()
        res.status(201).send(task)
    }
    catch(e){
        res.status(400).send()
    }
})

router.patch("/task/:id",auth,async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdated=['description','completed'];
    const validd = updates.every((update)=>{
        return allowedUpdated.includes(update)
    })
    if(!validd){
        return res.status(400).send({error:"Error"})
    }
    const _id = (req.params.id);
    try{
        const task = await Task.findOne({_id,userId:req.user._id})
        if(!task){
            return res.status(404).send()
        }
        updates.forEach((update)=>{
            task[updates]=req.body[updates];
        })
        await task.save();
        
        res.status(200).send(task);
    }
    catch(e){
        res.status(400).send()
    }
})

router.get("/task/:id",auth,async (req,res)=>{
    const _id = (req.params.id);
    try{
        const task= await Task.findOne({_id,userId: req.user._id});
        if(!task){
            return res.status(400).send();
        }
        res.status(200).send(task);
    }
    catch(e){
        res.status(400).send()
    }
})


router.delete("/task/:id",async(req,res)=>{
    const _id =(req.params.id);
    try{
        const task = await Task.findOneAndDelete({_id,userId:req.user._id})
        if(!task){
            return res.status(404).send();
        }
        res.send(task);

    }
    catch(e){
        res.status(400).send();
    }
});


module.exports=router;