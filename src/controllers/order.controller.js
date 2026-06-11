import db from "../config/db.js";

export const placeOrder = async (req, res) => {

  try {

    const {
      user_id,
      address_id,
      payment_method_id,
      delivery_date,
      delivery_time,
      delivery_type,
      coupon_code
    } = req.body;

    const cartResult = await db.query(

      `SELECT

        c.quantity,

        p.id AS product_id,
        p.name,
        p.image,

        pv.id AS variant_id,
        pv.price,
        pv.unit

       FROM cart c

       JOIN products p
       ON c.product_id = p.id

       LEFT JOIN product_variants pv
       ON c.variant_id = pv.id

       WHERE c.user_id = $1`,

      [user_id]
    );



    const cartItems = cartResult.rows;



    if (cartItems.length === 0) {

      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });

    }



    // SUBTOTAL
    let subtotal = 0;

    cartItems.forEach(item => {

      subtotal += Number(item.price) * item.quantity;

    });



    // DELIVERY FEE
    const delivery_fee =
      delivery_type === "pickup" ? 0 : 10;



    // COUPON
    let discount = 0;

    if (coupon_code) {

      const couponResult = await db.query(

        `SELECT *
         FROM coupons
         WHERE code=$1
         AND is_active=true`,

        [coupon_code]
      );



      if (couponResult.rows.length > 0) {

        const coupon = couponResult.rows[0];

        discount =
          (subtotal * coupon.discount_percent) / 100;
      }
    }



    // TOTAL
    const total_amount =
      subtotal + delivery_fee - discount;



    // CREATE ORDER
    const orderResult = await db.query(

      `INSERT INTO orders
      (
        user_id,
        address_id,
        payment_method_id,
        subtotal,
        delivery_fee,
        discount,
        total_amount,
        status,
        delivery_type,
        delivery_date,
        delivery_time,
        coupon_code
      )

      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)

      RETURNING *`,

      [
        user_id,
        address_id,
        payment_method_id,
        subtotal,
        delivery_fee,
        discount,
        total_amount,
        "waiting",
        delivery_type,
        delivery_date,
        delivery_time,
        coupon_code
      ]
    );



    const order = orderResult.rows[0];



    // INSERT ORDER ITEMS
    for (const item of cartItems) {

      await db.query(

        `INSERT INTO order_items
        (
          order_id,
          product_id,
          variant_id,
          quantity,
          price
        )

        VALUES
        ($1,$2,$3,$4,$5)`,

        [
          order.id,
          item.product_id,
          item.variant_id,
          item.quantity,
          item.price
        ]
      );
    }



    // CLEAR CART
    await db.query(
      "DELETE FROM cart WHERE user_id=$1",
      [user_id]
    );



    res.json({

      success: true,

      message: "Order placed successfully",

      order

    });

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });

  }
};




// GET ORDERS
export const getOrders = async (req, res) => {

  try {

    const { user_id, status } = req.query;



    let query =

      `SELECT

        o.id,
        o.total_amount,
        o.status,
        o.delivery_type,
        o.created_at,

        ARRAY_AGG(p.image) AS images

       FROM orders o

       JOIN order_items oi
       ON o.id = oi.order_id

       JOIN products p
       ON oi.product_id = p.id

       WHERE o.user_id = $1`;



    let values = [user_id];



    if (status) {

      query += ` AND o.status = $2`;

      values.push(status);
    }



    query +=

      ` GROUP BY o.id
        ORDER BY o.id DESC`;



    const result = await db.query(
      query,
      values
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

export const getOrderDetails = async (req, res) => {

  try {

    const { id } = req.params;

    const orderResult = await db.query(

      `SELECT

        o.id,
        o.total_amount,
        o.status,
        o.tracking_status,
        o.delivery_date,
        o.delivery_time,
        o.estimated_minutes,
        o.courier_phone,
        o.created_at,

        a.title,
        a.address

      FROM orders o

      LEFT JOIN addresses a
      ON o.address_id = a.id

      WHERE o.id = $1`,

      [id]
    );

    if (orderResult.rows.length === 0) {

      return res.status(404).json({
        success: false,
        message: "Order not found"
      });

    }

    // order items
    const itemsResult = await db.query(

      `SELECT

        oi.quantity,
        oi.price,

        p.name,
        p.image

       FROM order_items oi

       JOIN products p
       ON oi.product_id = p.id

       WHERE oi.order_id = $1`,

      [id]
    );

    res.json({

      success: true,

      order: orderResult.rows[0],

      items: itemsResult.rows

    });

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });

  }
};