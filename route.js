const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const auth=require('./verifyToken')
const Adminauth=require('./AdminVerifyToken')
const Officerauth=require('./OfficerVerifyToken')
const ModelUser=require("./Model/user")
const ModelComplaint=require("./Model/complaint")
const ModelAdmin=require("./Model/admin")
const ModelOfficer=require("./Model/officer")
const multer=require("multer")

const router=express.Router()

const imageFileFilter=(req,file,callBack)=>
{
    if(file.mimetype==='image/jpeg' || file.mimetype==='image/jpg' || file.mimetype==='image/png')
    callBack(null,true);
    else
    callBack(new Error('Please Upload only jpeg and png files.'),false);
}
//Complaint Image Uploading Code...
const IMGstorage=multer.diskStorage({
    destination:(req,res,callBack)=>{
        callBack(null,'uploads')
    },
    filename:(req,file,callBack)=>{
        callBack(null,file.originalname)
    }
})

//Officer Proof Image Uploading Code...
const OfficerIMGStorage=multer.diskStorage({
    destination:(req,res,callBack)=>{
        callBack(null,'officer_proof_uploads')
    },
    filename:(req,file,callBack)=>{
        callBack(null,file.originalname)
    }
})

try
{
    var OfficerUpload = multer(
        {
            storage:OfficerIMGStorage,
            limits: {
                    fileSize:1024*1024
                    },
            fileFilter:imageFileFilter
        }
        ).single('officer_proof')
}
catch(error)
{
    console.log("My Error"+error)
    //return res.status(404).send(error)
}


try
{
    var upload = multer(
        {
            storage:IMGstorage,
            limits: {
                    fileSize:1024*1024
                    },
            fileFilter:imageFileFilter
        }
        ).single('Complaint_Image')
}
catch(error)
{
    console.log("My Error"+error)
   // return res.status(404).send(error)
}
//.......................




router.get("/check",async (req,res)=>{
    
    try
    {

        return res.status(200).send("Wow, it's working......");
    }
    catch(error)
    {
        res.status(404).send(error.message)
        console.log(error.message)
    }
})

router.post("/admlogin",async (req,res)=>{

    try
    {
        Admin=req.body
        const admin= await ModelAdmin.findOne({email:Admin.Email})
        if(!admin)
        {
            return res.send("<h2>Sorry admin does not exist...!!</h2>")
        }
        function compare(Admin_psw,admin_psw)
        {
            if(Admin_psw==admin_psw)
            return true;
            else
            return false
        }
        const isValid = await compare(Admin.Password,admin.password)
        console.log("compare ")
        if(!isValid)
        {
            res.send("Password wrong...")
        }
        else
        {
            Responce={
                email:"",
                token:""
            };
            Responce.email=Admin.Email
            Responce.token = jwt.sign({_id:admin.id},"Adminprivatekey")
            res.header('auth-token',Responce.token)
            
            return res.status(200).send(Responce)
        }
    }
    catch(error)
    {
        res.status(404).send(error.message)
        console.log(error.message)
    }
})




router.post('/complaint', function (req, res) {
    upload(req, res,async function (err)
    {
        try
        {
            console.log("hale chhe")
            if (err instanceof multer.MulterError)
            {
                if(err.code=="LIMIT_FILE_SIZE")
                {
                    res.status(413).send({err:"Please insert Only 1MB File."})
                }
            }
            else if (err)
            {
                console.log(err)
                res.status(402).send({err:"Please insert Only JPEG and PNG File."})
            }
            else
            {
                
                Complaint=req.body 
                console.log(req.file)
                ServerURL="https://onlinecms.herokuapp.com/"
                const complaint=new ModelComplaint(
                    {
                        email:Complaint.Email,
                        name:Complaint.Name,
                        landmark:Complaint.Landmark,
                        address:Complaint.Address,
                        city:Complaint.City,
                        complaint:Complaint.Complaint,
                        complaint_level:Complaint.Complaint_Level,
                        complaint_type:Complaint.Complaint_Type,
                        complaint_image:ServerURL+"uploads/"+req.file.originalname
                    }
                )
                await complaint.save((error)=>{
                    if(error)
                        return res.status(404).send(error.message)
                    else
                    {

                        console.log(complaint)
                        return res.status(200).send("Success User Added.")
                    }
                })
                
            
            }      
        }
        catch(error)
        {
            res.status(404).send(error)
        }
    })
  })


