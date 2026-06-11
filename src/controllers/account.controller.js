import db from "../config/db.js";

export const getAccount = async (req, res) => {
  try {
    const { user_id } = req.query;

    const result = await db.query(
      "SELECT id, name, email, profile_image FROM users WHERE id=$1",
      [user_id]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });

  } catch (error) {
    res.status(500).json({ message: "Internal Server error" });
  }
};

export const updateAccount = async (req, res) => {
  try {
    const { user_id, name, email } = req.body;

    const result = await db.query(
      `UPDATE users SET name=$1, email=$2 WHERE id=$3 RETURNING *`,
      [name, email, user_id]
    );

    res.json({
      success: true,
      message: "Updated",
      data: result.rows[0],
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: " InternalServer error" });
  }
};

export const updateLanguage = async (req, res) => {

  try {

    const { user_id, language } = req.body;

    // validation
    if (!user_id || !language) {

      return res.status(400).json({
        success: false,
        message: "user_id and language required"
      });

    }

    const result = await db.query(

      `UPDATE users
       SET language = $1
       WHERE id = $2
       RETURNING id, name, email, language`,

      [language, user_id]

    );

    // user not found
    if (result.rows.length === 0) {

      return res.status(404).json({
        success: false,
        message: "User not found"
      });

    }

    res.json({

      success: true,
      message: "Language updated successfully",

      data: result.rows[0]

    });

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });

  }

};