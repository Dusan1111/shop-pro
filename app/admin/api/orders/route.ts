// app/api/companies/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUserDbFromSession } from "@/lib/session";
import { ObjectId } from "mongodb";

export async function PUT(req: NextRequest) {
  try {
    const session = await getUserDbFromSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = session;

    // Parse the request body
    const body = await req.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json(
        { status: 400, message: "Id porudžbine je obevezno!" },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { status: 400, message: "Status orudžbine je obevezan!" },
        { status: 400 }
      );
    }

    // Get order details before updating to send email
    const order = await db.collection("Orders").findOne({ _id: new ObjectId(id) }) as any;

    if (!order) {
      return NextResponse.json(
        { status: 404, message: "Porudžbina nije pronađena!" },
        { status: 404 }
      );
    }

    // Fetch order items with product details
    const orderItems = await db.collection("OrderItems")
      .find({ orderId: id })
      .toArray();

    // Fetch product details for each order item
    for (const item of orderItems) {
      if (item.productId) {
        item.product = await db.collection("Products").findOne({ _id: new ObjectId(item.productId) });
      }
    }

    // Update the order status
    const result = await db.collection("Orders").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { status: 404, message: "Porudžbina nije pronađena!" },
        { status: 404 }
      );
    }

    // Send status change email to customer if email exists
    console.log('Order userEmail:', order.userEmail);
    console.log('Session tenantId:', session.tenantId);

    if (order.userEmail) {
      try {
        console.log('Attempting to send status change email...');
        const emailResult = await sendStatusChangeEmail(order, orderItems, status, id, session.tenantId);
        console.log('Email sent successfully:', emailResult);
      } catch (emailError) {
        console.error("Failed to send status change email:", emailError);
        // Don't fail the request if email fails
      }
    } else {
      console.log('No userEmail found in order, skipping email');
    }

    return NextResponse.json({
      status: 200,
      message: "Status porudžbine je uspešno ažuriran!",
    });
  } catch (error) {
    console.error("Greška prilikom ažuriranja statusa:", error);
    return NextResponse.json(
      { status: 500, message: "Greška prilikom ažuriranja statusa!" },
      { status: 500 }
    );
  }
}

