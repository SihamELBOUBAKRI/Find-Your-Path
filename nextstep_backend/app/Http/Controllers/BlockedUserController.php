<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class BlockedUserController extends Controller
{
    /**
     * Get blocked users list
     */
     public function index(): JsonResponse
    {
        $blockedUsers = Auth::user()->blockedUsers()
            ->select('users.id', 'users.name', 'users.email', 'users.avatar') // Select specific fields
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $blockedUsers
        ]);
    }
    /**
     * Block a user
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);

        // Can't block yourself
        if ($validated['user_id'] == Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot block yourself'
            ], 400);
        }

        Auth::user()->blockedUsers()->syncWithoutDetaching([$validated['user_id']]);

        return response()->json([
            'success' => true,
            'message' => 'User blocked successfully'
        ]);
    }

    /**
     * Unblock a user
     */
    public function destroy(User $user): JsonResponse
    {
        Auth::user()->blockedUsers()->detach($user->id);

        return response()->json([
            'success' => true,
            'message' => 'User unblocked successfully'
        ]);
    }
}