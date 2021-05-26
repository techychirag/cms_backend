const jwt = require('jsonwebtoken')
module.exports = function(req,res,next){

    const token=req.headers.authorization.split(' ')[1]
    if(!token)
    {
        return res.status(401).send("No token found")
    }
    try
    {
        console.log("User token found in auth :"+token)
        jwt.verify(token,"privatekey")
        next()
    }
    catch(error)
    {
        return res.status(401).send("Invalid token")
    }
}