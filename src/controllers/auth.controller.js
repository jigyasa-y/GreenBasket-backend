import bcrypt from "bcrypt";
import db from "../config/db.js"
import jwt from "jsonwebtoken";
import crypto from "crypto";
import transporter from "../config/mail.js";

export const Signup = async (req, res) => {
  try {
    const { name, email, password }=req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existing = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};


export const Signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    //Check user in DB
    const result = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const user = result.rows[0];

    //Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.SECRET_KEY, 
      { expiresIn: "1d" }
    );

    // Response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};





// 🔐 FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const genericMessage = {
      message: "If account exists, reset link sent to email",
    };

    const result = await db.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.json(genericMessage);
    }

    const user = result.rows[0];

    // generate token
    const rawToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expiry = new Date(Date.now() + 3600000);

    await db.query(
      "UPDATE users SET reset_token=$1, reset_token_expiry=$2 WHERE id=$3",
      [hashedToken, expiry, user.id]
    );

    const resetLink = `http://localhost:3000/reset-password/${rawToken}`;

    // send email
    await transporter.sendMail({
      to: email,
      subject: "Reset Password",
      html: `
        <h2>Password Reset</h2>
        <p>Click below link:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>Valid for 1 hour</p>
      `,
    });

    res.json(genericMessage);

  } 
catch (error) {
  console.log("ERROR:", error); // 👈 ADD THIS
  res.status(500).json({ message: error.message });
}
};

// 🔄 RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const result = await db.query(
      `SELECT * FROM users 
       WHERE reset_token=$1 AND reset_token_expiry > NOW()`,
      [hashedToken]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    const user = result.rows[0];

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      `UPDATE users 
       SET password=$1, reset_token=NULL, reset_token_expiry=NULL 
       WHERE id=$2`,
      [hashedPassword, user.id]
    );

    res.json({ message: "Password reset successful" });

  } catch (error) {
    res.status(500).json({ message: error.message });
}
};


export const sendOTP = async (req, res) => {

  try {

    const { phone } = req.body;

    // validation
    if (!phone) {

      return res.status(400).json({
        success: false,
        message: "Phone number required"
      });

    }

    // generate 4 digit otp
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // 2 minute expiry
    const expiry = new Date(Date.now() + 2 * 60 * 1000);

    // check user exists
    const user = await db.query(
      "SELECT * FROM users WHERE phone=$1",
      [phone]
    );

    // new user
    if (user.rows.length === 0) {
await db.query(

  `INSERT INTO users
  (
    name,
    email,
    password,
    phone,
    otp,
    otp_expiry
  )

  VALUES ($1,$2,$3,$4,$5,$6)`,

  [
    "New User",
    `${phone}@demo.com`,
    "123456",
    phone,
    otp,
    expiry
  ]
);
    }

    // existing user
    else {

      await db.query(

        `UPDATE users
         SET otp=$1,
             otp_expiry=$2
         WHERE phone=$3`,

        [otp, expiry, phone]
      );

    }

    res.json({

      success: true,
      message: "OTP sent successfully",

      // testing only
      otp

    });

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      message: "Internal server error"
    });

  }

};




/* =========================
   VERIFY OTP
========================= */

export const verifyOTP = async (req, res) => {

  try {

    const { phone, otp } = req.body;

    const result = await db.query(

      `SELECT * FROM users
       WHERE phone=$1
       AND otp=$2`,

      [phone, otp]
    );

    // invalid otp
    if (result.rows.length === 0) {

      return res.status(400).json({

        success: false,
        message: "Invalid OTP"

      });

    }

    const user = result.rows[0];

    // check expiry
    if (new Date() > new Date(user.otp_expiry)) {

      return res.status(400).json({

        success: false,
        message: "OTP expired"

      });

    }

    // clear otp
    await db.query(

      `UPDATE users
       SET otp=NULL,
           otp_expiry=NULL
       WHERE id=$1`,

      [user.id]
    );

    res.json({

      success: true,
      message: "OTP verified",

      user: {

        id: user.id,
        phone: user.phone

      }

    });

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      message: "Internal server error"
    });

  }

};





/* =========================
   RESEND OTP
========================= */

export const resendOTP = async (req, res) => {

  try {

    const { phone } = req.body;

    // generate new otp
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // 2 minute expiry
    const expiry = new Date(Date.now() + 2 * 60 * 1000);

    await db.query(

      `UPDATE users
       SET otp=$1,
           otp_expiry=$2
       WHERE phone=$3`,

      [otp, expiry, phone]
    );

    res.json({

      success: true,
      message: "OTP resent successfully",

      // testing only
      otp

    });

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      message: "Internal server error"
    });

  }

};



    
   