import db from "../config/db.js";

export const getBanners = async (req, res) => {


  try{

    const result = await db.query("select * from banners order by id desc");
    res.json({
      success: true,
      data: result.rows,
    });

  }
  catch(error){
    console.log("Error fetching banners:", error.message);
    res.status(500).json({message:"Internal server error"});
  }
};


