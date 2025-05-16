<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    /**
     * Get comments for a post
     */
    public function index(Post $post): JsonResponse
    {
        $comments = $post->comments()
            ->with(['user', 'replies.user'])
            ->whereNull('parent_id') // Only top-level comments
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $comments
        ]);
    }

    /**
     * Create a new comment
     */
    public function store(Request $request, Post $post): JsonResponse
    {
        $validated = $request->validate([
            'content' => 'required|string|max:2000',
            'parent_id' => 'nullable|exists:comments,id'
        ]);

        $comment = $post->comments()->create([
            'user_id' => Auth::id(),
            'content' => $validated['content'],
            'parent_id' => $validated['parent_id'] ?? null
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Comment added successfully',
            'data' => $comment->load('user')
        ], 201);
    }

    /**
     * Update a comment (author only)
     */
   public function update(Request $request, Post $post, Comment $comment): JsonResponse
{
    // Verify comment belongs to post
    if ($comment->post_id !== $post->id) {
        return response()->json([
            'success' => false,
            'message' => 'Comment does not belong to this post'
        ], 422);
    }

    $validated = $request->validate([
        'content' => 'required|string|max:2000'
    ]);

    $comment->update($validated);

    return response()->json([
        'success' => true,
        'message' => 'Comment updated successfully',
        'data' => $comment->fresh()
    ]);
}

    /**
     * Delete a comment (author or post owner)
     */
 public function destroy($post, Comment $comment): JsonResponse
{
    $comment->replies()->delete();
    $comment->delete();

    return response()->json([
        'success' => true,
        'message' => 'Comment deleted successfully'
    ]);
}
}