const mongoose=require('mongoose')

const clientSchema=new mongoose.Schema({
    name: { type: String, required: true },
    carteID: { type: String, required: true }, 
    field: { type: String, required: true },
    amount:{type:Number,required:true},
    solde: { type: Number,required:true},
})
const paiementSchema=new mongoose.Schema({
    date:{
        type:Date,
        default:Date.now() 

    },
    type:{
        type:String,
        enum:['breakfast','lunch','diner']
    },
    paymentId:{
        type:mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
    },
    clientList:{
        type:[clientSchema],
        default:[], 

    }
})



module.exports = mongoose.model('Paiement', paiementSchema);
