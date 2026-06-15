# 🛒 Laravel Multi-Vendor E-Commerce Website

A full-featured multi-vendor e-commerce platform built with Laravel and React. It supports vendor management, Stripe payments, product variations, order management, and background jobs.

---

## 🚀 Features
Multi-vendor system  
Vendor dashboard  
Product variations  
Order management  
Stripe payments  
Authentication  
Queues  
File storage  

---

## 🧰 Requirements
PHP 8.2+  
Composer latest  
Node.js 18+  
NPM  
MySQL 8+  
Git  
Stripe account  

---

## ⚙️ Setup Instructions

git clone <repository-url>  
cd <project-folder>  
composer install  
npm install  
cp .env.example .env  

php artisan key:generate  
php artisan migrate --seed  
php artisan storage:link  

php artisan serve  
npm run dev  
php artisan queue:listen --tries=1  

---

## 🔐 Environment Variables

DB_CONNECTION=mysql  
DB_HOST=127.0.0.1  
DB_PORT=3306  
DB_DATABASE=your_database_name  
DB_USERNAME=your_username  
DB_PASSWORD=your_password  

STRIPE_KEY=your_stripe_key  
STRIPE_SECRET=your_stripe_secret  

---

## 🏭 Production Build

composer install --optimize-autoloader --no-dev  
php artisan config:cache  
php artisan route:cache  
php artisan migrate --force  
npm run build  

---

## 📄 License
MIT
