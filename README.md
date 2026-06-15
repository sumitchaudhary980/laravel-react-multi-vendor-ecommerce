# 🛒 Laravel Multi-Vendor E-Commerce Website

A full-featured multi-vendor e-commerce platform built with Laravel and React. It supports vendor management, Stripe payment integration, product variations, order management, and background job processing.

## 🚀 Features
- Multi-vendor system
- Vendor dashboard
- Product management with variations
- Order management system
- Stripe payment integration
- Authentication system
- Queue & background jobs
- File storage handling

## 🧰 Requirements
PHP >= 8.2, Composer (latest), Node.js >= 18.x, NPM, MySQL >= 8.x, Git, Stripe account

## ⚙️ Setup Instructions
git clone <repository-url>
cd <project-folder>
composer install
npm install
cp .env.example .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password
STRIPE_KEY=your_stripe_key
STRIPE_SECRET=your_stripe_secret
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
npm run dev
php artisan queue:listen --tries=1

## 🏭 Production
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan migrate --force
npm run build

## 📄 License
MIT License
