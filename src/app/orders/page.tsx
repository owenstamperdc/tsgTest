"use client";

import { FormEvent, useEffect, useState } from "react";

type Order = {
  id: number;
  customer: string;
  item: string;
  qty: number;
  status: string;
  createdAt: string;
};

async function parseErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    if (typeof data.error === "string") {
      return data.error;
    }
  } catch {
    return fallback;
  }

  return fallback;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [customer, setCustomer] = useState("");
  const [item, setItem] = useState("");
  const [qty, setQty] = useState("1");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editCustomer, setEditCustomer] = useState("");
  const [editItem, setEditItem] = useState("");
  const [editQty, setEditQty] = useState("1");
  const [editSubmitting, setEditSubmitting] = useState(false);

  async function loadOrders() {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/orders");
      if (!response.ok) {
        const message = await parseErrorMessage(response, "Failed to load orders");
        setError(message);
        return;
      }

      const data = (await response.json()) as Order[];
      setOrders(data);
    } catch {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer,
          item,
          qty: qty ? Number(qty) : undefined,
        }),
      });

      if (!response.ok) {
        const message = await parseErrorMessage(response, "Failed to add order");
        setError(message);
        return;
      }

      setCustomer("");
      setItem("");
      setQty("1");
      await loadOrders();
    } catch {
      setError("Failed to add order");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveEdit(id: number) {
    setError("");
    setEditSubmitting(true);

    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: editCustomer,
          item: editItem,
          qty: editQty ? Number(editQty) : undefined,
        }),
      });

      if (!response.ok) {
        const message = await parseErrorMessage(response, "Failed to update order");
        setError(message);
        return;
      }

      setEditingId(null);
      await loadOrders();
    } catch {
      setError("Failed to update order");
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    setError("");

    if (!confirm(`Delete order #${id}? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const message = await parseErrorMessage(response, "Failed to delete order");
        setError(message);
        return;
      }

      // If we were editing this row, clear the editor
      if (editingId === id) setEditingId(null);

      await loadOrders();
    } catch {
      setError("Failed to delete order");
    }
  }

  return (
    <main className="page stack">
      <h1>Orders</h1>

      <section className="card stack">
        <h2>Add Order</h2>
        <form onSubmit={handleSubmit} className="order-form">
          <label>
            Customer
            <input value={customer} onChange={(event) => setCustomer(event.target.value)} />
          </label>
          <label>
            Item
            <input value={item} onChange={(event) => setItem(event.target.value)} />
          </label>
          <label>
            Qty
            <input
              type="number"
              min="1"
              step="1"
              value={qty}
              onChange={(event) => setQty(event.target.value)}
            />
          </label>
          <div>
            <button type="submit" disabled={submitting}>
              {submitting ? "Adding..." : "Add Order"}
            </button>
          </div>
        </form>
      </section>

      {error && <p className="error">{error}</p>}

      <section className="card">
        <h2>Order Table</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>id</th>
                <th>customer</th>
                <th>item</th>
                <th>qty</th>
                <th>status</th>
                <th>createdAt</th>
                <th>actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    {editingId === order.id ? (
                      <>
                        <td>
                          <input value={editCustomer} onChange={(e) => setEditCustomer(e.target.value)} />
                        </td>
                        <td>
                          <input value={editItem} onChange={(e) => setEditItem(e.target.value)} />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={editQty}
                            onChange={(e) => setEditQty(e.target.value)}
                          />
                        </td>
                        <td>{order.status}</td>
                        <td>{order.createdAt}</td>
                        <td>
                          <button
                            onClick={() => void handleSaveEdit(order.id)}
                            disabled={editSubmitting}
                          >
                            {editSubmitting ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                            }}
                            disabled={editSubmitting}
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{order.customer}</td>
                        <td>{order.item}</td>
                        <td>{order.qty}</td>
                        <td>{order.status}</td>
                        <td>{order.createdAt}</td>
                        <td>
                          <button
                            onClick={() => {
                              setEditingId(order.id);
                              setEditCustomer(order.customer);
                              setEditItem(order.item);
                              setEditQty(String(order.qty ?? 1));
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => void handleDelete(order.id)}
                            style={{ marginLeft: 8 }}
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
