const apiBase =
  window.VITE_API_URL ||
  (window.__ENV__ && window.__ENV__.VITE_API_URL) ||
  "http://localhost:3000";

const state = {
  products: [],
  categories: [],
  cart: [],
  saved: [],
  currentProduct: null,
  adminToken: null,
  customerToken: null,
};

const fallbackProducts = [
  {
    id: 1,
    name: "Luxe Blue Light Glasses",
    category: "Blue Light Glasses",
    subcategory: "Computer glasses",
    price: 8500,
    description: "Anti-blue light glasses with a lightweight frame and amber tint.",
    material: "Acetate",
    color: "Amber",
    size: "Medium",
    ingredients: "",
    stock: 18,
    sku: "GDA-BLG-001",
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1518976024611-4882e9b72838?auto=format&fit=crop&w=900&q=80",
    ],
    flags: { featured: true, bestSeller: true, newArrival: false, trending: true, offer: false },
  },
  {
    id: 2,
    name: "Golden Glow Beaded Bracelet",
    category: "Beaded Accessories",
    subcategory: "Beaded bracelets",
    price: 3200,
    description: "Handcrafted beaded bracelet with gold-toned accents.",
    material: "Glass beads",
    color: "Gold",
    size: "Adjustable",
    ingredients: "",
    stock: 40,
    sku: "GDA-BA-002",
    images: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    ],
    flags: { featured: true, bestSeller: false, newArrival: true, trending: true, offer: true },
  },
  {
    id: 3,
    name: "Glow Drop Hair Clips Set",
    category: "Hair Accessories",
    subcategory: "Hair clips",
    price: 2800,
    description: "Pearl and crystal hair clips for elegant everyday styling.",
    material: "Metal + pearl",
    color: "Pearl",
    size: "One size",
    ingredients: "",
    stock: 25,
    sku: "GDA-HA-003",
    images: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    ],
    flags: { featured: false, bestSeller: true, newArrival: true, trending: false, offer: false },
  },
  {
    id: 4,
    name: "Radiant Pendant Set",
    category: "Jewellery",
    subcategory: "Pendant sets",
    price: 12000,
    description: "Gold-tone pendant set with matching earrings.",
    material: "Gold-plated",
    color: "Gold",
    size: "Standard",
    ingredients: "",
    stock: 12,
    sku: "GDA-JW-004",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    ],
    flags: { featured: true, bestSeller: true, newArrival: false, trending: true, offer: false },
  },
  {
    id: 5,
    name: "Shimmer Lip Gloss",
    category: "Lip Gloss",
    subcategory: "Shimmer gloss",
    price: 4500,
    description: "Hydrating shimmer gloss with a soft vanilla scent.",
    material: "Cosmetic blend",
    color: "Rose Gold",
    size: "10ml",
    ingredients: "Shea butter, vitamin E",
    stock: 30,
    sku: "GDA-LG-005",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    ],
    flags: { featured: false, bestSeller: true, newArrival: true, trending: true, offer: true },
  },
  {
    id: 6,
    name: "Glow Skin Serum",
    category: "Skincare Products",
    subcategory: "Face serums",
    price: 15000,
    description: "Brightening serum with vitamin C and niacinamide.",
    material: "Skincare",
    color: "Clear",
    size: "30ml",
    ingredients: "Vitamin C, niacinamide",
    stock: 20,
    sku: "GDA-SK-006",
    images: [
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80",
    ],
    flags: { featured: true, bestSeller: false, newArrival: true, trending: false, offer: false },
  },
];

const fallbackCategories = [
  { name: "Blue Light Glasses", description: "Computer glasses, fashion eyewear" },
  { name: "Beaded Accessories", description: "Bracelets, necklaces, waist beads" },
  { name: "Hair Accessories", description: "Clips, headbands, scrunchies" },
  { name: "Jewellery", description: "Necklaces, rings, pendant sets" },
  { name: "Shoes", description: "Sandals, heels, casual shoes" },
  { name: "Lip Gloss", description: "Clear, shimmer, tinted, hydrating" },
  { name: "Skincare Products", description: "Serums, moisturizers, beauty oils" },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value || 0);

const saveCart = () => {
  localStorage.setItem("gda_cart", JSON.stringify(state.cart));
  localStorage.setItem("gda_saved", JSON.stringify(state.saved));
};

