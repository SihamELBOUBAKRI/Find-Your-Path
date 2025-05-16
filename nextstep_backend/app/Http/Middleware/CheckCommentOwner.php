<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckCommentOwner
{
    public function handle(Request $request, Closure $next)
    {
        $comment = $request->route('comment');
        
        // Allow deletion if user owns comment OR owns the post
        if (auth()->id() !== $comment->user_id && auth()->id() !== $comment->post->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: You do not own this comment or its parent post'
            ], 403);
        }

        return $next($request);
    }
}