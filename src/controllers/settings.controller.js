import db from "../config/db.js";
import bcrypt from "bcrypt";

export const getSettings = async (req, res) => {

  try {

    const { user_id } = req.query;

    const result = await db.query(

      `SELECT *
       FROM user_settings
       WHERE user_id = $1`,

      [user_id]
    );

    // first time create default settings
    if (result.rows.length === 0) {

      const createDefault = await db.query(

        `INSERT INTO user_settings
        (user_id)

        VALUES ($1)

        RETURNING *`,

        [user_id]
      );

      return res.json({
        success: true,
        data: createDefault.rows[0]
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

export const updateSettings = async (req, res) => {

  try {

    const {
      user_id,
      newsletter,
      text_messages,
      phone_calls,
      push_notifications,
      profile_private,
      currency,
      language,
      google_linked,
      facebook_linked
    } = req.body;

    const result = await db.query(

      `UPDATE user_settings

       SET

       newsletter = $1,
       text_messages = $2,
       phone_calls = $3,
       push_notifications = $4,
       profile_private = $5,
       currency = $6,
       language = $7,
       google_linked = $8,
       facebook_linked = $9

       WHERE user_id = $10

       RETURNING *`,

      [
        newsletter,
        text_messages,
        phone_calls,
        push_notifications,
        profile_private,
        currency,
        language,
        google_linked,
        facebook_linked,
        user_id
      ]
    );

    res.json({

      success: true,

      message: "Settings updated",

      data: result.rows[0]

    });

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

export const changePassword = async (req, res) => {

  try {

    const {
      user_id,
      old_password,
      new_password
    } = req.body;

    const userResult = await db.query(

      `SELECT *
       FROM users
       WHERE id = $1`,

      [user_id]
    );

    if (userResult.rows.length === 0) {

      return res.status(404).json({
        success: false,
        message: "User not found"
      });

    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(
      old_password,
      user.password
    );

    if (!isMatch) {

      return res.status(400).json({
        success: false,
        message: "Old password incorrect"
      });

    }

    const hashedPassword =
      await bcrypt.hash(new_password, 10);

    await db.query(

      `UPDATE users
       SET password = $1
       WHERE id = $2`,

      [hashedPassword, user_id]
    );

    res.json({

      success: true,

      message: "Password changed successfully"

    });

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

export const logout = async (req, res) => {

  try {

    res.json({
      success: true,
      message: "Logout successful"
    });

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};