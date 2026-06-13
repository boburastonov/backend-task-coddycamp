import {
  BarChart3,
  PackagePlus,
  RefreshCcw,
  Save,
  Send,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

import MessageBox from "../components/MessageBox.jsx";
import api, { getErrorMessage } from "../lib/api.js";
import { useAuthStore } from "../store/authStore.js";

const emptyProduct = {
  title: "",
  description: "",
  price: "",
  stock: "",
  category: "General",
  isActive: true,
};

const emptyOrder = {
  product: "",
  quantity: 1,
  deliveryAddress: "",
  note: "",
};

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function statusClass(status) {
  if (["completed", "done"].includes(status)) return "text-[var(--success)]";
  if (status === "cancelled") return "text-[var(--danger)]";
  if (status === "new") return "text-[var(--warning)]";
  return "text-[var(--primary)]";
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const isAdmin = user?.role === "admin";

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingProductId, setEditingProductId] = useState(null);
  const [orderForm, setOrderForm] = useState(emptyOrder);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    telegramId: user?.telegramId || "",
  });
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadData();
    const timer = window.setInterval(loadData, 15000);
    return () => window.clearInterval(timer);
  }, [isAdmin]);

  useEffect(() => {
    if (products.length && !orderForm.product) {
      setOrderForm((current) => ({ ...current, product: products[0]._id }));
    }
  }, [products, orderForm.product]);

  async function loadData() {
    try {
      setError("");
      const requests = [
        api.get("/products", { params: { limit: 50, active: isAdmin ? undefined : true } }),
        api.get("/orders", { params: { limit: 50 } }),
      ];

      if (isAdmin) {
        requests.push(api.get("/admin/stats"));
        requests.push(api.get("/admin/users"));
      }

      const responses = await Promise.all(requests);
      setProducts(responses[0].data.items);
      setOrders(responses[1].data.items);

      if (isAdmin) {
        setStats(responses[2].data);
        setUsers(responses[3].data.items);
      }
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }

  function showSuccess(message) {
    setSuccess(message);
    window.setTimeout(() => setSuccess(""), 3500);
  }

  async function handleProductSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      ...productForm,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
    };

    try {
      if (editingProductId) {
        await api.put(`/products/${editingProductId}`, payload);
        showSuccess("Product updated.");
      } else {
        await api.post("/products", payload);
        showSuccess("Product created.");
      }

      setProductForm(emptyProduct);
      setEditingProductId(null);
      await loadData();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(productId) {
    if (!window.confirm("Delete this product?")) return;

    try {
      await api.delete(`/products/${productId}`);
      showSuccess("Product deleted.");
      await loadData();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    }
  }

  async function handleOrderSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      await api.post("/orders", {
        items: [{ product: orderForm.product, quantity: Number(orderForm.quantity) }],
        deliveryAddress: orderForm.deliveryAddress,
        note: orderForm.note,
      });
      setOrderForm({ ...emptyOrder, product: products[0]?._id || "" });
      showSuccess("Order created and Telegram notification sent.");
      await loadData();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSaving(false);
    }
  }

  async function updateOrderStatus(orderId, status) {
    try {
      await api.put(`/orders/${orderId}`, { status });
      showSuccess("Order status updated.");
      await loadData();
    } catch (updateError) {
      setError(getErrorMessage(updateError));
    }
  }

  async function deleteOrder(orderId) {
    if (!window.confirm("Delete this order?")) return;

    try {
      await api.delete(`/orders/${orderId}`);
      showSuccess("Order deleted.");
      await loadData();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    }
  }

  async function updateProfile(event) {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await api.put("/users/me", profileForm);
      setUser(response.data);
      showSuccess("Profile updated.");
    } catch (profileError) {
      setError(getErrorMessage(profileError));
    } finally {
      setSaving(false);
    }
  }

  async function sendBroadcast(event) {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await api.post("/admin/broadcast", { message: broadcastMessage });
      setBroadcastMessage("");
      showSuccess(`Broadcast sent: ${response.data.sent}, failed: ${response.data.failed}.`);
    } catch (broadcastError) {
      setError(getErrorMessage(broadcastError));
    } finally {
      setSaving(false);
    }
  }

  async function updateUserRole(userId, role) {
    try {
      const response = await api.patch(`/admin/users/${userId}/role`, { role });
      setUsers((currentUsers) =>
        currentUsers.map((item) => (item._id === userId ? response.data : item)),
      );
      showSuccess("User role updated.");
    } catch (roleError) {
      setError(getErrorMessage(roleError));
    }
  }

  function beginProductEdit(product) {
    setEditingProductId(product._id);
    setProductForm({
      title: product.title,
      description: product.description || "",
      price: String(product.price),
      stock: String(product.stock),
      category: product.category,
      isActive: product.isActive,
    });
  }

  return (
    <main className="mx-auto max-w-7xl space-y-4 px-4 py-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-sm text-[var(--muted)]">
            {isAdmin ? "Admin" : "User"} account: {user?.name}
          </p>
        </div>
        <button className="btn btn-ghost" disabled={loading} onClick={loadData} type="button">
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      {error ? <MessageBox>{error}</MessageBox> : null}
      {success ? <MessageBox type="success">{success}</MessageBox> : null}

      {isAdmin ? (
        <section className="grid gap-3 md:grid-cols-4">
          {[
            ["Users", stats?.users ?? 0],
            ["Products", stats?.products ?? 0],
            ["Orders", stats?.orders ?? 0],
            ["Revenue", formatMoney(stats?.revenue ?? 0)],
          ].map(([label, value]) => (
            <article className="panel p-4" key={label}>
              <p className="text-sm text-[var(--muted)]">{label}</p>
              <p className="mt-1 text-2xl font-bold">{value}</p>
            </article>
          ))}
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <div className="space-y-4">
          <section className="panel p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold">Products</h3>
              <span className="badge">{products.length} items</span>
            </div>

            {isAdmin ? (
              <form className="mb-4 grid gap-3 lg:grid-cols-6" onSubmit={handleProductSubmit}>
                <input className="field lg:col-span-2" onChange={(event) => setProductForm({ ...productForm, title: event.target.value })} placeholder="Title" required value={productForm.title} />
                <input className="field" min="0" onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} placeholder="Price" required type="number" value={productForm.price} />
                <input className="field" min="0" onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} placeholder="Stock" required type="number" value={productForm.stock} />
                <input className="field" onChange={(event) => setProductForm({ ...productForm, category: event.target.value })} placeholder="Category" value={productForm.category} />
                <label className="flex items-center gap-2 text-sm font-bold">
                  <input checked={productForm.isActive} onChange={(event) => setProductForm({ ...productForm, isActive: event.target.checked })} type="checkbox" />
                  Active
                </label>
                <textarea className="field lg:col-span-5" onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} placeholder="Description" value={productForm.description} />
                <div className="flex gap-2">
                  <button className="btn btn-primary" disabled={saving} type="submit">
                    <PackagePlus size={16} />
                    {editingProductId ? "Update" : "Create"}
                  </button>
                  {editingProductId ? (
                    <button className="btn btn-ghost" onClick={() => { setEditingProductId(null); setProductForm(emptyProduct); }} type="button">
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>
            ) : (
              <form className="mb-4 grid gap-3 lg:grid-cols-[1fr_100px_1fr_1fr_auto]" onSubmit={handleOrderSubmit}>
                <select className="field" onChange={(event) => setOrderForm({ ...orderForm, product: event.target.value })} required value={orderForm.product}>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.title} - {formatMoney(product.price)}
                    </option>
                  ))}
                </select>
                <input className="field" min="1" onChange={(event) => setOrderForm({ ...orderForm, quantity: event.target.value })} type="number" value={orderForm.quantity} />
                <input className="field" onChange={(event) => setOrderForm({ ...orderForm, deliveryAddress: event.target.value })} placeholder="Delivery address" value={orderForm.deliveryAddress} />
                <input className="field" onChange={(event) => setOrderForm({ ...orderForm, note: event.target.value })} placeholder="Note" value={orderForm.note} />
                <button className="btn btn-primary" disabled={saving || !products.length} type="submit">
                  <ShoppingCart size={16} />
                  Order
                </button>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--line)] text-left text-[var(--muted)]">
                    <th className="py-2 pr-3">Title</th>
                    <th className="py-2 pr-3">Category</th>
                    <th className="py-2 pr-3">Price</th>
                    <th className="py-2 pr-3">Stock</th>
                    <th className="py-2 pr-3">Status</th>
                    {isAdmin ? <th className="py-2 pr-3">Actions</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr className="border-b border-[var(--line)]" key={product._id}>
                      <td className="py-3 pr-3 font-bold">{product.title}</td>
                      <td className="py-3 pr-3">{product.category}</td>
                      <td className="py-3 pr-3">{formatMoney(product.price)}</td>
                      <td className="py-3 pr-3">{product.stock}</td>
                      <td className="py-3 pr-3">
                        <span className="badge">{product.isActive ? "Active" : "Hidden"}</span>
                      </td>
                      {isAdmin ? (
                        <td className="py-3 pr-3">
                          <div className="flex gap-2">
                            <button className="btn btn-ghost" onClick={() => beginProductEdit(product)} type="button">
                              <Save size={16} />
                              Edit
                            </button>
                            <button className="btn btn-danger" onClick={() => deleteProduct(product._id)} type="button">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
              {!products.length ? <p className="py-4 text-sm text-[var(--muted)]">No products found.</p> : null}
            </div>
          </section>

          <section className="panel p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold">Orders</h3>
              <span className="badge">{orders.length} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--line)] text-left text-[var(--muted)]">
                    <th className="py-2 pr-3">Order</th>
                    <th className="py-2 pr-3">Customer</th>
                    <th className="py-2 pr-3">Items</th>
                    <th className="py-2 pr-3">Total</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr className="border-b border-[var(--line)]" key={order._id}>
                      <td className="py-3 pr-3 font-mono text-xs">{order._id.slice(-8)}</td>
                      <td className="py-3 pr-3">{order.customer?.name || user?.name}</td>
                      <td className="py-3 pr-3">
                        {order.items.map((item) => `${item.title} x${item.quantity}`).join(", ")}
                      </td>
                      <td className="py-3 pr-3 font-bold">{formatMoney(order.total)}</td>
                      <td className={`py-3 pr-3 font-bold ${statusClass(order.status)}`}>{order.status}</td>
                      <td className="py-3 pr-3">
                        <div className="flex flex-wrap gap-2">
                          {isAdmin ? (
                            <select className="field max-w-36" onChange={(event) => updateOrderStatus(order._id, event.target.value)} value={order.status}>
                              <option value="new">New</option>
                              <option value="accepted">Accepted</option>
                              <option value="sent">Sent</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          ) : null}
                          <button className="btn btn-danger" onClick={() => deleteOrder(order._id)} type="button">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!orders.length ? <p className="py-4 text-sm text-[var(--muted)]">No orders found.</p> : null}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="panel p-4">
            <h3 className="mb-3 font-bold">Profile</h3>
            <form className="space-y-3" onSubmit={updateProfile}>
              <input className="field" onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })} placeholder="Name" value={profileForm.name} />
              <input className="field" onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })} placeholder="Phone" value={profileForm.phone} />
              <input className="field" onChange={(event) => setProfileForm({ ...profileForm, telegramId: event.target.value })} placeholder="Telegram ID" value={profileForm.telegramId} />
              <button className="btn btn-primary w-full" disabled={saving} type="submit">
                <Save size={16} />
                Save profile
              </button>
            </form>
          </section>

          {isAdmin ? (
            <>
              <section className="panel p-4">
                <h3 className="mb-3 flex items-center gap-2 font-bold">
                  <BarChart3 size={16} />
                  Broadcast
                </h3>
                <form className="space-y-3" onSubmit={sendBroadcast}>
                  <textarea className="field min-h-24" onChange={(event) => setBroadcastMessage(event.target.value)} placeholder="Message to Telegram subscribers" required value={broadcastMessage} />
                  <button className="btn btn-primary w-full" disabled={saving} type="submit">
                    <Send size={16} />
                    Send broadcast
                  </button>
                </form>
              </section>

              <section className="panel p-4">
                <h3 className="mb-3 font-bold">Users</h3>
                <div className="space-y-2">
                  {users.slice(0, 8).map((item) => (
                    <div className="flex items-center justify-between border-b border-[var(--line)] py-2 text-sm" key={item._id}>
                      <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="text-[var(--muted)]">{item.email}</p>
                      </div>
                      <select
                        className="field max-w-28"
                        disabled={item._id === user?.id}
                        onChange={(event) => updateUserRole(item._id, event.target.value)}
                        value={item.role}
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </div>
                  ))}
                  {!users.length ? <p className="text-sm text-[var(--muted)]">No users found.</p> : null}
                </div>
              </section>
            </>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
