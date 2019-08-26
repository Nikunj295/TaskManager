const sgmail = require("@sendgrid/mail");
sgmail.setApiKey(process.env.SENDKEY)

const sendWelcome =(email,name)=>{
    sgmail.send({
        to:email,
        from:"nikunjviradiya10@gmail.com",
        subject:"Welcome to TaskManager",
        text:`Welcome ${name} to place where store your activity easily`,
        html:"<html><body><h1>Welcome</h1></body></html>"
    })
}
const sendRegards =(email,name)=>{
    sgmail.send({
        to:email,
        from:"nikunjviradiya10@gmail.com",
        subject:"Thank you for using TaskManager",
        text:`Thank you for using this webapp,${name}. We would love to know your opinion on our app for making application better in future for you.`,
        html:"<html><body><textarea/></body></html>"
    })
}
module.exports={sendWelcome,sendRegards};
