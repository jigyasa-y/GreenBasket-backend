import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
  servce: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default transporter;