router.patch('/updatecomplaint/:id',async function (req, res) 
{
        OfficerUpload(req, res,async function (err)
        {   
            try
            {
                if (err instanceof multer.MulterError)
                {
                    if(err.code=="LIMIT_FILE_SIZE")
                    {
                        res.status(413).send({err:"Please insert Only 1MB File."})
                    }
                }
                else if (err)
                {
                    console.log(err)
                    res.status(402).send({err:"Please insert Only JPEG and PNG File."})
                }
                else
                {
                    ServerURL="https://onlinecms.herokuapp.com/"
                    Complaint=req.body 
                    
                    const filter={_id:req.params.id}
                    const update={complaint_status:Complaint.complaint_status,reason:Complaint.reason,solution:Complaint.solution,officer_proof:ServerURL+"officer_proof_uploads/"+req.file.originalname}
                    const complaint=await ModelComplaint.findOneAndUpdate(filter,update)
                    return res.status(200).send({res:"Record is updated..."})
                }      
            }
            catch(error)
            {
                res.status(404).send(error)
            }
        })
    
  })


router.get("/complaintstatus/:id",auth,async (req,res)=>{
    
    try
    {
       
        const Complaints= await ModelComplaint.find({_id:req.params.id})
        return res.status(200).send(Complaints);
    }
    catch(error)
    {
        res.status(404).send(error.message)
        console.log(error.message)
    }
})

router.get("/officercomplaintstatus/:id",Officerauth,async (req,res)=>{
    
    try
    {
       
        const Complaints= await ModelComplaint.find({_id:req.params.id})
        return res.status(200).send(Complaints);
    }
    catch(error)
    {
        res.status(404).send(error.message)
        console.log(error.message)
    }
})


router.post("/complaintregistry",Officerauth,async (req,res)=>{
    
    try
    {
        Filter=req.body
        console.log(Filter)
        const Complaints= await ModelComplaint.find({city:Filter.location,complaint_type:Filter.department})
        console.log(Complaints)
        console.log(Filter)
        return res.status(200).send(Complaints);
    }
    catch(error)
    {
        res.status(404).send(error.message)
        console.log(error.message)
    }
})



router.post("/register",async (req,res)=>{
    try
    {
        User=req.body
        const salt= await bcrypt.genSalt(10)
        const hashedPswd= await bcrypt.hash(User.Password,salt)
        ModelUser.syncIndexes()
        const user=new ModelUser(
            {
                firstname:User.FirstName,
                lastname:User.LastName,
                email:User.Email,
                password:hashedPswd,
                mobile_number:User.MobileNumber,
                address:User.Address
            }
        )
        await user.save((error)=>{
            if(error)
            {
                if(error.code==11000)
                {
                    console.log(error.code)
                    return res.status(401).send(error.message) 
                }
                else
                    return res.status(404).send(error.message)
            }        
            else
                return res.status(200).send("Success User Added.")
        })
        //res.sendFile(path.join(__dirname+'/index.html'));
        //res.redirect("index.html")
    }
    catch(error)
    {
        if(error.code==11000)
        {
            console.log(error.code)
            return res.status(401).send(error)  
        }
        else
        {
            console.log(error.code)
            return res.status(404).send(error.message)
        }
            
    }
})

router.post("/officer_register",async (req,res)=>{
    try
    {
        Officer=req.body
        console.log(Officer)
        const salt= await bcrypt.genSalt(10)
        const hashedPswd= await bcrypt.hash(Officer.Password,salt)
        ModelOfficer.syncIndexes()
        const officer=new ModelOfficer(
            {
                name:Officer.Name,
                email:Officer.Email,
                password:hashedPswd,
                mobile_number:Officer.MobileNumber,
                location:Officer.Location,
                department:Officer.Department
            }
        )
        await officer.save((error)=>{
            if(error)
                return res.status(404).send(error.message)
            else
                return res.status(200).send("Success Officer Added.")
        })
        
    }
    catch(error)
    {
        return res.status(404).send(error.message)
    }
})


