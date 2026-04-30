const pool = require("../../config/database");
const Joi = require("joi");

// Cek Saldo
const getBalance = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT balance FROM balance WHERE user_id = $1",
      [req.user.id],
    );

    return res.status(200).json({
      status: 0,
      message: "Get Balance Berhasil",
      data: { balance: result.rows[0]?.balance || 0 },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: 500, message: "Internal server error", data: null });
  }
};

// Top Up
const topUp = async (req, res) => {
  const schema = Joi.object({
    top_up_amount: Joi.number().positive().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 102,
      message:
        "Paramter amount hanya boleh angka dan tidak boleh lebih kecil dari 0",
      data: null,
    });
  }

  const { top_up_amount } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Update balance
    const balanceResult = await client.query(
      `UPDATE balance SET balance = balance + $1, updated_at = NOW()
       WHERE user_id = $2
       RETURNING balance`,
      [top_up_amount, req.user.id],
    );

    // Generate invoice number
    const invoiceNumber = `INV${Date.now()}-TOPUP`;

    // Insert transaksi
    await client.query(
      `INSERT INTO transactions (user_id, invoice_number, transaction_type, description, total_amount)
       VALUES ($1, $2, 'TOPUP', 'Top Up balance', $3)`,
      [req.user.id, invoiceNumber, top_up_amount],
    );

    await client.query("COMMIT");

    return res.status(200).json({
      status: 0,
      message: "Top Up Balance berhasil",
      data: { balance: balanceResult.rows[0].balance },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return res
      .status(500)
      .json({ status: 500, message: "Internal server error", data: null });
  } finally {
    client.release();
  }
};

module.exports = { getBalance, topUp };
