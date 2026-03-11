const express = require("express");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, "database.db");

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "2mb" }));

const db = new sqlite3.Database(DB_PATH);

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

const hashPassword = (password, salt = crypto.randomBytes(16).toString("hex")) => {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
};

const verifyPassword = (password, storedHash) => {
  const [salt, hash] = storedHash.split(":");
  const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return hash === verifyHash;
};

const createToken = () => crypto.randomBytes(24).toString("hex");

const initDatabase = async () => {
  await run(
    `CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      description TEXT,
      slug TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  );
  await run(
    `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category_id INTEGER,
      category TEXT,
      subcategory TEXT,
      price REAL NOT NULL,
      description TEXT,
      material TEXT,
      color TEXT,
      size TEXT,
      ingredients TEXT,
      stock INTEGER DEFAULT 0,
      sku TEXT UNIQUE,
      is_featured INTEGER DEFAULT 0,
      is_best_seller INTEGER DEFAULT 0,
      is_new_arrival INTEGER DEFAULT 0,
      is_trending INTEGER DEFAULT 0,
      is_special_offer INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  );
  await run(
    `CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      url TEXT,
      alt TEXT,
      sort_order INTEGER DEFAULT 0
    )`
  );
  await run(
    `CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      customer_name TEXT,
      rating INTEGER,
      comment TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  );
  await run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT,
      email TEXT UNIQUE,
      phone TEXT,
      password_hash TEXT,
      role TEXT DEFAULT 'customer',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  );
  await run(
    `CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      full_name TEXT,
      phone TEXT,
      address TEXT,
      delivery_location TEXT,
      delivery_fee REAL,
      subtotal REAL,
      total REAL,
      payment_method TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  );
  await run(
    `CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      product_id INTEGER,
      product_name TEXT,
      price REAL,
      quantity INTEGER,
      line_total REAL
    )`
  );
  await run(
    `CREATE TABLE IF NOT EXISTS tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      token TEXT,
      expires_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  );

  const categoryCount = await get("SELECT COUNT(*) as count FROM categories");
  if (categoryCount.count === 0) {
    const categories = [
      ["Blue Light Glasses", "Computer glasses and fashion eyewear", "blue-light-glasses"],
      ["Beaded Accessories", "Bracelets, necklaces, waist beads", "beaded-accessories"],
      ["Hair Accessories", "Clips, headbands, scrunchies", "hair-accessories"],
      ["Jewellery", "Necklaces, rings, pendant sets", "jewellery"],
      ["Shoes", "Sandals, heels, casual shoes", "shoes"],
      ["Lip Gloss", "Clear, shimmer, tinted, hydrating", "lip-gloss"],
      ["Skincare Products", "Serums, moisturizers, oils", "skincare"],
    ];
    for (const category of categories) {
      await run("INSERT INTO categories (name, description, slug) VALUES (?, ?, ?)", category);
    }
  }

  const productCount = await get("SELECT COUNT(*) as count FROM products");
  if (productCount.count === 0) {
    await run(
      `INSERT INTO products
        (name, category, subcategory, price, description, material, color, size, ingredients, stock, sku, is_featured, is_best_seller, is_new_arrival, is_trending, is_special_offer)
       VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      , [
        "Luxe Blue Light Glasses",
        "Blue Light Glasses",
        "Computer glasses",
        8500,
        "Anti-blue light glasses with amber tint.",
        "Acetate",
        "Amber",
        "Medium",
        "",
        18,
        "GDA-BLG-001",
        1,
        1,
        0,
        1,
        0,
      ]
    );
    await run(
      `INSERT INTO products
        (name, category, subcategory, price, description, material, color, size, ingredients, stock, sku, is_featured, is_best_seller, is_new_arrival, is_trending, is_special_offer)
       VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      , [
        "Golden Glow Beaded Bracelet",
        "Beaded Accessories",
        "Beaded bracelets",
        3200,
        "Handcrafted beaded bracelet with gold accents.",
        "Glass beads",
        "Gold",
        "Adjustable",
        "",
        40,
        "GDA-BA-002",
        1,
        0,
        1,
        1,
        1,
      ]
    );
    const productRows = await all("SELECT id, name FROM products");
    for (const product of productRows) {
      await run(
        "INSERT INTO product_images (product_id, url, alt, sort_order) VALUES (?, ?, ?, ?)",
        [
          product.id,
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
          `${product.name} image`,
          0,
        ]
      );
    }
  }

  const admin = await get("SELECT * FROM users WHERE role = 'admin'");
  if (!admin) {
    const passwordHash = hashPassword("glowdrop123");
    await run(
      "INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)",
      ["Glow Drop Admin", "admin@glowdrop.com", "+2340000000000", passwordHash, "admin"]
    );
  }
};

const calculateDeliveryFee = (location) => {
  if (location === "Kaduna") return 1250;
  if (location === "Outside Kaduna") return 3750;
  if (location === "International") return 0;
  return 0;
};

const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Missing token." });
  const token = header.replace("Bearer ", "");
  const tokenRow = await get("SELECT * FROM tokens WHERE token = ?", [token]);
  if (!tokenRow) return res.status(401).json({ message: "Invalid token." });
  const user = await get("SELECT id, full_name, email, phone, role FROM users WHERE id = ?", [tokenRow.user_id]);
  if (!user) return res.status(401).json({ message: "User not found." });
  req.user = user;
  next();
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  next();
};

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/categories", async (req, res) => {
  const categories = await all("SELECT id, name, description, slug FROM categories ORDER BY name");
  res.json(categories);
});

app.get("/api/products", async (req, res) => {
  const { category, search, minPrice, maxPrice, sort, color, size, featured, best, newest, trending, offer } = req.query;
  const filters = [];
  const params = [];
  if (category) {
    filters.push("category = ?");
    params.push(category);
  }
  if (search) {
    filters.push("(name LIKE ? OR description LIKE ? OR category LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (minPrice) {
    filters.push("price >= ?");
    params.push(Number(minPrice));
  }
  if (maxPrice) {
    filters.push("price <= ?");
    params.push(Number(maxPrice));
  }
  if (color) {
    filters.push("color = ?");
    params.push(color);
  }
  if (size) {
    filters.push("size = ?");
    params.push(size);
  }
  if (featured) filters.push("is_featured = 1");
  if (best) filters.push("is_best_seller = 1");
  if (newest) filters.push("is_new_arrival = 1");
  if (trending) filters.push("is_trending = 1");
  if (offer) filters.push("is_special_offer = 1");
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  let order = "ORDER BY created_at DESC";
  if (sort === "price-asc") order = "ORDER BY price ASC";
  if (sort === "price-desc") order = "ORDER BY price DESC";
  if (sort === "popular") order = "ORDER BY is_best_seller DESC";
  const products = await all(`SELECT * FROM products ${where} ${order}` , params);
  const productIds = products.map((product) => product.id);
  const images = productIds.length
    ? await all(
        `SELECT product_id, url, alt, sort_order FROM product_images WHERE product_id IN (${productIds
          .map(() => "?")
          .join(",")}) ORDER BY sort_order ASC`,
        productIds
      )
    : [];
  const groupedImages = images.reduce((acc, image) => {
    acc[image.product_id] = acc[image.product_id] || [];
    acc[image.product_id].push(image.url);
    return acc;
  }, {});
  res.json(
    products.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      subcategory: product.subcategory,
      price: product.price,
      description: product.description,
      material: product.material,
      color: product.color,
      size: product.size,
      ingredients: product.ingredients,
      stock: product.stock,
      sku: product.sku,
      images: groupedImages[product.id] || [],
      flags: {
        featured: Boolean(product.is_featured),
        bestSeller: Boolean(product.is_best_seller),
        newArrival: Boolean(product.is_new_arrival),
        trending: Boolean(product.is_trending),
        offer: Boolean(product.is_special_offer),
      },
    }))
  );
});

app.get("/api/products/:id", async (req, res) => {
  const product = await get("SELECT * FROM products WHERE id = ?", [req.params.id]);
  if (!product) return res.status(404).json({ message: "Product not found." });
  const images = await all(
    "SELECT url, alt, sort_order FROM product_images WHERE product_id = ? ORDER BY sort_order ASC",
    [req.params.id]
  );
  const reviews = await all(
    "SELECT customer_name as customerName, rating, comment, created_at as createdAt FROM reviews WHERE product_id = ? ORDER BY created_at DESC",
    [req.params.id]
  );
  res.json({
    ...product,
    images,
    reviews,
  });
});

app.get("/api/products/:id/reviews", async (req, res) => {
  const reviews = await all(
    "SELECT customer_name as customerName, rating, comment, created_at as createdAt FROM reviews WHERE product_id = ? ORDER BY created_at DESC",
    [req.params.id]
  );
  res.json(reviews);
});

app.post("/api/products/:id/reviews", async (req, res) => {
  const { customerName, rating, comment } = req.body;
  if (!customerName || !rating || !comment) {
    return res.status(400).json({ message: "Missing review fields." });
  }
  await run(
    "INSERT INTO reviews (product_id, customer_name, rating, comment) VALUES (?, ?, ?, ?)",
    [req.params.id, customerName, rating, comment]
  );
  res.json({ message: "Review submitted." });
});

app.post("/api/auth/register", async (req, res) => {
  const { fullName, email, phone, password } = req.body;
  if (!fullName || !email || !phone || !password) {
    return res.status(400).json({ message: "Missing fields." });
  }
  const existing = await get("SELECT id FROM users WHERE email = ?", [email]);
  if (existing) return res.status(400).json({ message: "Email already registered." });
  const passwordHash = hashPassword(password);
  await run(
    "INSERT INTO users (full_name, email, phone, password_hash) VALUES (?, ?, ?, ?)",
    [fullName, email, phone, passwordHash]
  );
  res.json({ message: "Account created." });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Missing fields." });
  }
  const user = await get("SELECT * FROM users WHERE email = ?", [email]);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ message: "Invalid credentials." });
  }
  const token = createToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
  await run("INSERT INTO tokens (user_id, token, expires_at) VALUES (?, ?, ?)", [user.id, token, expiresAt]);
  res.json({
    token,
    user: { id: user.id, fullName: user.full_name, email: user.email, phone: user.phone, role: user.role },
  });
});

app.post("/api/orders", async (req, res) => {
  const { fullName, phone, address, deliveryLocation, paymentMethod, items } = req.body;
  if (!fullName || !phone || !address || !deliveryLocation || !paymentMethod || !items?.length) {
    return res.status(400).json({ message: "Missing order details." });
  }
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = calculateDeliveryFee(deliveryLocation);
  const total = subtotal + deliveryFee;
  const orderResult = await run(
    `INSERT INTO orders
      (user_id, full_name, phone, address, delivery_location, delivery_fee, subtotal, total, payment_method)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    , [
      null,
      fullName,
      phone,
      address,
      deliveryLocation,
      deliveryFee,
      subtotal,
      total,
      paymentMethod,
    ]
  );
  const orderId = orderResult.lastID;
  for (const item of items) {
    await run(
      "INSERT INTO order_items (order_id, product_id, product_name, price, quantity, line_total) VALUES (?, ?, ?, ?, ?, ?)",
      [orderId, item.productId, item.name, item.price, item.quantity, item.price * item.quantity]
    );
  }
  res.json({ orderId, deliveryFee, total });
});