const loadCart = () => {
  state.cart = JSON.parse(localStorage.getItem("gda_cart") || "[]");
  state.saved = JSON.parse(localStorage.getItem("gda_saved") || "[]");
};

const updateCartCount = () => {
  const count = state.cart.reduce((total, item) => total + item.quantity, 0);
  document.getElementById("cartCount").textContent = count;
};

const renderCategories = () => {
  const grid = document.getElementById("categoryGrid");
  grid.innerHTML = "";
  state.categories.forEach((category, index) => {
    const card = document.createElement("div");
    card.className = "category-card";
    card.innerHTML = `
      <span>Category ${index + 1}</span>
      <h3>${category.name}</h3>
      <p>${category.description || "Curated glow essentials."}</p>
      <button class="secondary" type="button" data-category="${category.name}">Shop ${category.name}</button>
    `;
    card.querySelector("button").addEventListener("click", () => {
      document.getElementById("filterCategory").value = category.name;
      applyFilters();
      document.getElementById("search").scrollIntoView({ behavior: "smooth" });
    });
    grid.appendChild(card);
  });
};

const productCardTemplate = (product) => {
  const image = product.images && product.images.length ? product.images[0] : "";
  const tag = product.flags?.newArrival
    ? "New Arrival"
    : product.flags?.offer
    ? "Special Offer"
    : "Glow Pick";
  return `
    <img src="${image}" alt="${product.name}" />
    <span class="tag">${tag}</span>
    <h3>${product.name}</h3>
    <p>${product.description}</p>
    <div class="product-meta">
      <span>${formatCurrency(product.price)}</span>
      <button class="secondary" type="button" data-product="${product.id}">View</button>
    </div>
  `;
};

const renderProducts = (products, gridId) => {
  const grid = document.getElementById(gridId);
  grid.innerHTML = "";
  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = productCardTemplate(product);
    card.querySelector("button").addEventListener("click", () => showProduct(product.id));
    grid.appendChild(card);
  });
};

const renderFilters = () => {
  const categorySelect = document.getElementById("filterCategory");
  const productCategorySelect = document.getElementById("productCategory");
  categorySelect.innerHTML = '<option value="">All Categories</option>';
  productCategorySelect.innerHTML = '<option value="">Select category</option>';
  state.categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.name;
    option.textContent = category.name;
    categorySelect.appendChild(option.cloneNode(true));
    productCategorySelect.appendChild(option);
  });

  const colors = [...new Set(state.products.map((product) => product.color).filter(Boolean))];
  const sizes = [...new Set(state.products.map((product) => product.size).filter(Boolean))];
  const colorSelect = document.getElementById("filterColor");
  const sizeSelect = document.getElementById("filterSize");
  colorSelect.innerHTML = '<option value="">Color</option>';
  sizeSelect.innerHTML = '<option value="">Size</option>';
  colors.forEach((color) => {
    const option = document.createElement("option");
    option.value = color;
    option.textContent = color;
    colorSelect.appendChild(option);
  });
  sizes.forEach((size) => {
    const option = document.createElement("option");
    option.value = size;
    option.textContent = size;
    sizeSelect.appendChild(option);
  });
};

const applyFilters = () => {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const category = document.getElementById("filterCategory").value;
  const color = document.getElementById("filterColor").value;
  const size = document.getElementById("filterSize").value;
  const minPrice = Number(document.getElementById("minPrice").value || 0);
  const maxPrice = Number(document.getElementById("maxPrice").value || 999999);
  const sort = document.getElementById("filterSort").value;

  let results = state.products.filter((product) => {
    const matchesQuery =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query);
    const matchesCategory = !category || product.category === category;
    const matchesColor = !color || product.color === color;
    const matchesSize = !size || product.size === size;
    const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
    return matchesQuery && matchesCategory && matchesColor && matchesSize && matchesPrice;
  });

  if (sort === "price-asc") {
    results.sort((a, b) => a.price - b.price);
  }
  if (sort === "price-desc") {
    results.sort((a, b) => b.price - a.price);
  }
  if (sort === "newest") {
    results.sort((a, b) => b.id - a.id);
  }
  if (sort === "popular") {
    results.sort((a, b) => Number(b.flags?.bestSeller) - Number(a.flags?.bestSeller));
  }

  renderProducts(results, "searchResults");
};

