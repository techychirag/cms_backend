const express=require('express')
const route = require("./route")
const bodyParser = require("body-parser");
const mongoose = require('mongoose')
const path = require('path')

const cors = require('cors')
mongoose.connect("mongodb+srv://Chirag:mystar3333@cluster0.thc18.mongodb.net/CMS_Database?retryWrites=true&w=majority",{useNewUrlParser:true,useUnifiedTopology:true}).then(
    ()=>
    {
        const app=express();
        app.use(cors())
        app.use(bodyParser.json());
        app.use(express.json())
        app.use('/uploads',express.static(__dirname + '/uploads'))
        app.use('/officer_proof_uploads',express.static(__dirname + '/officer_proof_uploads'))

        app.use(express.static(path.join(__dirname,'public')))
        app.get('*',(req,res)=>{
            res.sendFile(path.join(__dirname,'public/index.html'))
        })
        app.use("/api",route)

        app.listen(process.env.PORT || 3000,()=>{
            console.log("Server has started!...")
        })
    }
)