app.get("/api/admin/products", authMiddleware, adminMiddleware, async (req, res) => {
  const products = await all("SELECT * FROM products ORDER BY created_at DESC");
  res.json(products.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    subcategory: product.subcategory,
    price: product.price,
    description: product.description,
    material: product.material,
    ingredients: product.ingredients,
    color: product.color,
    size: product.size,
    stock: product.stock,
    sku: product.sku,
    flags: {
      featured: Boolean(product.is_featured),
      bestSeller: Boolean(product.is_best_seller),
      newArrival: Boolean(product.is_new_arrival),
      trending: Boolean(product.is_trending),
      offer: Boolean(product.is_special_offer),
    },
  })));
});

app.post("/api/admin/products", authMiddleware, adminMiddleware, async (req, res) => {
  const { name, category, subcategory, price, description, material, color, size, stock, sku, flags } = req.body;
  if (!name || !category || !price || !stock || !sku) {
    return res.status(400).json({ message: "Missing product fields." });
  }
  await run(
    `INSERT INTO products
      (name, category, subcategory, price, description, material, color, size, stock, sku, is_featured, is_best_seller, is_new_arrival, is_trending, is_special_offer)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    , [
      name,
      category,
      subcategory || "",
      price,
      description || "",
      material || "",
      color || "",
      size || "",
      stock,
      sku,
      flags?.featured ? 1 : 0,
      flags?.bestSeller ? 1 : 0,
      flags?.newArrival ? 1 : 0,
      flags?.trending ? 1 : 0,
      flags?.offer ? 1 : 0,
    ]
  );
  res.json({ message: "Product created." });
});

app.put("/api/admin/products/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const { name, category, subcategory, price, description, material, color, size, stock, sku, flags } = req.body;
  await run(
    `UPDATE products SET
      name = ?, category = ?, subcategory = ?, price = ?, description = ?, material = ?, color = ?, size = ?, stock = ?, sku = ?,
      is_featured = ?, is_best_seller = ?, is_new_arrival = ?, is_trending = ?, is_special_offer = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
    , [
      name,
      category,
      subcategory || "",
      price,
      description || "",
      material || "",
      color || "",
      size || "",
      stock,
      sku,
      flags?.featured ? 1 : 0,
      flags?.bestSeller ? 1 : 0,
      flags?.newArrival ? 1 : 0,
      flags?.trending ? 1 : 0,
      flags?.offer ? 1 : 0,
      req.params.id,
    ]
  );
  res.json({ message: "Product updated." });
});

app.delete("/api/admin/products/:id", authMiddleware, adminMiddleware, async (req, res) => {
  await run("DELETE FROM products WHERE id = ?", [req.params.id]);
  await run("DELETE FROM product_images WHERE product_id = ?", [req.params.id]);
  res.json({ message: "Product deleted." });
});

app.get("/api/admin/orders", authMiddleware, adminMiddleware, async (req, res) => {
  const orders = await all("SELECT * FROM orders ORDER BY created_at DESC");
  res.json(orders.map((order) => ({
    id: order.id,
    fullName: order.full_name,
    phone: order.phone,
    address: order.address,
    deliveryLocation: order.delivery_location,
    deliveryFee: order.delivery_fee,
    subtotal: order.subtotal,
    total: order.total,
    paymentMethod: order.payment_method,
    status: order.status,
    createdAt: order.created_at,
  })));
});

app.put("/api/admin/orders/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const { status } = req.body;
  await run("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id]);
  res.json({ message: "Order updated." });
});

app.listen(PORT, "0.0.0.0", async () => {
  await initDatabase();
  console.log(`Glow Drop Accessories API running on ${PORT}`);
});