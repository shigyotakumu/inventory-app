async function fetchProducts() {
  const response = await fetch("/products");
  const products = await response.json();

  const productList =
    document.getElementById("product-list");

  productList.innerHTML = "";

  products.forEach(product => {
    productList.innerHTML += `
      <div>
        <h3>${product.name}</h3>
        <p>在庫: ${product.stock_quantity}</p>
      </div>
      <hr>
    `;
  });
}

fetchProducts();