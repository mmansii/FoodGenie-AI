const mongoose = require("mongoose")

const foodSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true,"Please enter Food Item name"],
        trim: true,
        maxLength:[100, "Food Item name cannot exceed 100 characters"]
    },
    price:{
        type:Number,
        required:[true,"Please enter Price"],
        maxLength:[5,"Price cannot exceed 5 characters"],
        default:0.0
    },
    description:{
        type:String,
        required:[true,"Please enter Description"]
    },
    ratings:{
        type:Number,
        default:0
    },
    images:[
        {
            public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                required:true
            }
        }
    ],
    menu : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Menu"
    },
    stock:{
        type:Number,
        required:[true,"Please enter food item stock"],
        maxLength:[5,"Stock cannot exceed 5 characters"],
        default:0
    },
    restaurant:{
         type:mongoose.Schema.Types.ObjectId,
         ref:"Restaurant"
},
numOfReviews:{
    type:Number,
    default:0
},
 reviews:[
        {
            name:{
                type:String,
                required:true
            },
            rating:{
                type:Number,
                required:true,
            },
            Comment:{
                type:String,
                required:true
            }
        }
    ],


    aiDescription: {
    type: String,
    default: "",
  },
  aiTags: {
    type: [String],
    default: [],
  },
  aiAllergens: {
    type: [String],
    default: [],
  },

  aiServes: {
  type: String,
  default: ""
  },

  aiBestFor: {
  type: [String],
  default: []
  },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    })

    module.exports = mongoose.model("FoodItem",foodSchema)
    //fooditems collection gets created in mongodb