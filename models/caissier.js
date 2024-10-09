const mongoose=require('mongoose')
const caissierSchema=new mongoose.Schema({
    username:{type:String,required:true,unique:true},
    passwordHashed:{type:String,required:true},
})


module.exports=mongoose.model('Caissier',caissierSchema)