const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "inventory-app",
  password: "0730",
  port: 5432,
});

app.get("/products", async (req, res) => {
  const result = await pool.query("SELECT * FROM products");
  res.json(result.rows);
});


app.patch("/products/:id/stock/in", async (req, res) => {
  const id = req.params.id;
  const { quantity, memo } = req.body;

  // 在庫更新
  const result = await pool.query(
    `
    UPDATE products
    SET stock_quantity = stock_quantity + $1
    WHERE id = $2
    RETURNING *
    `,
    [quantity, id]
  );

  // 履歴保存
  await pool.query(
    `
    INSERT INTO stock_logs
    (product_id, type, quantity, memo)
    VALUES ($1, $2, $3, $4)
    `,
    [id, "IN", quantity, memo]
  );

  res.json(result.rows[0]);

});



app.patch("/products/:id/stock/out", async (req, res) => {
  const id = req.params.id;
  const { quantity, memo } = req.body;

  // 商品取得
  const productResult = await pool.query(
    "SELECT * FROM products WHERE id = $1",
    [id]
  );

  const product = productResult.rows[0];

  // 商品存在チェック
  if (!product) {
    return res.status(404).json({
      error: "商品が見つかりません",
    });
  }

  // 在庫不足チェック
  if (product.stock_quantity < quantity) {
    return res.status(400).json({
      error: "在庫不足です",
    });
  }

  // 在庫減少
  const result = await pool.query(
    `
    UPDATE products
    SET stock_quantity = stock_quantity - $1
    WHERE id = $2
    RETURNING *
    `,
    [quantity, id]
  );

  // 履歴保存
  await pool.query(
    `
    INSERT INTO stock_logs
    (product_id, type, quantity, memo)
    VALUES ($1, $2, $3, $4)
    `,
    [id, "OUT", quantity, memo]
  );

  res.json(result.rows[0]);
});








app.listen(3000, () => {
  console.log("サーバー起動 http://localhost:3000");
});