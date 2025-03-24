<?php

namespace App\Http\Middleware;

use Closure;
use Inertia\Inertia;

class ShareUserData
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        // Share the authenticated user data globally
        Inertia::share([
            'user' => auth()->user(),
        ]);

        return $next($request);
    }
}
