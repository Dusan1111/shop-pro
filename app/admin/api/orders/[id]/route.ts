import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getUserDbFromSession } from "@/lib/session";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const id = params.id;
        if (!id) {
            return NextResponse.json({ status: 400, message: "Nevalidan ID za porudžbinu!" }, { status: 400 });
        }

        const session = await getUserDbFromSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { db } = session;

        // Find the order
        const order = await db.collection("Orders").findOne({
            _id: new ObjectId(id)
        });

        if (!order) {
            return NextResponse.json({ status: 404, message: "Porudžbina nije pronađena!" }, { status: 404 });
        }

        // Find all order items for this order
        const orderItems = await db.collection("OrderItems")
            .find({ orderId: id})
            .toArray();

        // Fetch product details for each order item
        for (const item of orderItems) {
            if (item.productId) {
                item.product = await db.collection("Products").findOne({ _id: new ObjectId(item.productId) });
            }
        }

        // Attach orderItems to the order object
        order.orderItems = orderItems;

        return NextResponse.json({ status: 200, data: order });
    } catch (error) {
        return NextResponse.json({ status: 500, message: (error as Error).message }, { status: 500 });
    }
}