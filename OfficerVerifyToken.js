const jwt = require('jsonwebtoken')
module.exports = function(req,res,next){

    const token=req.headers.authorization.split(' ')[1]
    if(!token)
    {
        return res.status(401).send("No token found")
    }
    try
    {
        console.log("Admin token found in auth :"+token)
        jwt.verify(token,"OfficerPrivateKey")
        console.log("before next")
        next()
        console.log("after next")
    }
    catch(error)
    {
        return res.status(401).send("Invalid token")
    }
}