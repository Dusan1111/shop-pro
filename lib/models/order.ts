// Order and OrderItem interfaces and utilities
import { ObjectId } from "mongodb";

export interface Order {
  _id?: ObjectId;
  orderTime: Date;
  status: string;
  user: string;
  userEmail: string;
  userPhone: string;
  total: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderItem {
  _id?: ObjectId;
  orderId: string;
  productId: string;
  quantity: number;
  subtotal: number;
  createdAt?: Date;
}

export interface CreateOrderRequest {
  user: string;
  userEmail: string;
  userPhone: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

// Calculate total from items
export function calculateOrderTotal(items: { quantity: number; price: number }[]): number {
  return items.reduce((total, item) => total + (item.quantity * item.price), 0);
}

// Validate order data
export function validateOrderData(data: CreateOrderRequest): string[] {
  const errors: string[] = [];

  if (!data.user?.trim()) {
    errors.push("User name is required");
  }

  if (!data.userEmail?.trim()) {
    errors.push("User email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.userEmail)) {
    errors.push("Invalid email format");
  }

  if (!data.userPhone?.trim()) {
    errors.push("User phone is required");
  }

  if (!data.items || data.items.length === 0) {
    errors.push("Order must contain at least one item");
  } else {
    data.items.forEach((item, index) => {
      if (!item.productId) {
        errors.push(`Item ${index + 1}: Product ID is required`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
      }
      if (!item.price || item.price <= 0) {
        errors.push(`Item ${index + 1}: Price must be greater than 0`);
      }
    });
  }

  return errors;
}