const showProduct = (productId) => {
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;
  state.currentProduct = product;
  const mainImage = document.getElementById("detailMainImage");
  const thumbnails = document.getElementById("detailThumbnails");
  mainImage.style.backgroundImage = `url(${product.images[0] || ""})`;
  thumbnails.innerHTML = "";
  product.images.forEach((image) => {
    const button = document.createElement("button");
    button.style.backgroundImage = `url(${image})`;
    button.addEventListener("click", () => {
      mainImage.style.backgroundImage = `url(${image})`;
    });
    thumbnails.appendChild(button);
  });
  document.getElementById("detailName").textContent = product.name;
  document.getElementById("detailPrice").textContent = formatCurrency(product.price);
  document.getElementById("detailDescription").textContent = product.description;
  document.getElementById("detailAvailability").textContent =
    product.stock > 0 ? "Availability: In Stock" : "Availability: Out of Stock";
  const meta = document.getElementById("detailMeta");
  meta.innerHTML = "";
  [
    { label: "Category", value: product.category },
    { label: "Subcategory", value: product.subcategory },
    { label: "Material / Ingredients", value: product.material || product.ingredients },
    { label: "Color", value: product.color },
    { label: "Size", value: product.size },
    { label: "SKU", value: product.sku },
  ].forEach((item) => {
    if (!item.value) return;
    const li = document.createElement("li");
    li.textContent = `${item.label}: ${item.value}`;
    meta.appendChild(li);
  });
  document.getElementById("quantityValue").value = 1;
  fetchReviews(product.id);
  document.getElementById("product-detail").scrollIntoView({ behavior: "smooth" });
};

const addToCart = (productId, quantity) => {
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;
  const existing = state.cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    state.cart.push({ ...product, quantity });
  }
  saveCart();
  renderCart();
};

const renderCart = () => {
  const cartItems = document.getElementById("cartItems");
  cartItems.innerHTML = "";
  if (state.cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
  }
  state.cart.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${item.images[0]}" alt="${item.name}" />
      <div>
        <h4>${item.name}</h4>
        <p>${formatCurrency(item.price)}</p>
        <div class="quantity-selector">
          <button type="button" data-action="minus">-</button>
          <input type="number" min="1" value="${item.quantity}" />
          <button type="button" data-action="plus">+</button>
        </div>
        <button class="secondary" type="button" data-action="save">Save for later</button>
      </div>
      <div>
        <button class="secondary" type="button" data-action="remove">Remove</button>
      </div>
    `;
    const qtyInput = row.querySelector("input");
    row.querySelector('[data-action="minus"]').addEventListener("click", () => {
      item.quantity = Math.max(1, item.quantity - 1);
      qtyInput.value = item.quantity;
      saveCart();
      renderCart();
    });
    row.querySelector('[data-action="plus"]').addEventListener("click", () => {
      item.quantity += 1;
      qtyInput.value = item.quantity;
      saveCart();
      renderCart();
    });
    qtyInput.addEventListener("change", () => {
      item.quantity = Math.max(1, Number(qtyInput.value) || 1);
      saveCart();
      renderCart();
    });
    row.querySelector('[data-action="remove"]').addEventListener("click", () => {
      state.cart = state.cart.filter((product) => product.id !== item.id);
      saveCart();
      renderCart();
    });
    row.querySelector('[data-action="save"]').addEventListener("click", () => {
      state.cart = state.cart.filter((product) => product.id !== item.id);
      state.saved.push(item);
      saveCart();
      renderCart();
    });
    cartItems.appendChild(row);
  });

  const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  document.getElementById("cartSubtotal").textContent = formatCurrency(subtotal);
  document.getElementById("cartSavedCount").textContent = `${state.saved.length} items`;
  updateCheckoutTotals();
  updateCartCount();
};

const updateCheckoutTotals = () => {
  const delivery = document.getElementById("checkoutDelivery").value;
  const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let fee = 0;
  if (delivery === "Kaduna") fee = 1250;
  if (delivery === "Outside Kaduna") fee = 3750;
  if (delivery === "International") fee = 0;
  document.getElementById("checkoutDeliveryFee").textContent = formatCurrency(fee);
  document.getElementById("checkoutTotal").textContent = formatCurrency(subtotal + fee);
};

const handleCheckout = async (event) => {
  event.preventDefault();
  if (state.cart.length === 0) return;
  const payload = {
    fullName: document.getElementById("checkoutName").value,
    phone: document.getElementById("checkoutPhone").value,
    address: document.getElementById("checkoutAddress").value,
    deliveryLocation: document.getElementById("checkoutDelivery").value,
    paymentMethod: document.getElementById("checkoutPayment").value,
    items: state.cart.map((item) => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  };
  try {
    const response = await fetch(`${apiBase}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    const message = response.ok
      ? `Order confirmed! Order ID: ${result.orderId}. Follow us on Instagram @glow_dropaccessories.`
      : result.message || "Unable to place order.";
    document.getElementById("orderConfirmation").textContent = message;
    if (response.ok) {
      state.cart = [];
      saveCart();
      renderCart();
      event.target.reset();
    }
  } catch (error) {
    document.getElementById("orderConfirmation").textContent = "Network error. Try again.";
  }
};

