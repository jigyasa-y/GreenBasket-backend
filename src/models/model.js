import db from "../config/db";

exports.getAllProducts = async () => {
  const result = await db.query("SELECT * FROM product");
  return result.rows;
};