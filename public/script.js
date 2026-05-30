async function fetchProducts() {
  const response = await fetch("/products");
  const products = await response.json();

  const productList =
    document.getElementById("product-list");

  productList.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>商品名</th>
          <th>価格</th>
          <th>カテゴリ</th>
          <th>在庫</th>
          <th>捜査</th>
        </tr>
      </thead>
      <tbody id="table-body"></tbody>
    </table>
  `;

  const tableBody =
    document.getElementById("table-body");

  products.forEach(product => {
  tableBody.innerHTML += `
    <tr>
      <td>${product.id}</td>
      <td>${product.name}</td>
      <td>${product.price ?? 0}円</td>
      <td>${product.category ?? "-"}</td>
      <td>${product.stock_quantity}</td>
      <td>
         <button onclick="stockIn(${product.id})">
          入庫
        </button> 
        <button onclick="editProduct(${product.id})">
          編集
        </button>      
        <button onclick="deleteProduct(${product.id})">
          削除
        </button>
      </td>
    </tr>
  `;
});
};
fetchProducts();

const productForm =
  document.getElementById("product-form");

productForm.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    const name =
      document.getElementById("name").value;

    const price =
      document.getElementById("price").value;

    const category =
      document.getElementById("category").value;

    const stockQuantity =
      document.getElementById(
        "stock_quantity"
      ).value;

    await fetch("/products", {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        name,
        price,
        category,
        stock_quantity:
          stockQuantity,
      }),
    });

    productForm.reset();

    fetchProducts();
  }
);

async function deleteProduct(id) {
  await fetch(`/products/${id}`, {
    method: "DELETE",
  });

  fetchProducts();
};

async function editProduct(id) {
  const name =
    prompt("商品名を入力");

  const price =
    prompt("価格を入力");

  const category =
    prompt("カテゴリを入力");

  await fetch(`/products/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type":
        "application/json",
    },
    body: JSON.stringify({
      name,
      price,
      category,
    }),
  });

  fetchProducts();
}

async function stockIn(id) {
  const quantity =
    prompt("入庫数を入力");

  const memo =
    prompt("メモを入力");

  await fetch(`/products/${id}/stock/in`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      quantity: Number(quantity),
      memo,
    }),
  });

  fetchProducts();
}