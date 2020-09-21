const nodemailer = require('nodemailer');
const { options } = require('../routes/tourRoutes');

const sendEmail = async options => {
    // 1) Create transporter
    const transporter = nodemailer.createTransport({
        //service: 'Gmail', // sendGrit & mailGun (less restricted services)
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    // 2) Define options
    const mailBody = {
        from: 'Me <i8c.real@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    // 3) Send email
    await transporter.sendMail(mailBody);
};

module.exports = sendEmail;