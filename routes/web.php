<?php

use App\Enums\RolesEnum;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StripeController;
use App\Http\Controllers\VendorController;
use Illuminate\Support\Facades\Route;

//Guest Route
Route::controller(ProductController::class)->group(function () {
    Route::get('/', 'home')->name('dashboard');
    Route::get('/product/{product:slug}', 'show')->name('product.show');
    Route::get('/d/{department:slug}/products', 'byDepartment')->name('product.byDepartment');

});

Route::controller(ContactController::class)->group(function(){
    Route::get('/contact', 'contact')->name('contact');
    Route::post('/send-message', 'sendMessage')->name('contact');
    Route::get('/about-us', 'about')->name('about');
});

Route::get('/s/{vendor:store_name}', [VendorController::class, 'profile'])
    ->name('vendor.profile');

Route::controller(CartController::class)->group(function () {
    Route::get('/cart', 'index')->name('cart.index');
    Route::post('/cart/add/{product}', 'store')->name('cart.store');
    Route::put('/cart/{product}', 'update')->name('cart.update');
    Route::delete('/cart/{product}', 'destroy')->name('cart.destroy');
    Route::post('/save-later/{id}', 'save_later')->name('cart.savelater')->middleware('auth');
});


Route::post('/stripe/webhook', [StripeController::class, 'webhook'])
    ->name('stripe.webhook');

//Auth Routes
Route::middleware('auth')->group(function () {

    Route::controller(ProfileController::class)->group(function () {
        Route::get('/profile', 'edit')->name('profile.edit');
        Route::patch('/profile', 'update')->name('profile.update');
        Route::delete('/profile', 'destroy')->name('profile.destroy');
        Route::post('/profile/picture', 'updateProfilePicture')->name('profile.picture.update');
    });

    Route::middleware(['verified'])->group(function () {
        Route::get('/orders', [OrderController::class, 'index'])->name('order.show');
        Route::get('/order/{tracking_number}/track', [OrderController::class, 'trackOrder'])->name('order.track');

        Route::controller(AddressController::class)->group(function () {
            Route::get('/shipping-address', 'address')->name('address.show');
            Route::post('/add-address', 'store')->name('address.store');
            Route::post('/update-address', 'update_address')->name('address.update');
            Route::get('/delete-address/{id}', 'delete_address')->name('address.delete');
            Route::get('/default-address/{id}', 'default_address')->name('address.default');
        });

        Route::post('/cart/checkout', [CartController::class, 'checkout'])->name('cart.checkout');

        Route::controller(StripeController::class)->group(function () {
            Route::get('/stripe/success', 'success')->name('stripe.success');
            Route::get('/stripe/failure', 'failure')->name('stripe.failure');
            Route::post('/stripe/connect', 'connect')->name('stripe.connect')
                ->middleware('role:' . RolesEnum::Vendor->value);
        });
        Route::post('become-a-vendor', [VendorController::class, 'store'])
            ->name('vendor.store');

    });

});

require __DIR__ . '/auth.php';
