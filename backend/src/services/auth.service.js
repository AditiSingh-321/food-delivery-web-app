const User = require("../models/User");
const { sendEmail } = require("./email.service");
const crypto = require("crypto");

const sendVerificationEmail = async (user, req) => {
  // We can implement a more robust verification token system later
  // For now, let's pretend we generate a link
  const verificationUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/verifyemail?token=dummytoken`;

  const message = `
    <h1>Verify your email address</h1>
    <p>Please click the link below to verify your account</p>
    <a href=${verificationUrl} clicktracking=off>${verificationUrl}</a>
  `;

  await sendEmail({
    email: user.email,
    subject: "Email Verification",
    html: message,
  });
};

const sendPasswordResetEmail = async (user, req) => {
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const message = `
    <h1>You requested a password reset</h1>
    <p>Please go to this link to reset your password:</p>
    <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
  `;

  await sendEmail({
    email: user.email,
    subject: "Password Reset Request",
    html: message,
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
