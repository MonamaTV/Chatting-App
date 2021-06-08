const users = require("../models/User");
const bcrypt = require("bcrypt");
const { generateToken } = require("../helpers/generateToken");
const tokens = require("../models/Token");
const sendEmail = require("../helpers/sendEmail");

const loginUser = async (email, password) => {

    if(!email || !password) return {
        message: "Invalid input",
        success: false
    }

    const dbemail = email;
    try {
        const user = await users.findOne({email: dbemail});
    
        if(!user) return {
            message: "Account does not exits",
            success: false
        }

        //compare password
        const validPasswords = await bcrypt.compare(password, user.password);

        if(!validPasswords) return {
            message: "Email and passwords do not match",
            success: false
        };
        
        const { username, email } = user._doc;
        
        return {
            username,
            email,
            success: true,
            message: "User logged in"
        };
    } catch (error) {
        
        return {
            message: "Something went wrong😪",
            success: false
        }
    }
};

const registerUser = async (username, email, password) => {

    if(!username || !email || !password) return {
        message: "Invalid input",
        success: false
    }

   try {
        const userdb = await users.findOne({email: email});

        if(userdb) return {
            message: "User already exists",
            success: false
        };

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new users({
            username,
            email,
            password: hashedPassword
        })

        const saved = await user.save();
        return {
            message: "User registered",
            success: true,
            username: saved.username,
            email: saved.email
        }
   } catch (error) {
       return {
           message: "Failed to register",
           success: false
       }
   }
};

const resetUserPassword =  async (email) => {
    if(!email) {
        return {
            message: "Invalid inputs",
            success: false
        }
    }
    try {
        const userExists = await users.findOne({email: email});
        
        if(!userExists) return {
            message: "User does not exit. Cannot reset password",
            success: false
        }
        const token = generateToken();
        const newToken = new tokens({
            token,
            email
        });

        const subject = "Password Reset Token";

        const text = `
        Hello ${"userExists.username"}, you have requested to change your password on ChatTV. \n
        Please copy the code
        code: ${"token"}\n
        If you did not request this email, please you can ignore it. \n
        Kind regards
        ChatTV team`;

        const results = await sendEmail(email, subject, text);
        console.log(results)
        if(results.success) {
            await newToken.save();
            return {
                message: "Email is sent",
                success: true
            }
        }

        return {
            message: "Email is not sent",
            success: false
        }

    } catch (error) {
        console.log(error)
        return {
            message: "Failed to send email",
            success: false
        }
    }
}

const confirmUserToken =  async (email, token) => {
    if(!email || !token) return {
        message: "Invalid inputs",
        success: false
    }

    try {
        const token = await tokens.findOneAndDelete({email: email, token: token});
        if(!token) return {
            message: "Invalid token request",
            success: false
        }

        return {
            message: "User can change passwords",
            success: true
        }

    } catch (error) {
        return {
            message: "Failed to validate token",
            success: false
        }
    }
}

const changeUserPassword = async (email, newPassword) => {
    if(!email || !newPassword) return {
        message: "User provided invalid details",
        success: false
    }

    try {
        const userExists = await users.findOne({email: email});

        if(!userExists) return {
            message: "User does not exist",
            success: false
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const updatedPassword = await userExists.updateOne({
            "$set": {
                password: hashedPassword
            }
        });

        if(updatedPassword.modified === 1) return {
            message: "Password has been changed",
            success: false
        }

        return {
            message: "Failed to change your password",
            success: false
        }

    } catch (error) {
        return {
            message: "Failed to change your password",
            success: false
        }
    }
}


module.exports = {
    loginUser,
    registerUser,
    resetUserPassword,
    confirmUserToken,
    changeUserPassword
}