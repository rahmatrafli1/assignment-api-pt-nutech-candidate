const pool = require('../../config/database');

// Get Banners
const getBanners = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT banner_name, banner_image, description FROM banners ORDER BY created_at ASC'
    );

    return res.status(200).json({
      status: 0,
      message: 'Sukses',
      data: result.rows,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 500, message: 'Internal server error', data: null });
  }
};

// Get Services
const getServices = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT service_code, service_name, service_icon, service_tariff FROM services ORDER BY created_at ASC'
    );

    return res.status(200).json({
      status: 0,
      message: 'Sukses',
      data: result.rows,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 500, message: 'Internal server error', data: null });
  }
};

module.exports = { getBanners, getServices };