const renderAccountPanel = (user) => {
  const panel = document.getElementById("accountPanel");
  panel.style.display = "block";
  panel.innerHTML = `
    <h3>Welcome, ${user.fullName}</h3>
    <p>Email: ${user.email}</p>
    <p>Phone: ${user.phone}</p>
    <button class="secondary" type="button" id="logoutButton">Log Out</button>
  `;
  document.getElementById("logoutButton").addEventListener("click", () => {
    state.customerToken = null;
    localStorage.removeItem("gda_customer_token");
    panel.style.display = "none";
  });
};

const handleRegister = async (event) => {
  event.preventDefault();
  const payload = {
    fullName: document.getElementById("registerName").value,
    email: document.getElementById("registerEmail").value,
    phone: document.getElementById("registerPhone").value,
    password: document.getElementById("registerPassword").value,
  };
  try {
    const response = await fetch(`${apiBase}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    document.getElementById("registerMessage").textContent =
      result.message || (response.ok ? "Account created." : "Unable to create account.");
  } catch (error) {
    document.getElementById("registerMessage").textContent = "Network error.";
  }
};

const handleLogin = async (event) => {
  event.preventDefault();
  const payload = {
    email: document.getElementById("loginEmail").value,
    password: document.getElementById("loginPassword").value,
  };
  try {
    const response = await fetch(`${apiBase}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) {
      document.getElementById("loginMessage").textContent = result.message || "Login failed.";
      return;
    }
    state.customerToken = result.token;
    localStorage.setItem("gda_customer_token", result.token);
    renderAccountPanel(result.user);
  } catch (error) {
    document.getElementById("loginMessage").textContent = "Network error.";
  }
};

