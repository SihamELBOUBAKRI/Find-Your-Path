<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckPostOwner
{
    public function handle(Request $request, Closure $next)
    {
        $post = $request->route('post');
        
        if (auth()->id() !== $post->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: You do not own this post'
            ], 403);
        }

        return $next($request);
    }
}