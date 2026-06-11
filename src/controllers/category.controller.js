import db from "../config/db.js";

export const getCategories = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        c.id,
        c.name,
        c.icon,
        COUNT(p.id) AS item_count
      FROM categories c
      LEFT JOIN products p 
        ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.id ASC
    `);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
