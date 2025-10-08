// app/api/companies/route.ts
import { NextRequest, NextResponse } from "next/server";
import { clientPromise, dbName } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);

    // Use aggregation to join Products with Categories
    const allProducts = await db.collection("Products").aggregate([
      {
        $match: { isDeleted: false }, // Only include non-deleted products
      },
      {
        $addFields: {
          categoryId: { $toObjectId: "$categoryId" }, // Ensure categoryId is an ObjectId
        },
      },
      {
        $lookup: {
          from: "Categories", // The collection to join with
          localField: "categoryId", // The field in Products
          foreignField: "_id", // The field in Categories
          as: "categoryDetails", // The name of the joined field
        },
      },
      {
        $unwind: {
          path: "$categoryDetails",
          preserveNullAndEmptyArrays: true, // Keep products without a matching category
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1, // Keep necessary product fields
          categoryId: 1,
          description: 1,
          salePrice: 1,
          image: 1, // Include product image
          categoryName: "$categoryDetails.name", // Extract only category name
        },
      },
    ]).toArray();

    return NextResponse.json({ status: 200, data: allProducts });
  } catch (error) {
    console.error("Greška prilikom čitanja proizvoda sa kategorijama:", error);
    return NextResponse.json(
      { status: 500, message: "Greška prilikom čitanja proizvoda" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);

    // Parse the request body
    const body = await req.json();
    const {
      name,
      description,
      price,
      salePrice,
      categoryId,
      image,
      images,
      isPromoted = false, // Default to false if not provided
      relatedProducts = [], // Default to empty array if not provided
      attributes = [], // Default to empty array if not provided
    } = body;

    if (!name) {
      return NextResponse.json(
        { message: "Ime proizvoda je obavezno!" },
        { status: 400 }
      );
    }

    // Create the new product object
    const newProduct = {
      name,
      description,
      price,
      salePrice,
      categoryId,
      image,
      isDeleted: false,
      isPromoted,
      images: images || [], // Default to an empty array if not provided
      relatedProducts: relatedProducts || [], // Default to an empty array if not provided
      attributes: attributes || [], // Default to an empty array if not provided
    };

    // Insert the new product into the database
    const result = await db.collection("Products").insertOne(newProduct);

    // Return the inserted document with the generated _id
    return NextResponse.json({
      message: "Proizvod uspešno dodat",
      data: { _id: result.insertedId, ...newProduct }, // Correctly attach _id
    }, { status: 201 });

  } catch (error) {
    console.error("Greška prilikom dodavanja proizvoda!", error);
    return NextResponse.json(
      { message: "Greška prilikom dodavanja proizvoda!" },
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
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json(
        { status: 400, message: "ID proizvoda je obavezan!" },
        { status: 400 }
      );
    }

    // Update the category to set isDeleted to true
    const result = await db.collection("Products").updateOne(
      { _id: new ObjectId(productId) }, // Match the category by its ID
      { $set: { isDeleted: true } } // Set isDeleted to true
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { status: 404, message: "Proizvoda nije pronađen!" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "Proizvod je uspešno obrisan!",
    });
  } catch (error) {
    console.error("Greška prilikom logičkog brisanja proizvoda!", error);
    return NextResponse.json(
      { status: 500, message: "Greška prilikom logičkog brisanja proizvoda!" },
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
    const {
      id,
      name,
      description,
      price,
      salePrice,
      categoryId,
      image,
      images,
      isPromoted, // Default to false if not provided
      relatedProducts = [], // Default to empty array if not provided
      attributes = [], // Default to empty array if not provided
     } = body;

    if (!id) {
      return NextResponse.json(
        { status: 400, message: "ID proizvoda je obavezan!" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { status: 400, message: "Ime proizvoda je obavezno!" },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { status: 400, message: "Opis proizvoda je obavezno!" },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { status: 400, message: "ID kategorije je obavezno!" },
        { status: 400 }
      );
    }

    if (!price) {
      return NextResponse.json(
        { status: 400, message: "Cena proizvoda je obavezna!" },
        { status: 400 }
      );
    }

    // Update the product in the database
    const result = await db.collection("Products").updateOne(
      { _id: new ObjectId(id) }, // Match the product by its ID
      { $set: { name, description, categoryId, price, salePrice, image, images, isPromoted, relatedProducts, attributes} } // Update the product fields
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { status: 404, message: "Kategorija nije pronađena!" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "Proizvod je uspešno izmenjen.",
    });
  } catch (error) {
    console.error("Greška prilikom izmene kategorije!", error);
    return NextResponse.json(
      { status: 500, message: "Greška prilikom izmene kategorije!" },
      { status: 500 }
    );
  }
}