// app/api/companies/route.ts
import { NextRequest, NextResponse } from "next/server";
import { clientPromise, dbName } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const allCategories = await db.collection("Categories")
      .find({ isDeleted: false })
      .toArray();

    return NextResponse.json({ status: 200, data: allCategories });
  } catch (error) {
    return NextResponse.json({ status: 500, message: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);

    // Parse the request body
    const body = await req.json();
    const { name, description, image } = body;

    if (!name) {
      return NextResponse.json(
        { message: "Ime kategorije je obavezno!" },
        { status: 400 }
      );
    }

    // Create the new category object
    const newCategory = {
      name,
      description,
      isDeleted: false,
      image: image || null, // Use the provided image or set it to null if not provided
    };

    // Insert the new category into the database
    const result = await db.collection("Categories").insertOne(newCategory);

    // Return the inserted document with the generated _id
    return NextResponse.json({
      message: "Kategorija uspešno dodata",
      data: { _id: result.insertedId, ...newCategory }, // Correctly attach _id
    }, { status: 201 });

  } catch (error) {
    console.error("Greška prilikom dodavanja kategorije!", error);
    return NextResponse.json(
      { message: error },
      { status: 500 }
    );
  }
}


export async function DELETE(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);

    // Extract the category ID from the request URL
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("id");

    if (!categoryId) {
      return NextResponse.json(
        { status: 400, message: "ID kategorije je obavezan!" },
        { status: 400 }
      );
    }

    // Update the category to set isDeleted to true
    const result = await db.collection("Categories").updateOne(
      { _id: new ObjectId(categoryId) }, // Match the category by its ID
      { $set: { isDeleted: true } } // Set isDeleted to true
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { status: 404, message: "Kategorija nije pronađena!" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "Kategorija je uspešno obrisana!",
    });
  } catch (error) {
    console.error("Greška prilikom logičkog brisanja kategorije!", error);
    return NextResponse.json(
      { status: 500, message: "Greška prilikom logičkog brisanja kategorije!" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);

    // Parse the request body
    const body = await req.json();
    const { id, name, description, image } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { status: 400, message: "ID kategorije je obavezan!" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { status: 400, message: "Ime kategorije je obavezno!" },
        { status: 400 }
      );
    }

    // Update the category in the database
    const result = await db.collection("Categories").updateOne(
      { _id: new ObjectId(id) }, // Match the category by its ID
      { $set: { name, description, image } } // Update the name, description and image
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { status: 404, message: "Kategorija nije pronađena!" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "Kategorija je uspešno izmenjena.",
    });
  } catch (error) {
    console.error("Greška prilikom izmene kategorije!", error);
    return NextResponse.json(
      { status: 500, message: "Greška prilikom izmene kategorije!" },
      { status: 500 }
    );
  }
}