import { promises as fs } from "fs";
import path from "path";

export type Order = {
  id: number;
  customer: string;
  item: string;
  qty: number;
  status: string;
  createdAt: string;
};

const dataDir = path.join(process.cwd(), "data");
const ordersCsvPath = path.join(dataDir, "orders.csv");
const headerRow = "id,customer,item,qty,status,createdAt";

async function ensureCsvFile(): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(ordersCsvPath);
  } catch {
    await fs.writeFile(ordersCsvPath, `${headerRow}\n`, "utf8");
  }
}

export function parseOrdersCsv(csvText: string): Order[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return [];
  }

  const [headers, ...rows] = lines;
  if (headers !== headerRow) {
    throw new Error("Unexpected CSV headers in data/orders.csv");
  }

  return rows
    .map((row) => {
      const [id, customer, item, qty, status, createdAt] = row.split(",");

      return {
        id: Number(id),
        customer: customer ?? "",
        item: item ?? "",
        qty: Number(qty),
        status: status ?? "",
        createdAt: createdAt ?? "",
      };
    })
    .filter((order) => Number.isFinite(order.id));
}

export async function readOrders(): Promise<Order[]> {
  await ensureCsvFile();
  const csvText = await fs.readFile(ordersCsvPath, "utf8");
  return parseOrdersCsv(csvText);
}

function toCsvRow(order: Order): string {
  return [
    String(order.id),
    order.customer,
    order.item,
    String(order.qty),
    order.status,
    order.createdAt,
  ].join(",");
}

export async function appendOrder(order: Order): Promise<void> {
  await ensureCsvFile();

  const csvText = await fs.readFile(ordersCsvPath, "utf8");
  const separator = csvText.endsWith("\n") || csvText.length === 0 ? "" : "\n";

  await fs.appendFile(ordersCsvPath, `${separator}${toCsvRow(order)}\n`, "utf8");
}

async function writeAllOrders(orders: Order[]): Promise<void> {
  await ensureCsvFile();
  const rows = orders.map(toCsvRow);
  const csvContent = [headerRow, ...rows].join("\n") + "\n";
  await fs.writeFile(ordersCsvPath, csvContent, "utf8");
}

export async function updateOrder(
  id: number,
  fields: Partial<Omit<Order, "id">>
): Promise<Order | null> {
  const orders = await readOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;

  orders[index] = { ...orders[index], ...fields };
  await writeAllOrders(orders);
  return orders[index];
}

export async function deleteOrder(id: number): Promise<boolean> {
  const orders = await readOrders();
  const filtered = orders.filter((o) => o.id !== id);
  if (filtered.length === orders.length) return false;

  await writeAllOrders(filtered);
  return true;
}

export function nextOrderId(orders: Order[]): number {
  const maxId = orders.reduce((max, order) => {
    return Math.max(max, order.id);
  }, 0);

  return maxId + 1;
}
