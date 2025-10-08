import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getUserDbFromSession } from "@/lib/session";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const id = params.id;
        if (!id) {
            return NextResponse.json({ status: 400, message: "Nevalidan ID za vrednost atributa!" }, { status: 400 });
        }

        const session = await getUserDbFromSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { db } = session;

        // Get attribute value with attribute name lookup
        const attributeValue = await db.collection("AttributeValues")
            .aggregate([
                { $match: { _id: new ObjectId(id), isDeleted: false } },
                {
                    $lookup: {
                        from: "Attributes",
                        localField: "attributeId",
                        foreignField: "_id",
                        as: "attribute"
                    }
                },
                {
                    $addFields: {
                        attributeName: { $arrayElemAt: ["$attribute.name", 0] }
                    }
                },
                {
                    $project: {
                        attribute: 0 // Remove the attribute array, keep only attributeName
                    }
                }
            ])
            .next();

        if (!attributeValue) {
            return NextResponse.json({ status: 404, message: "Vrednost atributa nije pronađena!" }, { status: 404 });
        }

        return NextResponse.json({ status: 200, data: attributeValue });
    } catch (error) {
        return NextResponse.json({ status: 500, message: (error as Error).message }, { status: 500 });
    }
}