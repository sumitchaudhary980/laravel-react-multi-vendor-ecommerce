<?php

namespace App\Providers;

use App\services\CartService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(CartService::class, function () {
            return new CartService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Inertia::share([
            'user' => function () {
                $user = Auth::user();
                return $user ? $user->only(['id', 'name', 'email', 'profile_picture']) : null;

            }
        ]);
        Schedule::command('payout:vendors')
        ->monthlyOn(1,'00:00')
        ->withoutOverlapping();

        Vite::prefetch(concurrency: 3);
    }
}
