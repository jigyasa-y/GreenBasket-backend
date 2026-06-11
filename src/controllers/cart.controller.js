import db from "../config/db.js";

export const addToCart = async (req, res) => {

  try {

    const {
      user_id,
      product_id,
      variant_id,
      quantity
    } = req.body;

    if (!user_id || !product_id) {

      return res.status(400).json({
        message: "user_id and product_id required"
      });

    }

    const userId = parseInt(user_id);

    const productId = parseInt(product_id);

    const variantId = variant_id
      ? parseInt(variant_id)
      : null;

    const qty = quantity
      ? parseInt(quantity)
      : 1;



    // already exists

    const existing = await db.query(

      `SELECT * FROM cart

       WHERE user_id=$1
       AND product_id=$2
       AND variant_id=$3`,

      [userId, productId, variantId]
    );



    // update quantity

    if (existing.rows.length > 0) {

      const updated = await db.query(

        `UPDATE cart

         SET quantity = quantity + $1

         WHERE user_id=$2
         AND product_id=$3
         AND variant_id=$4

         RETURNING *`,

        [qty, userId, productId, variantId]
      );



      return res.json({

        success: true,
        message: "Quantity updated",
        data: updated.rows[0]

      });

    }



    // insert new cart item

    const result = await db.query(

      `INSERT INTO cart

      (user_id, product_id, variant_id, quantity)

      VALUES ($1,$2,$3,$4)

      RETURNING *`,

      [userId, productId, variantId, qty]
    );



    res.json({

      success: true,
      message: "Added to cart",
      data: result.rows[0]

    });

  } catch (error) {

    console.error("Error adding to cart:", error.message);

    res.status(500).json({
      message: "Internal server error"
    });

  }

};

export const getCart = async (req, res) => {

  try {

    const { user_id } = req.query;



    const result = await db.query(

      `SELECT

        c.id,
        c.quantity,

        p.id AS product_id,
        p.name,
        p.image,

        pv.id AS variant_id,
        pv.unit,
        pv.price,

        cat.name AS category

       FROM cart c

       JOIN products p
       ON c.product_id = p.id

       LEFT JOIN product_variants pv
       ON c.variant_id = pv.id

       LEFT JOIN categories cat
       ON p.category_id = cat.id

       WHERE c.user_id = $1

       ORDER BY c.id DESC`,

      [user_id]
    );



    // subtotal

    let subtotal = 0;

    result.rows.forEach(item => {

      subtotal += Number(item.price) * item.quantity;

    });



    // delivery fee

    const delivery_fee = 10;



    // final total

    const total = subtotal + delivery_fee;



    res.json({

      success: true,

      count: result.rows.length,

      items: result.rows,

      summary: {

        subtotal,
        delivery_fee,
        total

      }

    });

  } catch (error) {

    console.error("Error fetching cart:", error.message);

    res.status(500).json({
      message: "Internal server error"
    });

  }

};

export const deleteCartItem = async (req, res) => {

  try {

    const id = parseInt(req.params.id);



    const result = await db.query(

      `DELETE FROM cart

       WHERE id=$1

       RETURNING *`,

      [id]
    );
    if (result.rows.length === 0) {

      return res.status(404).json({

        message: "Cart item not found"

      });

    }
    res.json({

      success: true,
      message: "Removed from cart",
      data: result.rows[0]

    });

  } catch (error) {

    console.error("Error deleting cart:", error.message);

    res.status(500).json({
      message: "Internal server error"
    });

  }

};

export const  updateCartQuantity = async (req, res) => {

  try {

    const id = parseInt(req.params.id);

    const { quantity } = req.body;



    // remove if quantity <= 0

    if (quantity <= 0) {

      await db.query(

        `DELETE FROM cart WHERE id=$1`,

        [id]
      );



      return res.json({

        success: true,
        message: "Item removed"

      });

    }

// update quantity

const result = await db.query(

      `UPDATE cart

       SET quantity=$1

       WHERE id=$2

       RETURNING *`,

      [quantity, id]
    );



    res.json({

      success: true,
      message: "Cart updated",
      data: result.rows[0]

    });

  } catch (error) {

    console.error("Error updating cart:", error.message);

    res.status(500).json({
      message: "Internal server error"
    });

  }

};