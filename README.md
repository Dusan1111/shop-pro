# E-commerce Shop Wizard

An admin panel for managing e-commerce operations including products, categories, orders, attributes, and global discounts.

## Features

- **Product Management**: Create, edit, and delete products
- **Category Management**: Organize products into categories
- **Order Management**: View and manage customer orders
- **Attribute Management**: Define product attributes and values
- **Global Discounts**: Set up site-wide discount campaigns
- **Authentication**: Secure login system for admin access

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (create `.env.local`):
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) - you'll be redirected to the admin panel

## Admin Routes

- `/admin/manage-products` - Product management
- `/admin/manage-categories` - Category management
- `/admin/manage-orders` - Order management
- `/admin/manage-attributes` - Attribute management
- `/admin/manage-attribute-values` - Attribute value management
- `/admin/manage-global-discounts` - Global discount management
- `/login` - Admin login