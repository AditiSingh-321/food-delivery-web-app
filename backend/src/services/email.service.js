const nodemailer = require('nodemailer');
const logger = require('../middleware/logger.middleware');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendEmail = async (options) => {
    try {
        const message = {
            from: `${process.env.SMTP_USER}`,
            to: options.email,
            subject: options.subject,
            html: options.html,
        };

        const info = await transporter.sendMail(message);
        logger.info(`Message sent: ${info.messageId}`);
    } catch (error) {
        logger.error(`Error sending email to ${options.email}: ${error.message}`);
        // don't throw error to prevent application from crashing just because email failed
    }
};

const sendVerificationEmail = async (email, token) => {
    const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    const html = `
        <h1>Verify your email</h1>
        <p>Click the link below to verify your email address:</p>
        <a href="${url}">Verify Email</a>
    `;
    await sendEmail({ email, subject: 'Email Verification', html });
};

const sendPasswordResetEmail = async (email, token) => {
    const url = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    const html = `
        <h1>Reset Password</h1>
        <p>Click the link below to reset your password. This link is valid for 10 minutes.</p>
        <a href="${url}">Reset Password</a>
    `;
    await sendEmail({ email, subject: 'Password Reset', html });
};

module.exports = {
    sendEmail,
    sendVerificationEmail,
    sendPasswordResetEmail
};
