const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task")
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true   
    },
    email:{
        type:String,
        unique:true,
        reqiured:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
               throw new Error("Invalid Email") 
            }
        }
    },
    password:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        validate(value){
            if(value<0){
                throw new Error("Negative age")
            }
        }
    },
    avatar:{
        type: Buffer
    }
    ,
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
},{
    timestamps:true
});
userSchema.methods.toJSON= function(){
    const user =this;
    const userObject =user.toObject();

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject;
}

userSchema.methods.genAuthToken = async function(){
    const user = this;
    const token = jwt.sign({_id: user._id.toString()},process.env.JWTTOKEN)
    user.tokens=user.tokens.concat({token});
    await user.save();
    return token;
}

userSchema.statics.findByCredentials = async (email,password)=>{
    const user = await User.findOne({email});
    if(!user){
        throw new Error('Unable to Login');
    }
    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
        throw new Error("Unable to Login");
    }
    return user;
}

userSchema.virtual('tasks',{
    ref: 'Task',
    localField: '_id',
    foreignField:'userId'
})

userSchema.pre('save',async function(next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }
    next()
})
userSchema.pre('remove',async function(next){
    const user = this
    await Task.deleteMany({userId: user._id})
    next()
})

const User = mongoose.model("User",userSchema)

module.exports= User