router.post("/officer_login",async (req,res)=>{

    try
    {
        Officer=req.body
        const officer= await ModelOfficer.findOne({email:Officer.Email,location:Officer.Location,department:Officer.Department})
        if(!officer)
        {
            return res.send("<h2>Sorry user does not exist...!!</h2>")
        }

        const isValid = await bcrypt.compare(Officer.Password,officer.password)

        if(!isValid)
        {
            res.send("Password wrong...")
        }
        else
        {
            Responce={
                email:"",
                token:"",
                location:"",
                department:""
            };
           
            Responce.email=Officer.Email
            Responce.token = jwt.sign({_id:officer.id},"OfficerPrivateKey")
            Responce.location=officer.location
            Responce.department=officer.department
            res.header('auth-token',Responce.token)
            
            return res.status(200).send(Responce)
        }
    }
    catch(error)
    {
        res.status(404).send(error.message)
        console.log(error.message)
    }
})

router.post("/login",async (req,res)=>{

    try
    {
        User=req.body
        const user= await ModelUser.findOne({email:User.Email})
        if(!user)
        {
            return res.status(400).send("<h2>Sorry user does not exist...!!</h2>")
        }

        const isValid = await bcrypt.compare(User.Password,user.password)

        if(!isValid)
        {
            res.status(401).send("Password wrong...")
        }
        else
        {
            Responce={
                email:"",
                token:""
            };
           
            Responce.email=User.Email
            Responce.token = jwt.sign({_id:user.id},"privatekey")
            res.header('auth-token',Responce.token)
            
            return res.status(200).send(Responce)
        }
    }
    catch(error)
    {
        res.status(404).send(error.message)
        console.log(error.message)
    }
})


router.get("/dash", auth, (req,res)=>{
    return "success";
})

router.get("/admdash", Adminauth, (req,res)=>{
    return "success";
})

router.get("/officerdash", Officerauth, (req,res)=>{
    return "success";
})

router.get("/complaints/:email",auth,async (req,res)=>{
    
    try
    {

        const Complaints= await ModelComplaint.find({email:req.params.email})
        console.log(Complaints)
        return res.status(200).send(Complaints);
    }
    catch(error)
    {
        res.status(404).send(error.message)
        console.log(error.message)
    }
})


router.get("/userprofile/:email",auth,async (req,res)=>{
    
    try
    {
        const User= await ModelUser.findOne({email:req.params.email})
        return res.status(200).send(User);
    }
    catch(error)
    {
        res.status(404).send(error.message)
        console.log(error.message)
    }
})
router.get("/officergetcomplaints",Adminauth,async (req,res)=>{
    try
    {
        const Complaints= await ModelComplaint.find()
        return res.status(200).send(Complaints);
    }
    catch(error)
    {
        res.status(404).send(error.message)
        console.log(error.message)
    }
})

router.get("/users",Adminauth, async (req,res)=>{
    try
    {
        const Users= await ModelUser.find()
        return res.status(200).send(Users);
    }
    catch(error)
    {
        res.status(404).send(error.message)
        console.log(error.message)
    }
})

router.delete("/user/:id",Adminauth,async (req,res)=>{

    try
    {
        await ModelUser.deleteOne({_id:req.params.id})
        return res.status(200).send({res:"Success"})
    }
    catch(error)
    {
        res.status(404).send({error:"Record not found!..."})
    }
})


router.patch('/updateuser/:id',async function (req, res) 
{  
    try
    {
        User=req.body 
        console.log(User)
        const filter={_id:req.params.id}
        const update={firstname:User.firstname,lastname:User.lastname,mobile_number:User.mobile_number,address:User.address}
        const user=await ModelUser.findOneAndUpdate(filter,update)
        return res.status(200).send({res:"Record is updated..."})
    }
    catch(error)
    {
        res.status(404).send(error.message)
        console.log(error.message)
    }   
    
})
module.exports=router