// app/admin/api/attribute-values/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUserDbFromSession } from "@/lib/session";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const session = await getUserDbFromSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = session;

    // Get all attribute values with attribute name lookup
    const allAttributeValues = await db.collection("AttributeValues")
      .aggregate([
        { $match: { isDeleted: false } },
        {
          $addFields: {
            attributeId: { $toObjectId: "$attributeId" } // convert string to ObjectId
          }
        },
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
            attribute: 0 // remove attribute array
          }
        }
      ])
      .toArray();

    return NextResponse.json({ status: 200, data: allAttributeValues });
  } catch (error) {
    return NextResponse.json(
      { status: 500, message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getUserDbFromSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = session;

    // Parse the request body
    const body = await req.json();
    const { attributeId, name } = body;

    if (!attributeId) {
      return NextResponse.json(
        { message: "ID atributa je obavezan!" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { message: "Vrednost atributa je obavezna!" },
        { status: 400 }
      );
    }

    // Create the new attribute value object
    const newAttributeValue = {
      attributeId: new ObjectId(attributeId),
      name,
      isDeleted: false,
    };

    // Insert the new attribute value into the database
    const result = await db.collection("AttributeValues").insertOne(newAttributeValue);

    // Return the inserted document with the generated _id
    return NextResponse.json({
      message: "Vrednost atributa uspešno dodata",
      data: { _id: result.insertedId, ...newAttributeValue },
    }, { status: 201 });

  } catch (error) {
    console.error("Greška prilikom dodavanja vrednosti atributa!", error);
    return NextResponse.json(
      { message: error },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getUserDbFromSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = session;

    // Extract the attribute value ID from the request URL
    const { searchParams } = new URL(req.url);
    const attributeValueId = searchParams.get("id");

    if (!attributeValueId) {
      return NextResponse.json(
        { status: 400, message: "ID vrednosti atributa je obavezan!" },
        { status: 400 }
      );
    }

    // Update the attribute value to set isDeleted to true
    const result = await db.collection("AttributeValues").updateOne(
      { _id: new ObjectId(attributeValueId) },
      { $set: { isDeleted: true } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { status: 404, message: "Vrednost atributa nije pronađena!" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "Vrednost atributa je uspešno obrisana!",
    });
  } catch (error) {
    console.error("Greška prilikom logičkog brisanja vrednosti atributa!", error);
    return NextResponse.json(
      { status: 500, message: "Greška prilikom logičkog brisanja vrednosti atributa!" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getUserDbFromSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = session;

    // Parse the request body
    const body = await req.json();
    const { _id, attributeId, name } = body;

    // Validate required fields
    if (!_id) {
      return NextResponse.json(
        { status: 400, message: "ID vrednosti atributa je obavezan!" },
        { status: 400 }
      );
    }

    if (!attributeId) {
      return NextResponse.json(
        { status: 400, message: "ID atributa je obavezan!" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { status: 400, message: "Vrednost atributa je obavezna!" },
        { status: 400 }
      );
    }

    // Update the attribute value in the database
    const result = await db.collection("AttributeValues").updateOne(
      { _id: new ObjectId(_id) },
      { $set: { attributeId: new ObjectId(attributeId), name} }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { status: 404, message: "Vrednost atributa nije pronađena!" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "Vrednost atributa je uspešno ažurirana.",
    });
  } catch (error) {
    console.error("Greška prilikom izmene vrednosti atributa!", error);
    return NextResponse.json(
      { status: 500, message: "Greška prilikom izmene vrednosti atributa!" },
      { status: 500 }
    );
  }
}