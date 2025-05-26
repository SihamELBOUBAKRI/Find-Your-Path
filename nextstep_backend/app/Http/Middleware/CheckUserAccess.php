<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle($request, Closure $next)
    {
        $requestedUserId = $request->route('user'); // Gets {user} from URL
        
        // Allow if:
        // 1. User accesses their own data, OR
        // 2. User is admin
        if (auth()->id() != $requestedUserId && !auth()->user()->isAdmin()) {
            abort(403, 'Unauthorized: You can only view your own registrations');
        }

        return $next($request);
    }
}
