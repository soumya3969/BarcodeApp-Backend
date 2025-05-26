# BarcodeApp-Backend

Backend server for the Barcode App, a restaurant/table management and ordering system with QR code support.

## Features

- User authentication and role-based authorization (owner, manager, staff)
- Menu management (CRUD for menu items and categories)
- Table management (CRUD for tables, QR code generation)
- Order management (create, update, payment status)
- Offers management (CRUD for offers)
- QR code management (global and table-specific QR codes)
- Public endpoints for menu browsing and order creation
- File/image upload to Vercel Blob Storage
- Rate limiting, validation, and error handling

## Tech Stack

- Node.js, Express.js
- MongoDB (Mongoose ODM)
- JWT for authentication
- Multer for file uploads
- Vercel Blob Storage for images and QR codes
- Winston for logging
- Joi for validation

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- MongoDB database (local or Atlas)
- Vercel account (for Blob Storage, if using image uploads)

### Installation

```bash
git clone https://github.com/yourusername/barcodeapp-backend.git
cd barcodeapp-backend
npm install
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
CLIENT_URL=http://localhost:5173
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### Running the Server

```bash
npm run dev   # For development (nodemon)
npm start     # For production
```

Server runs on `http://localhost:5000` by default.
## Folder Structure
```
└── 📁BarcodeApp-Backend
    └── 📁controllers
        └── auth.controller.js
        └── menu.controller.js
        └── offer.controller.js
        └── order.controller.js
        └── public.controller.js
        └── qrcode.controller.js
        └── table.controller.js
        └── user.controller.js
    └── 📁middleware
        └── auth.js
        └── upload.js
    └── 📁models
        └── Category.model.js
        └── MenuItem.model.js
        └── Offer.model.js
        └── Order.model.js
        └── QRCode.model.js
        └── Table.model.js
        └── User.model.js
    └── 📁public
        └── index.html
    └── 📁routes
        └── auth.routes.js
        └── menu.routes.js
        └── offers.routes.js
        └── orders.routes.js
        └── public.routes.js
        └── qrcodes.routes.js
        └── tables.routes.js
        └── users.routes.js
    └── 📁uploads
    └── 📁utils
        └── storage.js
    └── .env
    └── .gitignore
    └── index.js
    └── package-lock.json
    └── package.json
    └── README.md
    └── vercel.json
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT
- `GET /api/auth/me` - Get current user info (requires JWT)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users (Owner only)

- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Menu

- `GET /api/menu` - List all menu items
- `GET /api/menu/categories` - List all categories
- `GET /api/menu/:id` - Get menu item by ID
- `POST /api/menu` - Create menu item (owner/manager)
- `PUT /api/menu/:id` - Update menu item (owner/manager)
- `DELETE /api/menu/:id` - Delete menu item (owner/manager)

### Offers

- `GET /api/offers` - List all offers
- `GET /api/offers/status/active` - List active offers
- `GET /api/offers/:id` - Get offer by ID
- `POST /api/offers` - Create offer (owner/manager)
- `PUT /api/offers/:id` - Update offer (owner/manager)
- `DELETE /api/offers/:id` - Delete offer (owner/manager)

### QR Codes

- `GET /api/qrcodes` - List all QR codes (owner/manager)
- `GET /api/qrcodes/:id` - Get QR code by ID
- `POST /api/qrcodes` - Create global QR code (owner/manager)
- `POST /api/qrcodes/global-menu` - Create global menu QR code (owner/manager)
- `DELETE /api/qrcodes/:id` - Delete QR code (owner/manager)

### Tables

- `GET /api/tables` - List all tables
- `GET /api/tables/:id` - Get table by ID
- `GET /api/tables/public/:id` - Get table by ID (public)
- `POST /api/tables` - Create table (owner/manager)
- `PUT /api/tables/:id` - Update table (owner/manager)
- `DELETE /api/tables/:id` - Delete table (owner/manager)
- `POST /api/tables/:id/qrcode` - Generate QR code for table (owner/manager)

### Orders

- `GET /api/orders` - List all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order (public)
- `PUT /api/orders/:id/status` - Update order status (staff/manager/owner)
- `PUT /api/orders/:id/payment` - Update payment status (staff/manager/owner)

### Public Endpoints

- `GET /api/public/menu` - List all menu items (public)
- `GET /api/public/menu/categories` - List menu categories (public)
- `GET /api/public/menu/:id` - Get menu item by ID (public)
- `GET /api/public/tables/:id` - Get table info (public)
- `GET /api/public/tables/:id/menu` - Get menu for a table (public)
- `POST /api/public/orders` - Create order (public)

## File Uploads

- Images and QR codes are uploaded to Vercel Blob Storage.
- Use the `image` field in menu item creation/update (multipart/form-data).

## Error Handling

- Standardized error responses with appropriate HTTP status codes.
- Rate limiting is applied to API and login endpoints.

## Deployment

- Can be deployed on Vercel (see `vercel.json`).
- Ensure environment variables are set in Vercel dashboard.

## License

ISC

---

**Authors:** Jayadev / Soumya

