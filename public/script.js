async function fetchProducts() {
  const response =
    await fetch("/products");

  const products =
    await response.json();

  renderProducts(products);
}

function renderProducts(products) {
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
          <th>操作</th>
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

          <button onclick="stockOut(${product.id})">
            出庫
          </button>

          <button onclick="editProduct(
  ${product.id},
  &quot;${product.name}&quot;,
  ${product.price ?? 0},
  &quot;${product.category ?? ""}&quot;
)">
  編集
</button>
          <button onclick="deleteProduct(${product.id})">
            削除
          </button>
        </td>
      </tr>
    `;
  });
}


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

const editForm =
  document.getElementById("edit-form");

editForm.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    const id =
      document.getElementById("edit-id").value;

    const name =
      document.getElementById("edit-name").value;

    const price =
      document.getElementById("edit-price").value;

    const category =
      document.getElementById("edit-category").value;

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

    editForm.reset();

    fetchProducts();
  }
);

async function deleteProduct(id) {
  const confirmed =
    confirm("本当に削除しますか？");

  if (!confirmed) {
    return;
  }

  await fetch(`/products/${id}`, {
    method: "DELETE",
  });

  fetchProducts();
  fetchStockLogs();
}

function editProduct(id, name, price, category) {
  document.getElementById("edit-id").value = id;
  document.getElementById("edit-name").value = name;
  document.getElementById("edit-price").value = price;
  document.getElementById("edit-category").value = category;
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

  fetchStockLogs();
};


async function stockOut(id) {
  const quantity =
    prompt("出庫数を入力");

  const memo =
    prompt("メモを入力");

  const response = await fetch(
    `/products/${id}/stock/out`,
    {
      method: "PATCH",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        quantity: Number(quantity),
        memo,
      }),
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    alert(data.error);
    return;
  }

  fetchProducts();
  fetchStockLogs();

};

async function searchProducts() {
  const search =
    document.getElementById("search").value;

  const category =
    document.getElementById("search-category").value;

  const params = new URLSearchParams();

  if (search) {
    params.append("search", search);
  }

  if (category) {
    params.append("category", category);
  }

  const response =
    await fetch(`/products?${params.toString()}`);

  const products =
    await response.json();

  renderProducts(products);
}


async function fetchStockLogs() {
  const response =
    await fetch("/stock-logs");

  const logs =
    await response.json();

  const stockLogList =
    document.getElementById("stock-log-list");

  stockLogList.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>商品名</th>
          <th>種類</th>
          <th>数量</th>
          <th>メモ</th>
          <th>日時</th>
        </tr>
      </thead>
      <tbody id="stock-log-body"></tbody>
    </table>
  `;

  const stockLogBody =
    document.getElementById("stock-log-body");

  logs.forEach(log => {
    stockLogBody.innerHTML += `
      <tr>
        <td>${log.id}</td>
        <td>${log.product_name}</td>
        <td>${log.type}</td>
        <td>${log.quantity}</td>
        <td>${log.memo ?? "-"}</td>
        <td>${new Date(log.created_at).toLocaleString()}</td>
      </tr>
    `;
  });
}

fetchStockLogs();

async function stockInForm() {
  const id =
    document.getElementById(
      "stock-product-id"
    ).value;

  const quantity =
    document.getElementById(
      "stock-quantity"
    ).value;

  const memo =
    document.getElementById(
      "stock-memo"
    ).value;

  await fetch(`/products/${id}/stock/in`, {
    method: "PATCH",
    headers: {
      "Content-Type":
        "application/json",
    },
    body: JSON.stringify({
      quantity: Number(quantity),
      memo,
    }),
  });

  fetchProducts();
  fetchStockLogs();
}

async function stockOutForm() {
  const id =
    document.getElementById(
      "stock-product-id"
    ).value;

  const quantity =
    document.getElementById(
      "stock-quantity"
    ).value;

  const memo =
    document.getElementById(
      "stock-memo"
    ).value;

  const response =
    await fetch(
      `/products/${id}/stock/out`,
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          quantity: Number(quantity),
          memo,
        }),
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    alert(data.error);
    return;
  }

  fetchProducts();
  fetchStockLogs();
}