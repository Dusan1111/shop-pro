import { NextRequest, NextResponse } from "next/server";
import { clientPromise, settingsDbName } from "@/lib/mongodb";
import { hashPassword } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(settingsDbName);

    // Aggregate to join Users with Tenants and Roles
    const users = await db.collection("Users").aggregate([
      {
        $addFields: {
          tenantObjectId: { $toObjectId: "$tenantId" },
          roleObjectId: { $toObjectId: "$roleId" }
        }
      },
      {
        $lookup: {
          from: "Tenants",
          localField: "tenantObjectId",
          foreignField: "_id",
          as: "tenantDetails"
        }
      },
      {
        $lookup: {
          from: "Roles",
          localField: "roleObjectId",
          foreignField: "_id",
          as: "roleDetails"
        }
      },
      {
        $unwind: {
          path: "$tenantDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$roleDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: {
          "roleDetails.name": { $ne: "super_admin" } // Exclude users with super_admin role
        }
      },
      {
        $project: {
          _id: 1,
          email: 1,
          tenantId: 1,
          roleId: 1,
          createdAt: 1,
          tenantName: "$tenantDetails.name",
          roleName: "$roleDetails.name"
        }
      }
    ]).toArray();

    return NextResponse.json({ status: 200, data: users });
  } catch (error) {
    return NextResponse.json({ status: 500, message: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(settingsDbName);

    const body = await req.json();
    const { fullName, email, password, tenantId, roleId } = body;

    if (!email) {
      return NextResponse.json(
        { message: "Email je obavezan!" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { message: "Lozinka je obavezna!" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.collection("Users").findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Korisnik sa ovim email-om već postoji!" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser: any = {
      fullName: fullName || null,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    // Convert to ObjectId if provided
    if (tenantId) {
      newUser.tenantId = new ObjectId(tenantId);
    }
    if (roleId) {
      newUser.roleId = new ObjectId(roleId);
    }

    const result = await db.collection("Users").insertOne(newUser);

    return NextResponse.json({
      message: "Korisnik uspešno dodat",
      data: { _id: result.insertedId, email, tenantId, roleId },
    }, { status: 201 });

  } catch (error) {
    console.error("Greška prilikom dodavanja korisnika!", error);
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
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { status: 400, message: "ID korisnika je obavezan!" },
        { status: 400 }
      );
    }

    const result = await db.collection("Users").deleteOne(
      { _id: new ObjectId(userId) }
    );

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { status: 404, message: "Korisnik nije pronađen!" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "Korisnik je uspešno obrisan!",
    });
  } catch (error) {
    console.error("Greška prilikom brisanja korisnika!", error);
    return NextResponse.json(
      { status: 500, message: "Greška prilikom brisanja korisnika!" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(settingsDbName);

    const body = await req.json();
    const { id, fullName, email, password, tenantId, roleId } = body;

    if (!id) {
      return NextResponse.json(
        { status: 400, message: "ID korisnika je obavezan!" },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { status: 400, message: "Email je obavezan!" },
        { status: 400 }
      );
    }

    const updateData: any = {
      email,
      updatedAt: new Date()
    };

    // Only update fields if provided
    if (fullName !== undefined) {
      updateData.fullName = fullName;
    }
    if (tenantId) {
      updateData.tenantId = new ObjectId(tenantId);
    }
    if (roleId) {
      updateData.roleId = new ObjectId(roleId);
    }
    if (password) {
      updateData.password = await hashPassword(password);
    }

    const result = await db.collection("Users").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { status: 404, message: "Korisnik nije pronađen!" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "Korisnik je uspešno ažuriran.",
    });
  } catch (error) {
    console.error("Greška prilikom izmene korisnika!", error);
    return NextResponse.json(
      { status: 500, message: "Greška prilikom izmene korisnika!" },
      { status: 500 }
    );
  }
}
