// app/admin/api/attributes/route.ts
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
    const allAttributes = await db.collection("Attributes")
      .find({ isDeleted: false })
      .toArray();

    return NextResponse.json({ status: 200, data: allAttributes });
  } catch (error) {
    return NextResponse.json({ status: 500, message: (error as Error).message }, { status: 500 });
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
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { message: "Ime atributa je obavezno!" },
        { status: 400 }
      );
    }

    // Create the new attribute object
    const newAttribute = {
      name,
      isDeleted: false,
    };

    // Insert the new attribute into the database
    const result = await db.collection("Attributes").insertOne(newAttribute);

    // Return the inserted document with the generated _id
    return NextResponse.json({
      message: "Atribut uspešno dodat",
      data: { _id: result.insertedId, ...newAttribute },
    }, { status: 201 });

  } catch (error) {
    console.error("Greška prilikom dodavanja atributa!", error);
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

    // Extract the attribute ID from the request URL
    const { searchParams } = new URL(req.url);
    const attributeId = searchParams.get("id");

    if (!attributeId) {
      return NextResponse.json(
        { status: 400, message: "ID atributa je obavezan!" },
        { status: 400 }
      );
    }

    // Update the attribute to set isDeleted to true
    const result = await db.collection("Attributes").updateOne(
      { _id: new ObjectId(attributeId) },
      { $set: { isDeleted: true } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { status: 404, message: "Atribut nije pronađen!" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "Atribut je uspešno obrisan!",
    });
  } catch (error) {
    console.error("Greška prilikom logičkog brisanja atributa!", error);
    return NextResponse.json(
      { status: 500, message: "Greška prilikom logičkog brisanja atributa!" },
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
    const { _id, name } = body;

    // Validate required fields
    if (!_id) {
      return NextResponse.json(
        { status: 400, message: "ID atributa je obavezan!" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { status: 400, message: "Ime atributa je obavezno!" },
        { status: 400 }
      );
    }

    // Update the attribute in the database
    const result = await db.collection("Attributes").updateOne(
      { _id: new ObjectId(_id) },
      { $set: { name } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { status: 404, message: "Atribut nije pronađen!" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "Atribut je uspešno ažuriran.",
    });
  } catch (error) {
    console.error("Greška prilikom izmene atributa!", error);
    return NextResponse.json(
      { status: 500, message: "Greška prilikom izmene atributa!" },
      { status: 500 }
    );
  }
}