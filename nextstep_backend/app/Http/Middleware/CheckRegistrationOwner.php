<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRegistrationOwner
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle($request, $next)
    {
        $userId = $request->route('user');
        
        if (auth()->id() != $userId && !auth()->user()->isAdmin()) {
            abort(403, 'Unauthorized action');
        }

        return $next($request);
    }

}
