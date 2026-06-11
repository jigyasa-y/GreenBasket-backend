import db from "../config/db.js";

export const getCards = async (req, res) => {
  try {
    const { user_id } = req.query;

    const result = await db.query(
      "SELECT * FROM cards WHERE user_id=$1 ORDER BY id DESC",
      [user_id]
    );

    res.json({
      success: true,
      data: result.rows,
    });

  } catch (error) {
    res.status(500).json({ message: " Internal Server error" });
  }
};

export const addCard = async (req, res) => {
  try {
    const { user_id, card_name, card_number } = req.body;

    const result = await db.query(
      `INSERT INTO cards (user_id, card_name, card_number)
       VALUES ($1,$2,$3) RETURNING *`,
      [user_id, card_name, card_number]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });

  } catch (error) {
    res.status(500).json({ message: " internal Server error" });
  }
};

export const deleteCard = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const result = await db.query(
      "DELETE FROM cards WHERE id=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Card not found"
      });
    }

    res.json({
      success: true,
      message: "Deleted",
      data: result.rows[0]
    });

  } catch (error) {
    console.error("Error deleting card:", error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
};