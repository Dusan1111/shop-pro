import { NextRequest, NextResponse } from "next/server";
import { clientPromise, settingsDbName } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(settingsDbName);
    const roles = await db.collection("Roles")
      .find({ isDeleted: false })
      .toArray();

    return NextResponse.json({ status: 200, data: roles });
  } catch (error) {
    return NextResponse.json({ status: 500, message: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(settingsDbName);

    const body = await req.json();
    const { name, description, permissions } = body;

    if (!name) {
      return NextResponse.json(
        { message: "Ime role je obavezno!" },
        { status: 400 }
      );
    }

    const newRole = {
      name,
      description,
      permissions: permissions || [],
      isDeleted: false,
      createdAt: new Date(),
    };

    const result = await db.collection("Roles").insertOne(newRole);

    return NextResponse.json({
      message: "Rola uspešno dodata",
      data: { _id: result.insertedId, ...newRole },
    }, { status: 201 });

  } catch (error) {
    console.error("Greška prilikom dodavanja role!", error);
    return NextResponse.json(
      { message: error },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(settingsDbName);

    const { searchParams } = new URL(req.url);
    const roleId = searchParams.get("id");

    if (!roleId) {
      return NextResponse.json(
        { status: 400, message: "ID role je obavezan!" },
        { status: 400 }
      );
    }

    const result = await db.collection("Roles").updateOne(
      { _id: new ObjectId(roleId) },
      { $set: { isDeleted: true } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { status: 404, message: "Rola nije pronađena!" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "Rola je uspešno obrisana!",
    });
  } catch (error) {
    console.error("Greška prilikom brisanja role!", error);
    return NextResponse.json(
      { status: 500, message: "Greška prilikom brisanja role!" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(settingsDbName);

    const body = await req.json();
    const { id, name, description, permissions } = body;

    if (!id) {
      return NextResponse.json(
        { status: 400, message: "ID role je obavezan!" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { status: 400, message: "Ime role je obavezno!" },
        { status: 400 }
      );
    }

    const result = await db.collection("Roles").updateOne(
      { _id: new ObjectId(id) },
      { $set: { name, description, permissions: permissions || [], updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { status: 404, message: "Rola nije pronađena!" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "Rola je uspešno ažurirana.",
    });
  } catch (error) {
    console.error("Greška prilikom izmene role!", error);
    return NextResponse.json(
      { status: 500, message: "Greška prilikom izmene role!" },
      { status: 500 }
    );
  }
}
