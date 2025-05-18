<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\User;
use App\Models\Message;
use Illuminate\Http\Request;
use App\Models\ContactRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Services\NotificationService;

class MessageController extends Controller
{
  /**
 * Get messages between authenticated user and specified user
 */
/**
 * Get messages between authenticated user and specified user
 */
public function index(Request $request, $userId): JsonResponse
{
    try {
        // Validate the user exists
        $otherUser = User::findOrFail($userId);

        // Get messages between authenticated user and specified user
        $messages = Message::where(function($query) use ($userId) {
                $query->where('sender_id', Auth::id())
                      ->where('receiver_id', $userId);
            })
            ->orWhere(function($query) use ($userId) {
                $query->where('sender_id', $userId)
                      ->where('receiver_id', Auth::id());
            })
            ->when($request->contact_request_id, function($query, $contactRequestId) {
                $query->where('contact_request_id', $contactRequestId);
            })
            ->with(['sender', 'receiver'])
            ->orderBy('created_at', 'asc')->paginate(20);

        // Transform messages
        $transformedMessages = $messages->getCollection()->map(function ($message) {
            if ($message->is_resend) {
                return [
                    'id' => $message->id,
                    'is_resend' => true,
                    'notice' => 'Message was resent',
                    'original_message_id' => $message->original_message_id,
                    'resent_at' => $message->created_at,
                    'sender' => $message->sender,
                    'receiver' => $message->receiver
                ];
            }
            return $message;
        });

        $messages->setCollection($transformedMessages);

        return response()->json([
            'success' => true,
            'data' => $messages,
            'meta' => [
                'current_user_id' => Auth::id(),
                'other_user_id' => $otherUser->id,
                'other_user_name' => $otherUser->name
            ]
        ]);

    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json([
            'success' => false,
            'message' => 'User not found'
        ], 404);
    } catch (Exception $e) {
        Log::error('MessageController index error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Server error'
        ], 500);
    }
}

    /**
     * Send a new message
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'content' => 'required|string|max:2000',
            'contact_request_id' => 'nullable|exists:contact_requests,id',
            'is_initial_request' => 'sometimes|boolean'
        ]);

        // Check if receiver has blocked the sender
        if (Auth::user()->blockedUsers()->where('blocked_user_id', $validated['receiver_id'])->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot message this user'
            ], 403);
        }

        $message = Message::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $validated['receiver_id'],
            'content' => $validated['content'],
            'contact_request_id' => $validated['contact_request_id'] ?? null,
            'is_initial_request' => $validated['is_initial_request'] ?? false
        ]);
        NotificationService::create(
                $message->receiver,
                'New Message',
                'You have a new message from '.auth()->user()->name,
                'message',
                ['message_id' => $message->id]
            );

        return response()->json([
            'success' => true,
            'message' => 'Message sent successfully',
            'data' => $message->load('receiver')
        ], 201);
    }

    /**
     * Mark messages as read
     */
    public function markAsRead(Request $request): JsonResponse
    {
        $request->validate([
            'message_ids' => 'required|array',
            'message_ids.*' => 'exists:messages,id'
        ]);

        Message::whereIn('id', $request->message_ids)
            ->where('receiver_id', Auth::id())
            ->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Messages marked as read'
        ]);
    }

    /**
 * Resend a message (only if not read yet)
 */
public function resend(Request $request, Message $message): JsonResponse
{
    // Verify the message belongs to the authenticated user
    if ($message->sender_id !== Auth::id()) {
        return response()->json([
            'success' => false,
            'message' => 'You can only resend your own messages'
        ], 403);
    }

    // Check if message was already read
    if ($message->is_read) {
        return response()->json([
            'success' => false,
            'message' => 'Cannot resend already read messages'
        ], 400);
    }

    // Create a new message with resend indicator
    $resendMessage = Message::create([
        'sender_id' => Auth::id(),
        'receiver_id' => $message->receiver_id,
        'content' => $message->content,
        'contact_request_id' => $message->contact_request_id,
        'is_resend' => true,
        'original_message_id' => $message->id
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Message resent successfully',
        'data' => $resendMessage->load('receiver')
    ], 201);
}
}