async function sendStatusChangeEmail(order: any, orderItems: any[], newStatus: string, orderId: string, tenantId?: string) {
  console.log('=== sendStatusChangeEmail called ===');
  console.log('Order email:', order.userEmail);
  console.log('Order ID:', orderId);
  console.log('New status:', newStatus);
  console.log('Tenant ID:', tenantId);

  const BLOB_URL = process.env.NEXT_PUBLIC_BLOB_URL;

  // Fetch tenant contact information
  let tenantEmail = '';
  let tenantPhone = '';
  let tenantName = 'Sany Swings';

  if (tenantId) {
    try {
      console.log('Fetching tenant information...');
      const { clientPromise, settingsDbName } = await import('@/lib/mongodb');
      const client = await clientPromise;
      const settingsDb = client.db(settingsDbName);
      const tenant = await settingsDb.collection('Tenants').findOne({
        _id: new (await import('mongodb')).ObjectId(tenantId)
      }) as any;

      if (tenant) {
        tenantEmail = tenant.businessEmail;
        tenantPhone = tenant.phoneNumber;
        tenantName = tenant.name;
        console.log('Tenant info loaded:', { tenantName, tenantEmail, tenantPhone });
      } else {
        console.log('Tenant not found');
      }
    } catch (error) {
      console.error('Error fetching tenant info:', error);
    }
  } else {
    console.log('No tenantId provided');
  }

  const statusMessages: { [key: string]: { title: string; message: string; color: string } } = {
    "U pripremi": {
      title: "Porudžbina u pripremi",
      message: "Vaša porudžbina je trenutno u pripremi. Uskoro će biti poslata.",
      color: "#ff9800"
    },
    "Poslata": {
      title: "Porudžbina poslata",
      message: "Vaša porudžbina je poslata i uskoro će stići na adresu.",
      color: "#2196f3"
    },
    "Otkazana": {
      title: "Porudžbina otkazana",
      message: "Vaša porudžbina je otkazana. Ako imate pitanja, molimo kontaktirajte nas.",
      color: "#f44336"
    }
  };

  const statusInfo = statusMessages[newStatus] || {
    title: "Promena statusa porudžbine",
    message: `Status vaše porudžbine je promenjen na: ${newStatus}`,
    color: "#333"
  };

  // Build order items HTML
  let orderItemsHTML = '';
  orderItems.forEach((item: any) => {
    const itemPrice = Number(item.product?.salePrice ?? item.product?.price ?? 0);
    const itemTotal = itemPrice * item.quantity;
    const imageUrl = item.product?.image && item.product.image.trim()
      ? `${BLOB_URL}/${item.product.image}`
      : 'https://via.placeholder.com/80x80/f0f0f0/666666?text=No+Image';

    orderItemsHTML += `
      <div class="item">
        <div class="item-row name-image">
          <img src="${imageUrl}" alt="${item.product?.name || 'Product'}" class="item-image" onerror="this.src='https://via.placeholder.com/80x80/f0f0f0/666666?text=No+Image'" />
          <h4 class="item-name">${item.product?.name || 'Unknown Product'}</h4>
        </div>
        <div class="item-row">
          <span class="item-quantity">Količina: ${item.quantity}</span>
        </div>
        <div class="item-row">
          <span class="item-price-per-unit">Cena po komadu: ${itemPrice.toFixed(2)} RSD</span>
        </div>
        <div class="item-row">
          <span class="item-total">Iznos: ${itemTotal.toFixed(2)} RSD</span>
        </div>
      </div>
    `;
  });

  const emailHTML = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: ${statusInfo.color}; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .status-box { background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${statusInfo.color}; }
        .order-items { margin: 20px 0; }
        .item { border-bottom: 1px solid #eee; padding: 15px 0; margin-bottom: 10px; }
        .item-row { display: flex; align-items: center; margin-bottom: 8px; }
        .item-row.name-image { align-items: center; gap: 15px; min-height: 60px; }
        .item-image { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd; }
        .item-name { font-weight: bold; font-size: 16px; margin: 0; display: flex; align-items: center; height: 60px; }
        .item-quantity, .item-price-per-unit { font-size: 14px; color: #666; }
        .item-total { text-align: right; font-weight: bold; font-size: 16px; color: #4f687b; }
        .totals { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
        .final-total { font-weight: bold; font-size: 18px; border-top: 2px solid #4f687b; padding-top: 10px; }
        .footer { background-color: #f1f5f8; padding: 20px; text-align: center; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${statusInfo.title}</h1>
        <p>${tenantName}</p>
      </div>

      <div class="content">
        <p>Poštovani/a ${order.user},</p>

        <div class="status-box">
          <h2>ID porudžbine: #${orderId}</h2>
          <p><strong>Novi status:</strong> ${newStatus}</p>
          <p>${statusInfo.message}</p>
        </div>

        <h2>Detalji porudžbine</h2>
        <div class="order-items">
          ${orderItemsHTML}
        </div>

        <div class="totals">
          ${order.shipping !== undefined ? `
          <div class="total-row">
            <span>Dostava:</span>
            <span>${Number(order.shipping) === 0 ? 'Besplatno' : Number(order.shipping).toFixed(2) + ' RSD'}</span>
          </div>
          ` : ''}
          <div class="total-row final-total">
            <span>UKUPNO:</span>
            <span>${Number(order.total).toFixed(2)} RSD</span>
          </div>
        </div>

        ${order.address ? `
        <h3>Adresa dostave</h3>
        <p>
          ${order.user}<br>
          ${order.address}<br>
          ${order.city ? order.city : ''}${order.postalCode ? ', ' + order.postalCode : ''}<br>
          ${order.userPhone ? 'Telefon: ' + order.userPhone : ''}
        </p>
        ` : ''}

        <p>Možete nas kontaktirati ukoliko imate bilo kakva pitanja:</p>
        <p>📧 Email: ${tenantEmail}</p>
        <p>📞 Telefon: ${tenantPhone}</p>
      </div>

      <div class="footer">
        <p><em>Hvala Vam što ste odabrali ${tenantName}!</em></p>
      </div>
    </body>
    </html>
  `;

  const emailData = {
    to: order.userEmail,
    subject: `Promena statusa porudžbine #${orderId} - ${newStatus}`,
    html: emailHTML,
    from: process.env.EMAIL_USER || "noreply@kidsswinghamaven.com",
    tenantId: tenantId
  };

  console.log('Email data prepared:', {
    to: emailData.to,
    subject: emailData.subject,
    tenantId: emailData.tenantId
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  console.log('Sending email to:', `${baseUrl}/api/send-email`);

  const response = await fetch(`${baseUrl}/api/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(emailData)
  });

  console.log('Email API response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Email send error:', errorText);
    throw new Error(`Failed to send email: ${response.status}`);
  }

  const result = await response.json();
  console.log('Email sent result:', result);
  return result;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getUserDbFromSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = session;
    const { searchParams } = new URL(req.url);

    // Get pagination parameters
    const page = parseInt(searchParams.get('page') || '0');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';

    // Build filter query - search by Order ID only
    const filter: any = {};
    if (search) {
      // Check if search is a valid ObjectId (full match)
      if (ObjectId.isValid(search) && search.length === 24) {
        filter._id = new ObjectId(search);
      } else if (search.length > 0) {
        // For partial matches, get all orders and filter by string representation
        // This will be handled after fetching
      }
    }

    // For partial ObjectId search, we need to fetch all and filter
    if (search && search.length > 0 && search.length < 24) {
      // Fetch all orders and filter by string representation of _id
      const allOrders = await db.collection("Orders")
        .find({})
        .sort({ orderTime: -1 })
        .toArray();
      const filteredOrders = allOrders.filter(order =>
        order._id.toString().toLowerCase().includes(search.toLowerCase())
      );

      const totalCount = filteredOrders.length;
      const paginatedOrders = filteredOrders.slice(page * pageSize, (page + 1) * pageSize);

      return NextResponse.json({
        data: paginatedOrders,
        totalCount,
        page,
        pageSize
      }, { status: 200 });
    }

    // Get total count for exact match or no search
    const totalCount = await db.collection("Orders").countDocuments(filter);

    // Get paginated data - sorted by newest first
    const allOrders = await db.collection("Orders")
      .find(filter)
      .sort({ orderTime: -1 })
      .skip(page * pageSize)
      .limit(pageSize)
      .toArray();

    return NextResponse.json({
      data: allOrders,
      totalCount,
      page,
      pageSize
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}