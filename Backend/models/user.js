//Schema
const mongoose = require("mongoose");

const validator = require("validator");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const crypto = require("crypto");

//creating user schema

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true,"Please enter your name"],
        maxlength:[30,"Name cannot exceed 30 characters"]
    },
email:{
    type: String,
    required:[true,"Please, enter emailid"],
    unique:true,
    lowercase:true,
    validate:[validator.isEmail,"Enter valid email"]
},
password:{
    type:String,
    required:[true,"Enter password"],
    minlength:8,
    select:false
},
passwordConfirm:{
    type:String,
    required:[true,"Confirm password"],
    validate:{
        validator: function(el){
            return el === this.password
        },
        message: "Passwords are not same"
    }
},
phoneNumber:{
    type:String,
    required:true,
    match: [/^[0-9]{10}$/,   "Enter Valid Phone Number"]
},
role:{
    type:String,
    enum:["user","admin"],
    default: "user"
},
avatar:{
    public_id:String,
    url: String,
},
passwordChangedAt: Date,
passwordResetToken:String,
passwordResetExpires:Date
},
{timestamps:true}
);



//hash password
//pre("save") => runs before data is saved

userSchema.pre("save", async function(){
    if(!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined
})

//pass compare
userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword,userPassword)
    
}

//checks whether the user's password was changed after getting jwt token
//if yes, the old token is invalid and user must login in again
userSchema.methods.changedPasswordAfter= function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime()/1000, 10
        )
        return JWTTimestamp < changedTimestamp
    }
    return false;
}

//custom method to generate jwt token
userSchema.methods.getJWTToken = function () {
  console.log("ExpiresIn =", process.env.JWT_EXPIRES_TIME);

  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    {
      expiresIn: "90d",
    }
  );
};




// PASSWORD RESET TOKEN
userSchema.methods.createPasswordResetToken = function () {

  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
module.exports = mongoose.model("User", userSchema)
