import db from "../config/db.js";

export const addFavourite = async (req, res) => {
  try {
    const { user_id, product_id } = req.body;

    console.log("BODY:", req.body); // debug

    if (!user_id || !product_id) {
      return res.status(400).json({
        message: "user_id and product_id are required"
      });
    }

    const userId = parseInt(user_id);
    const productId = parseInt(product_id);

    const existing = await db.query(
  "SELECT * FROM favorites WHERE user_id=$1 AND product_id=$2",
  [userId, productId]
);

if (existing.rows.length > 0) {
  return res.json({ message: "Already in favorites" });
}

    const result = await db.query(
      "INSERT INTO favorites (user_id, product_id) VALUES ($1, $2) RETURNING *",
      [userId, productId]
    );

    res.json({
      success: true,
      message: "Added to favorites",
      data: result.rows[0],
    });

  } catch (error) {
    console.log("Error adding favorite:", error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
};

export const getFavourites = async (req, res) => {
  try {
    const { user_id } = req.query;

    const result = await db.query(
      `SELECT f.id, p.name, p.price, p.image 
       FROM favorites f
       JOIN products p ON f.product_id = p.id
       WHERE f.user_id = $1`,
      [user_id]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });

  } catch (error) {
    console.error("Error fetching favorites:", error.message);
    res.status(500).json({ message: " Internal Server error" });
  }
};
export const deleteFavourite = async (req, res) => {
  try {
      const id = parseInt(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const result = await db.query(
      "DELETE FROM favorites WHERE id = $1 RETURNING *",
      [id] 
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    res.json({
      success: true,
      message: "Removed from favorites",
      data: result.rows[0],
    });

  } catch (error) {
    console.error("Error removing favorite:", error.message);
    res.status(500).json({ message: " Internal Server error" });
  }
};