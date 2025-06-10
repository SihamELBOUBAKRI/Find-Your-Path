<?php

namespace App\Http\Controllers;

use App\Models\UserSavedItem;
use App\Models\Institution;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class SavedItemController extends Controller
{
    /**
     * Get all saved items for the authenticated user
     */
    public function index(): JsonResponse
    {
        $savedItems = UserSavedItem::where('user_id', Auth::id())
            ->with(['institution', 'event'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $savedItems
        ]);
    }

    /**
     * Save an institution or event
     */
    public function store(Request $request): JsonResponse
{
    $validated = $request->validate([
        'type' => 'required|in:institution,event',
        'institution_id' => 'required_if:type,institution|exists:institutions,id',
        'event_id' => 'required_if:type,event|exists:events,id'
    ]);

    // Get authenticated user's ID
    $userId = Auth::id();
    if (!$userId) {
        return response()->json([
            'success' => false,
            'message' => 'Unauthenticated'
        ], 401);
    }

    // Determine the correct type based on what's being saved
    $actualType = $validated['type'] === 'institution' ? 'institution' : 'event';

    // Prevent duplicate saves
    $existing = UserSavedItem::where('user_id', $userId)
        ->where(function($query) use ($validated, $actualType) {
            if ($actualType === 'institution') {
                $query->where('institution_id', $validated['institution_id']);
            } else {
                $query->where('event_id', $validated['event_id']);
            }
        })
        ->exists();

    if ($existing) {
        return response()->json([
            'success' => false,
            'message' => 'Item already saved'
        ], 422);
    }

    $savedItem = UserSavedItem::create([
        'user_id' => $userId, // Use the numeric ID
        'institution_id' => $validated['institution_id'] ?? null,
        'event_id' => $validated['event_id'] ?? null,
        'type' => $actualType
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Item saved successfully',
        'data' => $savedItem->load([$actualType])
    ], 201);
}

    /**
     * Remove a saved item
     */
    public function destroy(UserSavedItem $savedItem): JsonResponse
    {
        // Verify ownership
        if ($savedItem->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $savedItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item removed from saved items'
        ]);
    }

    /**
     * Get only saved institutions
     */
    public function savedInstitutions(): JsonResponse
    {
        $institutions = UserSavedItem::where('user_id', Auth::id())
            ->institutions()
            ->with('institution')
            ->get()
            ->pluck('institution');

        return response()->json([
            'success' => true,
            'data' => $institutions
        ]);
    }

    /**
     * Get only saved events
     */
    public function savedEvents(): JsonResponse
    {
        $events = UserSavedItem::where('user_id', Auth::id())
            ->events()
            ->with('event')
            ->get()
            ->pluck('event');

        return response()->json([
            'success' => true,
            'data' => $events
        ]);
    }
}