# 🌾 FarmerBandh

### Direct Farm-to-Market Trading Platform

**Connecting farmers directly with buyers. Fair prices. Greater transparency. No unnecessary middlemen.**

FarmerBandh is a full-stack, location-aware agricultural marketplace that enables farmers to sell their products directly to buyers. It combines location-based product discovery, price negotiation, order management, farmer verification, dispute resolution, and administrative controls in one platform.

The platform is designed around three roles: **Buyer, Farmer, and Admin**, with role-based access control and dedicated workflows for each.

> **Project Status:** Core development completed. Payment gateway integration, real file uploads, external messaging, and real-time WebSocket communication are potential future enhancements.

---

## 📌 Table of Contents

* [Overview](#-overview)
* [The Problem](#-the-problem)
* [Key Features](#-key-features)
* [User Roles](#-user-roles)
* [Technology Stack](#-technology-stack)
* [System Architecture](#-system-architecture)
* [Core Modules](#-core-modules)
* [Database Design](#-database-design)
* [Security](#-security)
* [Getting Started](#-getting-started)
* [Configuration](#-configuration)
* [Development Roadmap](#-development-roadmap)
* [Current Limitations](#-current-limitations)
* [Intellectual Property and Usage Restrictions](#-intellectual-property-and-usage-restrictions)
* [Author](#-author)

---

## 🌱 Overview

Traditional agricultural supply chains often involve multiple intermediaries, creating additional costs and reducing transparency between farmers and buyers.

FarmerBandh aims to simplify this process by providing a centralized digital marketplace where buyers can discover nearby farmers, compare products, negotiate prices, place orders, and build long-term relationships with sellers.

Farmers can manage their product listings, process orders, negotiate prices, monitor sales, and request verification. Administrators can manage platform operations and maintain an auditable record of administrative activities.

### Our Goal

Build a transparent, location-aware agricultural marketplace that gives farmers greater control over selling their produce while helping buyers discover products directly from local sellers.

---

## 🎯 The Problem

Agricultural marketplaces can face several challenges:

* Dependence on intermediaries.
* Limited price transparency.
* Difficulty discovering nearby farmers.
* Limited direct communication between buyers and sellers.
* Lack of integrated order tracking and dispute resolution.
* Limited visibility into seller reputation and platform activities.

### Our Approach

FarmerBandh addresses these challenges through:

* Location-scoped product discovery.
* Direct buyer-to-farmer price negotiation.
* Integrated cart, checkout, and order management.
* Order tracking and status history.
* Farmer profiles and customer reviews.
* Returns, refunds, and dispute workflows.
* Farmer verification and administrative oversight.

---

## ✨ Key Features

### 🛒 Buyer Marketplace

* Browse agricultural products.
* Discover products according to location.
* Search, filter, and sort listings.
* View product details and farmer profiles.
* Add products to a shopping cart.
* Apply available coupons.
* Manage delivery addresses.
* Place and track orders.
* Negotiate prices directly with farmers.
* Save preferred farmers.
* Submit reviews and ratings.
* Request returns or raise disputes.
* Receive in-app notifications.

### 🚜 Farmer Dashboard

* Create and manage product listings.
* Manage product availability and asking prices.
* Receive and process customer orders.
* Update order statuses.
* Negotiate prices with buyers.
* Maintain a public farmer profile.
* Request farmer verification.
* Manage seller settings and bank details.
* View sales and performance analytics.
* Track payouts and seller operations.
* Receive relevant notifications.

### 🛡️ Admin Control Center

* Manage users and farmer accounts.
* Review farmer verification requests.
* Moderate product listings.
* Manage orders and platform operations.
* Handle disputes and returns.
* Manage payout workflows.
* Configure platform settings.
* Manage featured listings.
* Generate reports and export CSV data.
* Review administrative activity logs.

Administrative actions are designed to be recorded in an audit trail for accountability.

---

## 👥 User Roles

| Role       | Responsibilities                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| **Buyer**  | Discover products, negotiate prices, place orders, track purchases, and review farmers.                          |
| **Farmer** | List products, negotiate with buyers, fulfil orders, manage seller operations, and monitor performance.          |
| **Admin**  | Manage platform users, verify farmers, moderate listings, oversee disputes, and audit administrative activities. |

Access to protected functionality is controlled through authentication and role-based authorization.

---

## 🧰 Technology Stack

### Frontend

* React 18
* Vite
* JavaScript (JSX)
* React Router v6
* Axios
* React Context API
* Plain CSS and design tokens
* Custom SVG-based charts

### Backend

* .NET 8 Web API
* C#
* Entity Framework Core 8
* Pomelo Entity Framework Core MySQL provider
* JWT authentication
* BCrypt password hashing
* FluentValidation
* Swagger / OpenAPI
* Background services using `IHostedService`

### Database

* MySQL 8
* MySQL development port: `3307`
* 22 database tables
* GUID-based primary keys
* Entity Framework Core

### Architecture

* Clean Architecture
* API, Application, Domain, and Infrastructure layers
* Role-based access control
* Snapshot-based order and payout data
* Immutable-style activity history

---

## 🏗️ System Architecture

FarmerBandh follows Clean Architecture principles to separate application responsibilities.

```text
                 ┌──────────────────────────┐
                 │       React Frontend     │
                 │      React + Vite        │
                 └────────────┬─────────────┘
                              │
                              │ HTTP / REST API
                              ▼
                 ┌──────────────────────────┐
                 │      .NET 8 Web API      │
                 │ Authentication & API     │
                 └────────────┬─────────────┘
                              │
                              ▼
                 ┌──────────────────────────┐
                 │      Application Layer   │
                 │ Use Cases & Validation   │
                 └────────────┬─────────────┘
                              │
                              ▼
                 ┌──────────────────────────┐
                 │        Domain Layer      │
                 │ Business Rules & Models  │
                 └──────────────────────────┘
                              ▲
                              │
                 ┌────────────┴─────────────┐
                 │    Infrastructure Layer  │
                 │ EF Core & Data Access    │
                 └────────────┬─────────────┘
                              │
                              ▼
                 ┌──────────────────────────┐
                 │         MySQL 8          │
                 │       22 Tables          │
                 └──────────────────────────┘
```

The API layer handles incoming requests, the Application layer coordinates use cases, the Domain layer contains business concepts and rules, and the Infrastructure layer implements persistence and external integrations.

---

## 📦 Core Modules

The project was developed through eight implementation phases.

| Phase | Module                   | Main Capabilities                                                                                      |
| ----- | ------------------------ | ------------------------------------------------------------------------------------------------------ |
| 1     | Authentication           | Registration, login, JWT, refresh tokens, logout, and role-based redirects.                            |
| 2     | Marketplace              | Product listings, categories, search, filters, sorting, and location-scoped browsing.                  |
| 3     | Cart and Orders          | Cart management, coupons, addresses, checkout, orders, and order items.                                |
| 4     | Order Lifecycle          | Status history, returns, refunds, disputes, and reviews.                                               |
| 5     | Negotiations             | Counter-offers, negotiation messages, saved farmers, and public profiles.                              |
| 6     | Seller Operations        | Seller dashboard, listings management, verification, payouts, and analytics.                           |
| 7     | Administration           | User management, listing moderation, dispute workflows, reports, CSV exports, and audit logs.          |
| 8     | Notifications and Polish | In-app notifications, unread badges, notification preferences, toast messages, and responsive layouts. |

---

## 🗄️ Database Design

FarmerBandh uses MySQL 8 with 22 tables to support its marketplace workflows.

The data model covers:

* User accounts and role-specific profiles.
* Refresh tokens and authentication.
* Product categories and listings.
* Shopping carts and cart items.
* Coupons and delivery addresses.
* Orders and order items.
* Order status history.
* Returns, refunds, and disputes.
* Reviews and ratings.
* Negotiations and negotiation messages.
* Saved farmers.
* Payouts and bank accounts.
* Farmer verification requests.
* Seller settings.
* Administrative activity logs.
* Featured listings and platform settings.
* Notifications and related supporting entities.

### Data Integrity Principles

**Order snapshots:** Order items preserve relevant purchase details, such as the product name and price at the time of purchase.

**Address snapshots:** Order records preserve relevant delivery information so that later address changes do not retroactively modify existing orders.

**Payout snapshots:** Relevant payout bank details are captured for the payout workflow rather than relying solely on mutable profile data.

**Auditability:** Administrative activity records support traceability of platform operations.

**GUID primary keys:** GUIDs are used as entity identifiers across the database.

---

## 🔐 Security

Security is a core part of the platform's design.

Implemented security-related mechanisms include:

* JWT-based authentication.
* BCrypt password hashing.
* Refresh-token workflows.
* Role-based authorization.
* Validation of incoming requests.
* Protected administrative functionality.
* Audit logging for administrative actions.

**Important:** These mechanisms do not, by themselves, establish that the entire application is production-secure. Production deployment requires additional review of token storage, authorization policies, secrets management, rate limiting, input validation, database permissions, and other relevant controls.

Never commit production credentials, private keys, database passwords, or API secrets to the repository.

---

## 🚀 Getting Started

Follow these instructions to prepare a local development environment.

### Prerequisites

Install the following:

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/)
* [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
* [MySQL 8](https://dev.mysql.com/downloads/)

You will also need a code editor, such as Visual Studio Code or Visual Studio.

### 1. Clone the Repository

```bash
git clone https://github.com/Saurabh-Singh33/FarmerBandh.git
cd FarmerBandh
```

### 2. Configure MySQL

Start your MySQL server and create a development database.

```sql
CREATE DATABASE farmerbandh;
```

The database name above is an example. Use the actual database name expected by your backend configuration.

If MySQL is running on port `3307`, ensure the connection string uses that port.

### 3. Configure the Backend

Navigate to the backend project directory.

```bash
cd backend
```

**Note:** Replace `backend` with the actual backend directory name if your repository uses a different structure.

Configure your local database connection string and authentication settings using the project's existing configuration conventions.

Do not commit real credentials.

Restore dependencies:

```bash
dotnet restore
```

Apply database migrations if the project uses Entity Framework Core migrations:

```bash
dotnet ef database update
```

Run the API:

```bash
dotnet run
```

Use the URL printed in the terminal to access the API.

If the project does not include migrations, follow its existing database initialization process instead.

### 4. Configure the Frontend

Open a second terminal in the repository root and navigate to the frontend project directory.

```bash
cd frontend
```

**Note:** Replace `frontend` with the actual frontend directory name if necessary.

Install dependencies:

```bash
npm install
```

Configure the API base URL using the environment variable expected by the existing Axios configuration.

For Vite projects, client-side environment variables normally use the `VITE_` prefix. Never put private secrets in Vite environment variables because they can be exposed to browser users.

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal.

### 5. Verify the Application

Once the backend, database, and frontend are configured:

1. Open the frontend in your browser.
2. Register a buyer or farmer account.
3. Verify the role-based dashboard.
4. Browse available products.
5. Test the relevant marketplace workflows.
6. Verify backend API responses and database changes.

**Setup note:** Exact folder names, environment variable names, migration commands, seed-data procedures, and startup URLs depend on the files actually present in the repository. Adapt these instructions to the project's implementation before treating them as a verified installation guide.

---

## ⚙️ Configuration

Use environment-specific configuration for:

* Database connection strings.
* JWT signing keys.
* Token expiration settings.
* Frontend API base URLs.
* Application environment settings.
* Administrative configuration.

For local development, use the configuration approach already implemented in the project.

Before pushing code, verify that `.gitignore` excludes sensitive files, including applicable `.env` files and local secret configurations.

If a credential has already been committed, removing the file in a later commit does not remove it from Git history. Rotate the exposed credential and address the repository history as appropriate.

---

## 🔭 Development Roadmap

The following are potential future enhancements, not claims about existing functionality.

* [ ] Integrate a real payment gateway.
* [ ] Implement secure product image uploads.
* [ ] Add email and SMS notifications.
* [ ] Introduce WebSocket-based real-time updates.
* [ ] Strengthen production deployment and security controls.
* [ ] Improve automated testing and continuous integration.
* [ ] Add production monitoring and operational logging.
* [ ] Improve deployment documentation and backup procedures.

---

## ⚠️ Current Limitations

FarmerBandh is a developed marketplace application, but some production integrations remain outside its current scope.

| Area              | Current Implementation                                                 |
| ----------------- | ---------------------------------------------------------------------- |
| Payments          | Mocked payment workflows; no real payment gateway.                     |
| File uploads      | Filenames are stored; real file-upload integration is not implemented. |
| Email and SMS     | In-app notifications only.                                             |
| Real-time updates | Polling-based updates rather than WebSockets.                          |
| Language          | JavaScript/JSX on the frontend; no TypeScript.                         |

These limitations should be considered before deploying the application for real commercial transactions.

---

## 🔒 Intellectual Property and Usage Restrictions

**Copyright © 2026 Saurabh Singh Rathore. All rights reserved.**

FarmerBandh is an original software project developed by its author.

Unless explicit written permission is granted by the copyright holder, no one is authorized to:

* Copy or redistribute this project's source code.
* Reproduce or republish substantial portions of the project.
* Create or distribute derivative works based on this project.
* Reuse the project's implementation in another commercial or public project.
* Repackage, sell, sublicense, or commercially exploit the project or substantial portions of its source code.

Viewing this repository does not grant permission to reuse, distribute, modify, or commercially exploit its source code.

**This notice is not a substitute for a formal software license.** The repository's `LICENSE` file, applicable law, and any separately agreed permissions determine the actual terms governing use of the software. If the project is intended to remain proprietary, include an appropriate proprietary license and ensure that you have the rights to restrict the use of all included code and assets.

Unauthorized copying or distribution may violate applicable copyright law. Rights and remedies depend on the circumstances and applicable jurisdiction.

---

## 👨‍💻 Author

**Saurabh Singh Rathore**

B.Tech Computer Engineering

GitHub: [@Saurabh-Singh33](https://github.com/Saurabh-Singh33)

Project: [FarmerBandh](https://github.com/Saurabh-Singh33/FarmerBandh)

---

## 🌾 Vision

FarmerBandh aims to make agricultural trade more direct, transparent, and accessible by bringing farmers and buyers together on a single digital platform.

**Built with React, .NET 8, and MySQL.**

*Direct trade. Fairer opportunities. Stronger farmer-buyer relationships.*
