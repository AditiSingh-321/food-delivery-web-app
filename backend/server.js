import http from "node:http";
import { admins, foods, orders, users } from "./data.js";

const PORT = process.env.PORT || 4000;

const sendJson = (res, status, data) => {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  });
  res.end(JSON.stringify(data));
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
  });

const createToken = (email) => Buffer.from(`${email}:${Date.now()}`).toString("base64url");

const getOrderStats = () => {
  const revenue = orders.reduce((total, order) => total + Number(order.totals?.total || 0), 0);
  const delivered = orders.filter((order) => order.status === "Delivered").length;
  const active = orders.filter((order) => order.status !== "Delivered" && order.status !== "Cancelled").length;
  const customers = orders.reduce((map, order) => {
    const email = order.customer?.email || "unknown";
    map[email] = {
      email,
      name: order.customer?.name || "Guest",
      orders: (map[email]?.orders || 0) + 1,
      totalSpent: (map[email]?.totalSpent || 0) + Number(order.totals?.total || 0)
    };
    return map;
  }, {});

  return {
    totalOrders: orders.length,
    delivered,
    active,
    revenue,
    customerFrequency: Object.values(customers).sort((a, b) => b.orders - a.orders)
  };
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "OPTIONS") {
    return sendJson(res, 200, {});
  }

  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      return sendJson(res, 200, { status: "ok", service: "food-delivery-backend" });
    }

    if (req.method === "GET" && url.pathname === "/api/foods") {
      const search = url.searchParams.get("search")?.toLowerCase() || "";
      const category = url.searchParams.get("category") || "All";
      const result = foods.filter((food) => {
        const matchesCategory = category === "All" || food.category === category;
        const matchesSearch =
          !search ||
          food.name.toLowerCase().includes(search) ||
          food.category.toLowerCase().includes(search);
        return matchesCategory && matchesSearch;
      });
      return sendJson(res, 200, { success: true, data: result });
    }

    if (req.method === "POST" && url.pathname === "/api/auth/signup") {
      const { name, email, password } = await readBody(req);
      if (!name || !email || !password) {
        return sendJson(res, 400, { success: false, message: "Name, email, and password are required." });
      }
      if (users.some((user) => user.email === email)) {
        return sendJson(res, 409, { success: false, message: "User already exists." });
      }
      const user = { id: `${Date.now()}`, name, email, password };
      users.push(user);
      return sendJson(res, 201, {
        success: true,
        token: createToken(email),
        user: { id: user.id, name: user.name, email: user.email }
      });
    }

    if (req.method === "POST" && url.pathname === "/api/auth/login") {
      const { email, password } = await readBody(req);
      const user = users.find((item) => item.email === email && item.password === password);
      if (!user) {
        return sendJson(res, 401, { success: false, message: "Invalid email or password." });
      }
      return sendJson(res, 200, {
        success: true,
        token: createToken(email),
        user: { id: user.id, name: user.name, email: user.email }
      });
    }

    if (req.method === "POST" && url.pathname === "/api/admin/login") {
      const { email, password } = await readBody(req);
      const admin = admins.find((item) => item.email === email && item.password === password);
      if (!admin) {
        return sendJson(res, 401, { success: false, message: "Invalid restaurant login." });
      }
      return sendJson(res, 200, {
        success: true,
        token: createToken(email),
        admin: { name: admin.name, email: admin.email }
      });
    }

    if (req.method === "POST" && url.pathname === "/api/orders") {
      const { customer, address, cartItems, items, paymentMethod, totals } = await readBody(req);
      if (!customer?.email || !address?.street || !cartItems || Object.keys(cartItems).length === 0) {
        return sendJson(res, 400, { success: false, message: "Customer, address, and cart items are required." });
      }
      const order = {
        id: `ORD-${Date.now()}`,
        customer,
        address,
        cartItems,
        items: items || [],
        paymentMethod: paymentMethod || "Cash on delivery",
        totals,
        status: "Preparing",
        createdAt: new Date().toISOString()
      };
      orders.unshift(order);
      return sendJson(res, 201, { success: true, data: order });
    }

    if (req.method === "GET" && url.pathname === "/api/orders") {
      const email = url.searchParams.get("email");
      const result = email ? orders.filter((order) => order.customer.email === email) : orders;
      return sendJson(res, 200, { success: true, data: result });
    }

    if (req.method === "PATCH" && url.pathname.startsWith("/api/orders/")) {
      const orderId = decodeURIComponent(url.pathname.split("/").pop());
      const { status } = await readBody(req);
      const allowedStatuses = ["Preparing", "Ready", "Out for delivery", "Delivered", "Cancelled"];
      if (!allowedStatuses.includes(status)) {
        return sendJson(res, 400, { success: false, message: "Invalid order status." });
      }
      const order = orders.find((item) => item.id === orderId);
      if (!order) {
        return sendJson(res, 404, { success: false, message: "Order not found." });
      }
      order.status = status;
      order.updatedAt = new Date().toISOString();
      return sendJson(res, 200, { success: true, data: order });
    }

    if (req.method === "GET" && url.pathname === "/api/admin/stats") {
      return sendJson(res, 200, { success: true, data: getOrderStats() });
    }

    return sendJson(res, 404, { success: false, message: "Route not found." });
  } catch (error) {
    return sendJson(res, 500, { success: false, message: error.message || "Server error." });
  }
});

server.listen(PORT, () => {
  console.log(`Food delivery backend running on http://localhost:${PORT}`);
});
