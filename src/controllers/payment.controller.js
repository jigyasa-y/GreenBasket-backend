import db from "../config/db.js";

export const addPaymentMethod = async (req, res) => {

  try {

    const {
      user_id,
      provider,
      payment_method_id,
      payment_label,
      last4,
      brand
    } = req.body;



    const result = await db.query(

      `INSERT INTO payment_methods
      (
        user_id,
        provider,
        payment_method_id,
        payment_label,
        last4,
        brand
      )

      VALUES ($1,$2,$3,$4,$5,$6)

      RETURNING *`,

      [
        user_id,
        provider,
        payment_method_id,
        payment_label,
        last4 || null,
        brand || null
      ]
    );



    res.json({

      success: true,

      message: "Payment method added",

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

export const getPaymentMethods = async (req, res) => {

  try {

    const { user_id } = req.query;



    const result = await db.query(

      `SELECT *

       FROM payment_methods

       WHERE user_id=$1

       ORDER BY is_default DESC, id DESC`,

      [user_id]
    );



    res.json({

      success: true,

      count: result.rows.length,

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

export const setDefaultPaymentMethod = async (req, res) => {

  try {

    const id = req.params.id;



    const payment = await db.query(

      `SELECT * FROM payment_methods
       WHERE id=$1`,

      [id]
    );



    if (payment.rows.length === 0) {

      return res.status(404).json({

        success: false,
        message: "Payment method not found"

      });

    }



    const user_id = payment.rows[0].user_id;



    // remove old default

    await db.query(

      `UPDATE payment_methods
       SET is_default=false
       WHERE user_id=$1`,

      [user_id]
    );



    // set new default

    const result = await db.query(

      `UPDATE payment_methods
       SET is_default=true
       WHERE id=$1
       RETURNING *`,

      [id]
    );



    res.json({

      success: true,

      message: "Default payment updated",

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

export const deletePaymentMethod = async (req, res) => {

  try {

    const id = req.params.id;



    const result = await db.query(

      `DELETE FROM payment_methods
       WHERE id=$1
       RETURNING *`,

      [id]
    );



    if (result.rows.length === 0) {

      return res.status(404).json({

        success: false,
        message: "Payment method not found"

      });

    }



    res.json({

      success: true,

      message: "Payment method deleted"

    });

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });

  }

};