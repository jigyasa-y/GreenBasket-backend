import db from "../config/db.js";

export const getproducts = async (req, res) => {
  try {
    //get query params
    const { category, search } = req.query;

    let query = "SELECT * FROM products";
    let values = [];
    let conditions = [];

    //category filter
    if (category) {
      conditions.push(`category = $${values.length + 1}`);
      values.push(category);
    }

    //search filter (name search)
    if (search) {
      conditions.push(`name ILIKE $${values.length + 1}`);
      values.push(`%${search}%`);
    }

    //apply conditions if any
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    const result = await db.query(query, values);

    res.json({
      success: true,

      data: result.rows,
    });

  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET PRODUCTS BY CATEGORY
export const getProductsByCategory = async (req, res) => {
  try {

    // get category id from URL
    const category_id = parseInt(req.params.category_id);

    // check valid id
    if (!category_id) {
      return res.status(400).json({
        success: false,
        message: "Invalid category id"
      });
    }

    // database query
    const result = await db.query(

      `SELECT
        p.id,
        p.name,
        p.price,
        p.image,
        p.description,
        p.weight,
        c.name AS category_name

      FROM products p

      LEFT JOIN categories c
      ON p.category_id = c.id

      WHERE p.category_id = $1

      ORDER BY p.id DESC`,

      [category_id]
    );

    // response
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (error) {

    console.log("Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


export const getSingleProduct = async (req, res) => {

  try {

    const id = req.params.id;

    const result = await db.query(

      `SELECT
        p.id,
        p.name,
        p.image,
        p.description,
        c.name AS category_name

      FROM products p

      LEFT JOIN categories c
      ON p.category_id = c.id

      WHERE p.id = $1`,

      [id]
    );



    if(result.rows.length === 0){

      return res.status(404).json({
        success:false,
        message:"Product not found"
      });

    }



    res.json({
      success:true,
      data:result.rows[0]
    });

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      success:false,
      message:"Internal server error"
    });

  }
};

// ✅ PRODUCT VARIANTS
export const getProductVariants = async (req, res) => {

  try {

    const product_id = req.params.id;

    const result = await db.query(

      `SELECT
        id,
        unit,
        price,
        stock

      FROM product_variants

      WHERE product_id = $1

      ORDER BY id ASC`,

      [product_id]
    );



    res.json({
      success:true,
      data:result.rows
    });

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      success:false,
      message:"Internal server error"
    });

  }
};

// ✅ RELATED PRODUCTS
export const getRelatedProducts = async (req, res) => {

  try {

    const id = req.params.id;



    // current product
    const product = await db.query(
      "SELECT * FROM products WHERE id = $1",
      [id]
    );



    if(product.rows.length === 0){

      return res.status(404).json({
        success:false,
        message:"Product not found"
      });

    }



    const category_id = product.rows[0].category_id;



    const related = await db.query(

      `SELECT
        id,
        name,
        image

      FROM products

      WHERE category_id = $1
      AND id != $2

      LIMIT 4`,

      [category_id,id]
    );



    res.json({
      success:true,
      data:related.rows
    });

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      success:false,
      message:"Internal server error"
    });

  }
};
export const searchProducts = async (req, res) => {

  try {

    const keyword = req.query.keyword || "";

    const category = req.query.category || null;



    const result = await db.query(

      `SELECT

        p.id,
        p.name,
        p.image,

        c.name AS category,

        MIN(pv.price) AS price

      FROM products p

      LEFT JOIN categories c
      ON p.category_id = c.id

      LEFT JOIN product_variants pv
      ON p.id = pv.product_id

      WHERE

      LOWER(p.name) LIKE LOWER($1)

      AND

      ($2::int IS NULL OR p.category_id = $2)

      GROUP BY
      p.id,
      c.name

      ORDER BY p.id DESC`,

      [`%${keyword}%`, category]
    );



    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });

  }
};

export const filterProducts = async (req, res) => {

  try {

    const {
      category_id,
      min_price,
      max_price,
      sort
    } = req.query;

    let query = `
      SELECT
        p.id,
        p.name,
        p.image,
        c.name AS category,
        MIN(pv.price) AS price
      FROM products p

      LEFT JOIN categories c
      ON p.category_id = c.id

      LEFT JOIN product_variants pv
      ON p.id = pv.product_id

      WHERE 1=1
    `;

    const values = [];

    // category filter
    if (category_id) {
      values.push(category_id);
      query += ` AND p.category_id = $${values.length}`;
    }

    // minimum price
    if (min_price) {
      values.push(min_price);
      query += ` AND pv.price >= $${values.length}`;
    }

    // maximum price
    if (max_price) {
      values.push(max_price);
      query += ` AND pv.price <= $${values.length}`;
    }

    query += `
      GROUP BY
      p.id,
      c.name
    `;

    // sorting
    if (sort === "low") {
      query += ` ORDER BY price ASC`;
    }

    else if (sort === "high") {
      query += ` ORDER BY price DESC`;
    }

    else if (sort === "new") {
      query += ` ORDER BY p.created_at DESC`;
    }

    else {
      query += ` ORDER BY p.id DESC`;
    }

    const result = await db.query(query, values);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });

  }

};

