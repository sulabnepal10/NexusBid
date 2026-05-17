# 🔨 NexusBid Auction Engine

NexusBid is a full-stack, real-time auction platform designed to handle high-frequency concurrent bidding. This project demonstrates how to solve database race conditions using row-level locking, broadcast real-time updates via WebSockets, and monitor system health using Grafana.

## 🚀 Features

* **Real-Time Bidding:** Live auction price updates pushed instantly to all connected clients using `Socket.io`.
* **Concurrency Control:** Prevents race conditions (two users bidding the exact same amount simultaneously) using MySQL Transactions and `SELECT ... FOR UPDATE` row-level locks.
* **Data Seeding & Stress Testing:** Includes scripts to instantly generate hundreds of fake users/auctions and simulate 50 concurrent users aggressively bidding.
* **Live System Monitoring:** Pre-configured SQL queries for Grafana to track highest bids per minute and most active auctions in real-time.

## 🛠️ Tech Stack

* **Frontend:** React, TypeScript, Vite
* **Backend:** Node.js, Express, Socket.io
* **Database & ORM:** MySQL / MariaDB, Prisma ORM (v6)
* **Monitoring:** Grafana

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
* **Node.js** (v18 or higher)
* **MySQL** or **MariaDB** (Running locally on port 3306)
* **Grafana** (Configured to run on port 3005)

---

## 📦 Installation & Setup

### 1. Database Setup & Stored Procedure
First, create the database and inject the Stored Procedure required for safe concurrent bidding.

1. Log into your MySQL/MariaDB terminal:
   ```bash
   mariadb -u root -p