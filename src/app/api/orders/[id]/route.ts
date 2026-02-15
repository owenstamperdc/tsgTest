import { NextResponse } from "next/server";
import { deleteOrder, updateOrder } from "@/lib/ordersCsv";

export const runtime = "nodejs";

export async function PUT(request: Request, { params }: { params: { id?: string } }) {
  const idStr = params?.id;
  const id = idStr ? Number(idStr) : NaN;
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
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

  const { customer, item, qty, status } = payload as Record<string, unknown>;

  const updates: Record<string, unknown> = {};
  if (typeof customer === "string") updates.customer = customer.trim();
  if (typeof item === "string") updates.item = item.trim();
  if (typeof status === "string") updates.status = status.trim();
  if (qty !== undefined && qty !== null && qty !== "") {
    const parsed = Number(qty);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return NextResponse.json({ error: "qty must be a positive integer" }, { status: 400 });
    }
    updates.qty = parsed;
  }

  try {
    const updated = await updateOrder(id, updates as any);
    if (!updated) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id?: string } }) {
  const idStr = params?.id;
  const id = idStr ? Number(idStr) : NaN;
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const ok = await deleteOrder(id);
    if (!ok) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({ success: true }, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