const handleAdminLogin = async (event) => {
  event.preventDefault();
  const payload = {
    email: document.getElementById("adminEmail").value,
    password: document.getElementById("adminPassword").value,
  };
  try {
    const response = await fetch(`${apiBase}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok || result.user.role !== "admin") {
      document.getElementById("adminLoginMessage").textContent = "Admin login failed.";
      return;
    }
    state.adminToken = result.token;
    localStorage.setItem("gda_admin_token", result.token);
    document.getElementById("adminLoginMessage").textContent = "Logged in.";
    await loadAdminData();
  } catch (error) {
    document.getElementById("adminLoginMessage").textContent = "Network error.";
  }
};

const loadAdminData = async () => {
  if (!state.adminToken) return;
  try {
    const [productsResponse, ordersResponse] = await Promise.all([
      fetch(`${apiBase}/api/admin/products`, {
        headers: { Authorization: `Bearer ${state.adminToken}` },
      }),
      fetch(`${apiBase}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${state.adminToken}` },
      }),
    ]);
    const products = await productsResponse.json();
    const orders = await ordersResponse.json();
    renderAdminProducts(products);
    renderAdminOrders(orders);
  } catch (error) {
    document.getElementById("adminProducts").textContent = "Unable to load admin data.";
  }
};

const renderAdminProducts = (products) => {
  const container = document.getElementById("adminProducts");
  container.innerHTML = "";
  products.forEach((product) => {
    const row = document.createElement("div");
    row.className = "admin-product";
    row.innerHTML = `
      <div>
        <strong>${product.name}</strong>
        <p>${product.category}</p>
      </div>
      <div>
        <span>${formatCurrency(product.price)}</span>
        <button class="secondary" type="button" data-id="${product.id}">Edit</button>
        <button class="secondary" type="button" data-delete="${product.id}">Remove</button>
      </div>
    `;
    row.querySelector("[data-id]").addEventListener("click", () => fillProductForm(product));
    row.querySelector("[data-delete]").addEventListener("click", () => deleteProduct(product.id));
    container.appendChild(row);
  });
};

const renderAdminOrders = (orders) => {
  const container = document.getElementById("adminOrders");
  container.innerHTML = "";
  orders.forEach((order) => {
    const row = document.createElement("div");
    row.className = "admin-order";
    row.innerHTML = `
      <div>
        <strong>Order ${order.id}</strong>
        <p>${order.fullName} • ${order.status}</p>
      </div>
      <div>
        <span>${formatCurrency(order.total)}</span>
        <select data-status>
          <option ${order.status === "pending" ? "selected" : ""}>pending</option>
          <option ${order.status === "processing" ? "selected" : ""}>processing</option>
          <option ${order.status === "completed" ? "selected" : ""}>completed</option>
        </select>
      </div>
    `;
    row.querySelector("[data-status]").addEventListener("change", (event) =>
      updateOrderStatus(order.id, event.target.value)
    );
    container.appendChild(row);
  });
};

const fillProductForm = (product) => {
  document.getElementById("productId").value = product.id;
  document.getElementById("productName").value = product.name;
  document.getElementById("productCategory").value = product.category;
  document.getElementById("productSubcategory").value = product.subcategory || "";
  document.getElementById("productPrice").value = product.price;
  document.getElementById("productSku").value = product.sku;
  document.getElementById("productColor").value = product.color || "";
  document.getElementById("productSize").value = product.size || "";
  document.getElementById("productMaterial").value = product.material || product.ingredients || "";
  document.getElementById("productStock").value = product.stock;
  document.getElementById("productDescription").value = product.description;
  document.getElementById("flagFeatured").checked = product.flags?.featured;
  document.getElementById("flagBest").checked = product.flags?.bestSeller;
  document.getElementById("flagNew").checked = product.flags?.newArrival;
  document.getElementById("flagTrending").checked = product.flags?.trending;
  document.getElementById("flagOffer").checked = product.flags?.offer;
};

const saveProduct = async (event) => {
  event.preventDefault();
  if (!state.adminToken) {
    document.getElementById("productMessage").textContent = "Admin login required.";
    return;
  }
  const id = document.getElementById("productId").value;
  const payload = {
    name: document.getElementById("productName").value,
    category: document.getElementById("productCategory").value,
    subcategory: document.getElementById("productSubcategory").value,
    price: Number(document.getElementById("productPrice").value),
    sku: document.getElementById("productSku").value,
    color: document.getElementById("productColor").value,
    size: document.getElementById("productSize").value,
    material: document.getElementById("productMaterial").value,
    stock: Number(document.getElementById("productStock").value),
    description: document.getElementById("productDescription").value,
    flags: {
      featured: document.getElementById("flagFeatured").checked,
      bestSeller: document.getElementById("flagBest").checked,
      newArrival: document.getElementById("flagNew").checked,
      trending: document.getElementById("flagTrending").checked,
      offer: document.getElementById("flagOffer").checked,
    },
  };
  const url = id ? `${apiBase}/api/admin/products/${id}` : `${apiBase}/api/admin/products`;
  const method = id ? "PUT" : "POST";
  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${state.adminToken}`,
      },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    document.getElementById("productMessage").textContent =
      result.message || (response.ok ? "Saved." : "Unable to save.");
    if (response.ok) {
      event.target.reset();
      await loadAdminData();
    }
  } catch (error) {
    document.getElementById("productMessage").textContent = "Network error.";
  }
};

const deleteProduct = async (id) => {
  if (!state.adminToken) return;
  try {
    await fetch(`${apiBase}/api/admin/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${state.adminToken}` },
    });
    await loadAdminData();
  } catch (error) {
    document.getElementById("productMessage").textContent = "Unable to delete.";
  }
};

const updateOrderStatus = async (id, status) => {
  if (!state.adminToken) return;
  try {
    await fetch(`${apiBase}/api/admin/orders/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${state.adminToken}`,
      },
      body: JSON.stringify({ status }),
    });
  } catch (error) {
    document.getElementById("adminOrders").textContent = "Unable to update order.";
  }
};

const fetchReviews = async (productId) => {
  try {
    const response = await fetch(`${apiBase}/api/products/${productId}/reviews`);
    const reviews = await response.json();
    renderReviews(reviews);
  } catch (error) {
    renderReviews([]);
  }
};

