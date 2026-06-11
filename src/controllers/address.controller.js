import db from "../config/db.js";

export const getAddresses = async (req, res) => {

  try {

    const { user_id } = req.query;

    const result = await db.query(

      `SELECT *
       FROM addresses
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
      message: "Internal server error"
    });

  }

};

export const addAddress = async (req, res) => {

  try {

    const {
      user_id,
      title,
      address,
      city,
      latitude,
      longitude,
      current_location
    } = req.body;

    const result = await db.query(

      `INSERT INTO addresses
      (
        user_id,
        title,
        address,
        city,
        latitude,
        longitude,
        current_location
      )

      VALUES ($1,$2,$3,$4,$5,$6,$7)

      RETURNING *`,

      [
        user_id,
        title,
        address,
        city,
        latitude,
        longitude,
        current_location || false
      ]
    );

    res.json({

      success: true,

      message: "Location saved successfully",

      data: result.rows[0]

    });

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      message: "Internal server error"
    });

  }

};


export const setDefaultAddress = async (req, res) => {

  try {

    const id = req.params.id;

    // find selected address

    const selected = await db.query(

      `SELECT * FROM addresses
       WHERE id=$1`,

      [id]
    );



    if (selected.rows.length === 0) {

      return res.status(404).json({

        success: false,
        message: "Address not found"

      });

    }



    const user_id = selected.rows[0].user_id;



    // remove old default

    await db.query(

      `UPDATE addresses
       SET is_default=false
       WHERE user_id=$1`,

      [user_id]
    );



    // set new default

    const result = await db.query(

      `UPDATE addresses
       SET is_default=true
       WHERE id=$1
       RETURNING *`,

      [id]
    );



    res.json({

      success: true,

      message: "Default address updated",

      data: result.rows[0]

    });

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      message: "Internal server error"
    });

  }

};

export const deleteAddress = async (req, res) => {

  try {

    const id = req.params.id;

    const result = await db.query(

      `DELETE FROM addresses
       WHERE id=$1
       RETURNING *`,

      [id]
    );



    if (result.rows.length === 0) {

      return res.status(404).json({

        success: false,
        message: "Address not found"

      });

    }



    res.json({

      success: true,

      message: "Address deleted",

      data: result.rows[0]

    });

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      message: "Internal server error"
    });

  }

};