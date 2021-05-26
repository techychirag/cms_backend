const mongoose=require('mongoose')

try
{
    const schema = mongoose.Schema(
        {
            email:
            {
                type:String,
                require:true,
                minlength:5,
                unique:true
            },
            password:
            {
                type:String,
                require:true
            }
        },
        {
            timestamps:true
        }
    )                            //give collection name...
    module.exports = mongoose.model("admins",schema)
}
catch(error)
{
    res.status(404).send(error)
    console.log(error)
}