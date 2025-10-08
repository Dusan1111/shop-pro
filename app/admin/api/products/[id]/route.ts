import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { clientPromise, dbName } from "@/lib/mongodb";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params; // <<<< THIS IS THE KEY
        const id = params.id;
        if (!id) {
            return NextResponse.json({ status: 400, message: "Nevalidan ID za proizvod!" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db(dbName);

        const category = await db.collection("Products").findOne({
            _id: new ObjectId(id),
            isDeleted: false,
        });

        if (!category) {
            return NextResponse.json({ status: 404, message: "Proizvod nije pronađen!" }, { status: 404 });
        }

        return NextResponse.json({ status: 200, data: category });
    } catch (error) {
        return NextResponse.json({ status: 500, message: (error as Error).message }, { status: 500 });
    }
}
