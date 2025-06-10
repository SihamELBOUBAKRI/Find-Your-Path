<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Http\JsonResponse;

class UserEventController extends Controller
{
    /**
     * Register a user for an event
     */
   public function register(Request $request, Event $event): JsonResponse
{
    $validated = $request->validate([
        'user_id' => ['required', 'exists:users,id'],
        'status' => ['sometimes', Rule::in(['registered', 'attended', 'canceled'])]
    ]);

    // Get the registering user
    $user = User::find($validated['user_id']);

    // Prevent duplicate registration
    if ($event->registeredUsers()->where('user_id', $validated['user_id'])->exists()) {
        return response()->json([
            'success' => false,
            'message' => 'User is already registered for this event'
        ], 422);
    }

    // Default to 'attended' status
    $status = $validated['status'] ?? 'attended';

    $event->registeredUsers()->attach($validated['user_id'], [
        'status' => $status
    ]);

    // Only create notification if event has an owner
    if ($event->user) {
        $event->user->notifications()->create([
            'title' => 'New Registration',
            'message' => $user->name . ' registered for your event: ' . $event->title,
            'type' => 'event',
            'data' => ['event_id' => $event->id]
        ]);
    }

    return response()->json([
        'success' => true,
        'message' => 'Successfully registered for event with status: ' . $status,
        'data' => $event->load('registeredUsers')
    ], 201);
}
public function verifyRegistration(Event $event, User $user): JsonResponse
{
    $registration = $event->registeredUsers()
        ->where('user_id', $user->id)
        ->first();

    if (!$registration) {
        return response()->json([
            'success' => false,
            'message' => 'User is not registered for this event'
        ], 404);
    }

    return response()->json([
        'success' => true,
        'data' => [
            'user_id' => $user->id,
            'event_id' => $event->id,
            'status' => $registration->pivot->status,
            'registered_at' => $registration->pivot->created_at
        ]
    ]);
}

    /**
     * Update registration status
     */
    public function updateStatus(Request $request, Event $event, User $user): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['registered', 'attended', 'canceled'])]
        ]);

        // Verify the user is registered for the event
        if (!$event->registeredUsers()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'User is not registered for this event'
            ], 404);
        }

        $event->registeredUsers()->updateExistingPivot($user->id, [
            'status' => $validated['status']
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Registration status updated',
            'data' => [
                'user_id' => $user->id,
                'status' => $validated['status']
            ]
        ]);
    }

    /**
     * Cancel registration
     */
    public function cancelRegistration(Event $event, $userId): JsonResponse
{
    // Convert userId to integer
    $userId = (int)$userId;
    
    // Find the user
    $user = User::find($userId);
    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'User not found'
        ], 404);
    }

    // Check if registration exists
    $registration = DB::table('user_event')
        ->where('event_id', $event->id)
        ->where('user_id', $userId)
        ->whereNull('deleted_at')
        ->first();

    if (!$registration) {
        return response()->json([
            'success' => false,
            'message' => 'Registration not found or already canceled'
        ], 404);
    }

    // Perform cancellation
    $deleted = DB::table('user_event')
        ->where('event_id', $event->id)
        ->where('user_id', $userId)
        ->whereNull('deleted_at')
        ->update([
            'status' => 'canceled',
            'deleted_at' => now()
        ]);

    // Create notification if event has an owner and it's not the same user
    if ($event->user_id && $event->user_id != $userId) {
        $event->user->notifications()->create([
            'title' => 'Registration Canceled',
            'message' => $user->name . ' canceled registration for your event: ' . $event->title,
            'type' => 'event',
            'data' => ['event_id' => $event->id]
        ]);
    }

    return response()->json([
        'success' => true,
        'message' => 'Registration canceled successfully',
        'data' => [
            'user_id' => $userId,
            'event_id' => $event->id,
            'status' => 'canceled',
            'canceled_at' => now()->toDateTimeString()
        ]
    ]);
}

    /**
     * Get all registrations for an event
     */
    public function eventRegistrations(Event $event): JsonResponse
    {
        $registrations = $event->registeredUsers()
            ->withPivot('status', 'created_at')
            ->paginate();

        return response()->json([
            'success' => true,
            'data' => $registrations
        ]);
    }

    /**
     * Get all events a user is registered for
     */
    public function userRegistrations(User $user): JsonResponse
    {
        $events = $user->registeredEvents()
            ->withPivot('status', 'created_at')
            ->paginate();

        return response()->json([
            'success' => true,
            'data' => $events
        ]);
    }

    /**
     * Check registration status
     */
    public function checkRegistration(Event $event, User $user): JsonResponse
{
    $registration = DB::table('user_event')
        ->where('event_id', $event->id)
        ->where('user_id', $user->id)
        // Removed the deleted_at check
        ->first();

    return response()->json([
        'success' => true,
        'data' => [
            'is_registered' => !is_null($registration) && is_null($registration->deleted_at),
            'status' => $registration->status ?? null,
            'registered_at' => $registration->created_at ?? null,
            'is_canceled' => !is_null($registration?->deleted_at) // New field
        ]
    ]);
}
}