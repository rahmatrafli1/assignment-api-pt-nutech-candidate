const pool = require("../../config/database");
const Joi = require("joi");

// Transaksi / Payment
const createTransaction = async (req, res) => {
  const schema = Joi.object({
    service_code: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 102,
      message: error.details[0].message,
      data: null,
    });
  }

  const { service_code } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Cek service ada
    const serviceResult = await client.query(
      "SELECT * FROM services WHERE service_code = $1",
      [service_code],
    );

    if (serviceResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        status: 102,
        message: "Service atau Layanan tidak ditemukan",
        data: null,
      });
    }

    const service = serviceResult.rows[0];

    // Cek saldo
    const balanceResult = await client.query(
      "SELECT balance FROM balance WHERE user_id = $1",
      [req.user.id],
    );

    const currentBalance = parseFloat(balanceResult.rows[0]?.balance || 0);

    if (currentBalance < service.service_tariff) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        status: 102,
        message: "Saldo tidak mencukupi",
        data: null,
      });
    }

    // Kurangi saldo
    await client.query(
      `UPDATE balance SET balance = balance - $1, updated_at = NOW()
       WHERE user_id = $2`,
      [service.service_tariff, req.user.id],
    );

    // Generate invoice
    const invoiceNumber = `INV${Date.now()}-${service_code}`;

    // Insert transaksi
    const transactionResult = await client.query(
      `INSERT INTO transactions (user_id, service_id, invoice_number, transaction_type, description, total_amount)
       VALUES ($1, $2, $3, 'PAYMENT', $4, $5)
       RETURNING invoice_number, transaction_type, description, total_amount, created_on`,
      [
        req.user.id,
        service.id,
        invoiceNumber,
        service.service_name,
        service.service_tariff,
      ],
    );

    await client.query("COMMIT");

    const trx = transactionResult.rows[0];

    return res.status(200).json({
      status: 0,
      message: "Transaksi berhasil",
      data: {
        invoice_number: trx.invoice_number,
        service_code: service.service_code,
        service_name: service.service_name,
        transaction_type: trx.transaction_type,
        total_amount: trx.total_amount,
        created_on: trx.created_on,
      },
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

// History Transaksi
const getTransactionHistory = async (req, res) => {
  const { offset = 0, limit = 10 } = req.query;

  try {
    const result = await pool.query(
      `SELECT 
        t.invoice_number,
        t.transaction_type,
        t.description,
        t.total_amount,
        t.created_on
       FROM transactions t
       WHERE t.user_id = $1
       ORDER BY t.created_on DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, parseInt(limit), parseInt(offset)],
    );

    return res.status(200).json({
      status: 0,
      message: "Get History Berhasil",
      data: {
        offset: parseInt(offset),
        limit: parseInt(limit),
        records: result.rows,
      },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: 500, message: "Internal server error", data: null });
  }
};

module.exports = { createTransaction, getTransactionHistory };
