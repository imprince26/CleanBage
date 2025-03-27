import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter a name"],
        trim : true,
        minlength : [3, "Name must be at least 3 characters long"],
        maxlength : [20, "Name must be at most 100 characters long"],
    },
    email: {
        type: String,
        required: [true, "Please enter an email"],
        unique: true,
        lowercase: true,
        trim : true
    },
    password: {
        type: String,
        required: true,
        minlength : [6, "Password must be at least 6 characters long"],
        select : false
    },
    pic: {
        type: String,
        default:
            "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    role:{
        type: String,
        enum: {
            values: ["admin", "user","garbage_collector"],
            message: "Role can only be 'admin', 'user' or 'garbage_collector'",
        },
        default: "user",
    }
},{
    timestamps : true
});

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


const User = mongoose.model("User", userSchema);

export default User;