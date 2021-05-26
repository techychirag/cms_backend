const mongoose=require('mongoose')

try
{
    const schema = mongoose.Schema(
        {
            firstname:
            {
                type:String,
                require:true,
                minlength:2
            },
            lastname:
            {
                type:String,
                require:true,
                minlength:2
            },
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
                minlength:5,
                require:true
            },
            mobile_number:
            {
                type:Number,
                minlength:10,
                require:true,
            },
            address:
            {
                type:String,
                require:true
            },
        },
        {
            timestamps:true
        }
    )                            //give collection name...
    module.exports = mongoose.model("users",schema)
}
catch(error)
{
    res.status(404).send(error)
    console.log(error)
}