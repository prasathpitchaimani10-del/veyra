# Veyra — Modern Editorial E-Commerce

Veyra is a full-stack e-commerce web application engineered with a **Modern Editorial E-Commerce UI** combined with **Premium Minimal UI** design principles. It provides a complete end-to-end shopping workflow with customer authentication, dynamic catalog exploration, cart management, Cash on Delivery (COD) order placement, order status tracking, and a dedicated administrative console.

---

## Technology Stack

- **Frontend**: React.js 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion
- **Backend**: Node.js, Express.js REST API
- **Database**: MongoDB (with resilient embedded storage adapter for zero-setup execution)
- **Authentication**: JSON Web Tokens (JWT) with bcrypt password hashing
- **Deployment**: Vercel ready (frontend SPA + backend serverless API)

---

## Core Features

### Customer Experience
1. **User Registration**: Secure account creation with client and server-side validation, duplicate prevention, and password hashing.
2. **User Login & Session**: JWT-based session persistence with protected routes.
3. **Dynamic Catalog**: Filter by category, price ranges, search terms, and sort by price or newest.
4. **Product Details (PDP)**: Contiguous purchase module with high-resolution imagery, technical highlights, stock indicators, and quantity selector.
5. **Interactive Cart**: Slide-over drawer and dedicated cart page with real-time automatic subtotal, free delivery calculation, and total computation.
6. **Checkout & Cash on Delivery**: Delivery address input with pincode verification and native Cash on Delivery (COD) selection.
7. **Order Confirmation**: Exact order summary with unique order ID (`VYR-XXXXXX`), timestamps, and delivery recap.
8. **Order History & Tracking**: Real-time status tracking (`Confirmed` → `Processing` → `Shipped` → `Delivered`).
9. **Customer Profile**: Personal details management and order shortcuts.

### Administrative Experience
1. **Dedicated Admin Portal**: Separate authentication gateway (`/admin-login`) with administrative security.
2. **Operations Dashboard**: Real-time business metrics including Total Products, Total Customers, Total Orders, Gross Revenue, and Database Health.
3. **Product Management**: Add new products with validation, real-time inventory management, price adjustments, and deletion.
4. **Customer Overview**: View registered customers, order history counts, and total lifetime spend without exposing sensitive credentials.
5. **Order Dispatch & Status Updates**: Live order management allowing administrators to advance order statuses from `Confirmed` to `Delivered`.

---

## Default Administrative & Demo Credentials

For testing and evaluation:

- **Admin Portal**:
  - **URL**: `/#/admin-login`
  - **Email**: `admin@veyra.store`
  - **Password**: `AdminPassword123`

- **Customer Demo Account**:
  - **Email**: `customer@veyra.store`
  - **Password**: `Customer123!`

*(You can also register your own customer account at any time).*

---

## Environment Variables

Configure the following in your `.env` or deployment settings:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://<user>:<pwd>@cluster.mongodb.net/veyra?retryWrites=true&w=majority` |
| `JWT_SECRET` | Secret key for JWT signing | Strong random string |
| `PORT` | Server listening port | `3000` |
| `NODE_ENV` | Runtime environment | `development` or `production` |

*Note: If `MONGODB_URI` is not provided, Veyra automatically falls back to its built-in disk-persisted storage (`server/data/store.json`), allowing instant full functionality without requiring an external database cluster during review.*

---

## Local Development & Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Starts the full-stack Express server with integrated Vite middleware on `http://localhost:3000`.

### 3. Production Build
```bash
npm run build
```
Compiles client assets into the `dist/` directory.

### 4. Start Production Server
```bash
npm start
```

---

## Deployment on Vercel

1. Push the repository to GitHub or GitLab.
2. Import the project into the [Vercel Dashboard](https://vercel.com).
3. The included `vercel.json` automatically configures:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - API Handler: `api/index.ts` routing `/api/*`
4. In **Project Settings → Environment Variables**, add:
   - `MONGODB_URI`: Your MongoDB Atlas connection URI
   - `JWT_SECRET`: A secure production secret
5. Deploy.
