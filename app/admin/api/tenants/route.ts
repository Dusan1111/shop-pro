import { NextRequest, NextResponse } from "next/server";
import { clientPromise, settingsDbName } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(settingsDbName);

    const tenants = await db.collection("Tenants")
      .find({})
      .toArray();

    return NextResponse.json({ status: 200, data: tenants });
  } catch (error) {
    return NextResponse.json({ status: 500, message: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(settingsDbName);

    const body = await req.json();
    const { name, dbName, gmailUser, gmailAppPassword, phoneNumber, isActive = true } = body;

    if (!name) {
      return NextResponse.json(
        { message: "Ime firme je obavezno!" },
        { status: 400 }
      );
    }

    if (!dbName) {
      return NextResponse.json(
        { message: "Ime baze podataka je obavezno!" },
        { status: 400 }
      );
    }

    const newTenant = {
      name,
      dbName,
      gmailUser: gmailUser || null,
      gmailAppPassword: gmailAppPassword || null,
      phoneNumber: phoneNumber || null,
      isActive,
      isDeleted: false,
      createdAt: new Date(),
    };

    const result = await db.collection("Tenants").insertOne(newTenant);

    // Create the new database with all required collections
    try {
      const newDb = client.db(dbName);
      const collections = [
        "AttributeValues",
        "Attributes",
        "Categories",
        "GlobalDiscounts",
        "OrderItems",
        "Orders",
        "Products",
        "Users"
      ];

      // Create all collections
      for (const collectionName of collections) {
        await newDb.createCollection(collectionName);
      }

      console.log(`Database '${dbName}' created successfully with collections: ${collections.join(", ")}`);
    } catch (dbError) {
      console.error(`Error creating database '${dbName}':`, dbError);
      // Continue even if database creation fails - it might already exist
    }

    return NextResponse.json({
      message: "Firma uspešno dodata",
      data: { _id: result.insertedId, ...newTenant },
    }, { status: 201 });

  } catch (error) {
    console.error("Greška prilikom dodavanja firme!", error);
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
    const tenantId = searchParams.get("id");

    if (!tenantId) {
      return NextResponse.json(
        { status: 400, message: "ID firme je obavezan!" },
        { status: 400 }
      );
    }

    const result = await db.collection("Tenants").updateOne(
      { _id: new ObjectId(tenantId) },
      { $set: { isDeleted: true } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { status: 404, message: "Firma nije pronađena!" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "Firma je uspešno obrisana!",
    });
  } catch (error) {
    console.error("Greška prilikom brisanja firme!", error);
    return NextResponse.json(
      { status: 500, message: "Greška prilikom brisanja firme!" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(settingsDbName);

    const body = await req.json();
    const { id, name, dbName, gmailUser, gmailAppPassword, phoneNumber, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { status: 400, message: "ID firme je obavezan!" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { status: 400, message: "Ime firme je obavezno!" },
        { status: 400 }
      );
    }

    if (!dbName) {
      return NextResponse.json(
        { status: 400, message: "Ime baze podataka je obavezno!" },
        { status: 400 }
      );
    }

    const updateData: any = {
      name,
      dbName,
      updatedAt: new Date()
    };

    // Only update fields if provided
    if (gmailUser !== undefined) {
      updateData.gmailUser = gmailUser;
    }
    if (gmailAppPassword !== undefined) {
      updateData.gmailAppPassword = gmailAppPassword;
    }
    if (phoneNumber !== undefined) {
      updateData.phoneNumber = phoneNumber;
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const result = await db.collection("Tenants").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { status: 404, message: "Firma nije pronađena!" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "Firma je uspešno ažurirana.",
    });
  } catch (error) {
    console.error("Greška prilikom izmene firme!", error);
    return NextResponse.json(
      { status: 500, message: "Greška prilikom izmene firme!" },
      { status: 500 }
    );
  }
}
