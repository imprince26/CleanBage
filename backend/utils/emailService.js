import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    // Create reusable transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    // Define mail options
    const mailOptions = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.message
    };

    // Send mail
    const info = await transporter.sendMail(mailOptions);

    console.log('Message sent: %s', info.messageId);
};

export default sendEmail;