const renderReviews = (reviews) => {
  const container = document.getElementById("reviewList");
  container.innerHTML = "";
  if (!reviews.length) {
    container.innerHTML = "<p>No reviews yet.</p>";
    return;
  }
  reviews.forEach((review) => {
    const card = document.createElement("div");
    card.className = "review-card";
    card.innerHTML = `<strong>${review.customerName}</strong> • ${"★".repeat(review.rating)}<p>${review.comment}</p>`;
    container.appendChild(card);
  });
};

const submitReview = async (event) => {
  event.preventDefault();
  if (!state.currentProduct) return;
  const payload = {
    customerName: document.getElementById("reviewName").value,
    rating: Number(document.getElementById("reviewRating").value),
    comment: document.getElementById("reviewComment").value,
  };
  try {
    await fetch(`${apiBase}/api/products/${state.currentProduct.id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    event.target.reset();
    fetchReviews(state.currentProduct.id);
  } catch (error) {
    document.getElementById("reviewList").textContent = "Unable to submit review.";
  }
};

const initialize = async () => {
  loadCart();
  updateCartCount();
  state.adminToken = localStorage.getItem("gda_admin_token");
  state.customerToken = localStorage.getItem("gda_customer_token");

  try {
    const [categoriesResponse, productsResponse] = await Promise.all([
      fetch(`${apiBase}/api/categories`),
      fetch(`${apiBase}/api/products`),
    ]);
    const categories = await categoriesResponse.json();
    const products = await productsResponse.json();
    state.categories = categories.length ? categories : fallbackCategories;
    state.products = products.length ? products : fallbackProducts;
  } catch (error) {
    state.categories = fallbackCategories;
    state.products = fallbackProducts;
  }

  renderCategories();
  renderFilters();
  renderProducts(state.products.filter((product) => product.flags?.featured), "featuredGrid");
  renderProducts(state.products.filter((product) => product.flags?.bestSeller), "bestSellerGrid");
  renderProducts(state.products.filter((product) => product.flags?.newArrival), "newArrivalGrid");
  renderProducts(state.products.filter((product) => product.flags?.trending), "trendingGrid");
  renderProducts(state.products.filter((product) => product.flags?.offer), "offerGrid");
  renderProducts(state.products, "searchResults");
  showProduct(state.products[0]?.id || 1);
  renderCart();
  if (state.adminToken) {
    loadAdminData();
  }
};

document.getElementById("applyFilters").addEventListener("click", applyFilters);
document.getElementById("searchButton").addEventListener("click", applyFilters);
document.getElementById("searchInput").addEventListener("keyup", (event) => {
  if (event.key === "Enter") applyFilters();
});

document.getElementById("quantityMinus").addEventListener("click", () => {
  const input = document.getElementById("quantityValue");
  input.value = Math.max(1, Number(input.value) - 1);
});

document.getElementById("quantityPlus").addEventListener("click", () => {
  const input = document.getElementById("quantityValue");
  input.value = Number(input.value) + 1;
});

document.getElementById("addToCart").addEventListener("click", () => {
  if (!state.currentProduct) return;
  const quantity = Number(document.getElementById("quantityValue").value || 1);
  addToCart(state.currentProduct.id, quantity);
});

document.getElementById("buyNow").addEventListener("click", () => {
  if (!state.currentProduct) return;
  const quantity = Number(document.getElementById("quantityValue").value || 1);
  addToCart(state.currentProduct.id, quantity);
  document.getElementById("checkout").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("checkoutDelivery").addEventListener("change", updateCheckoutTotals);
document.getElementById("checkoutForm").addEventListener("submit", handleCheckout);
document.getElementById("registerForm").addEventListener("submit", handleRegister);
document.getElementById("loginForm").addEventListener("submit", handleLogin);
document.getElementById("adminLoginForm").addEventListener("submit", handleAdminLogin);
document.getElementById("productForm").addEventListener("submit", saveProduct);
document.getElementById("reviewForm").addEventListener("submit", submitReview);
document.getElementById("contactForm").addEventListener("submit", (event) => {
  event.preventDefault();
  document.getElementById("contactMessageStatus").textContent = "Thanks! We will reply soon.";
  event.target.reset();
});

document.querySelectorAll('[data-action="whatsapp"]').forEach((button) => {
  button.addEventListener("click", () => {
    window.open("https://wa.me/2340000000000", "_blank");
  });
});

initialize();