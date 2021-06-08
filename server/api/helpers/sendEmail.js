const nodemailer = require("nodemailer");

const sendEmail = async (sendTo, subject, text) => {

    
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            pass: process.env.PASSWORD,
            user: process.env.EMAIL
        }
    });

    const emailOptions = {
        to: sendTo,
        from: process.env.EMAIL,
        subject,
        text
    };
    var response = null;
    transporter.sendMail(emailOptions, (err, info) => {
        if(err) {
            response = {
                message: "Failed to send email",
                success: false
            }
            
        }
        else {
            response = {
                message: "Email is sent",
                success: true,
                info: info.response
            }
        }

    });

    return response;

};

module.exports = sendEmail;