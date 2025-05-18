<?php

namespace App\Http\Controllers;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Services\NotificationService;
use App\Http\Middleware\CheckPostOwner;

class PostController extends Controller
{

     
    /**
     * Get all posts (with pagination)
     */
    public function index(Request $request): JsonResponse
    {
        $posts = Post::with(['user', 'comments.user'])
            ->withCount('comments')
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $posts
        ]);
    }

    /**
     * Create a new post
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'content' => 'required|string|max:5000',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50'
        ]);

        $post = Auth::user()->posts()->create([
            'content' => $validated['content'],
            'tags' =>  $validated['tags'] ?? null,
            'slug' => \Str::slug(Auth::user()->name . '-' . uniqid())
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Post created successfully',
            'data' => $post->load('user')
        ], 201);
    }

    /**
     * Get a single post
     */
    public function show(Post $post): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $post->load(['user', 'comments.user'])
        ]);
    }

    /**
     * Update a post (author only)
     */
    public function update(Request $request, Post $post): JsonResponse
    {
        // Middleware already verified ownership, so we can proceed directly
        $validated = $request->validate([
            'content' => 'sometimes|string|max:5000',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50'
        ]);

        if (isset($validated['tags'])) {
            $validated['tags'] = !empty($validated['tags']) 
                ? $validated['tags'] 
                : null;
        }

        $post->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Post updated successfully',
            'data' => $post->fresh()
        ]);
    }

    /**
     * Delete a post (author or admin)
     */
    public function destroy(Post $post): JsonResponse
    {
        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Post deleted successfully'
        ]);
    }

    /**
 * Toggle like on a post
 */
public function like(Post $post): JsonResponse
{
    $result = $post->toggleLike();
    if ($result) { // Only if like was added (not removed)
    NotificationService::create(
        $post->user,
        'New Like',
        auth()->user()->name . ' liked your post',
        'like',
        ['post_id' => $post->id]
    );
}
    return response()->json([
        'success' => true,
        'message' => $result ? 'Post liked' : 'Post unliked',
        'likes' => $post->likes,
        'is_liked' => $result
    ]);
}
}