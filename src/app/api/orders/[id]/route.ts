import { NextResponse } from "next/server";
import { updateOrder, deleteOrder } from "@/lib/ordersCsv";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isFinite(n) && Number.isInteger(n) && n > 0 ? n : null;
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const id = parseId(rawId);
  if (id === null) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return NextResponse.json({ error: "Body must be an object" }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const fields: Record<string, unknown> = {};

  if ("customer" in body) {
    const customer = typeof body.customer === "string" ? body.customer.trim() : "";
    if (!customer) {
      return NextResponse.json({ error: "customer cannot be empty" }, { status: 400 });
    }
    fields.customer = customer;
  }

  if ("item" in body) {
    const item = typeof body.item === "string" ? body.item.trim() : "";
    if (!item) {
      return NextResponse.json({ error: "item cannot be empty" }, { status: 400 });
    }
    fields.item = item;
  }

  if ("qty" in body) {
    const parsedQty = Number(body.qty);
    if (!Number.isInteger(parsedQty) || parsedQty <= 0) {
      return NextResponse.json({ error: "qty must be a positive integer" }, { status: 400 });
    }
    fields.qty = parsedQty;
  }

  if ("status" in body) {
    const status = typeof body.status === "string" ? body.status.trim() : "";
    if (!status) {
      return NextResponse.json({ error: "status cannot be empty" }, { status: 400 });
    }
    fields.status = status;
  }

  if (Object.keys(fields).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update (customer, item, qty, status)" },
      { status: 400 }
    );
  }

  try {
    const updated = await updateOrder(id, fields);
    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const id = parseId(rawId);
  if (id === null) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  try {
    const deleted = await deleteOrder(id);
    if (!deleted) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ message: `Order ${id} deleted` });
  } catch {
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
