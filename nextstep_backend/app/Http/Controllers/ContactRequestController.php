<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ContactRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Services\NotificationService;

class ContactRequestController extends Controller
{
    /**
     * Get ALL contact requests (Admin only)
     */
    public function index(Request $request): JsonResponse
    {
        $requests = ContactRequest::with(['sender', 'receiver', 'messages'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $requests
        ]);
    }

    /**
     * Get authenticated user's contact requests with filters
     */
    public function myRequests(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'nullable|in:sent,received',
            'status' => 'nullable|in:pending,accepted,rejected',
            'search' => 'nullable|string|max:255'
        ]);

        $query = ContactRequest::with(['sender', 'receiver', 'messages'])
            ->where(function($q) {
                $q->where('sender_id', Auth::id())
                  ->orWhere('receiver_id', Auth::id());
            });

        // Filter by request type (sent/received)
        if ($request->has('type')) {
            if ($request->type === 'sent') {
                $query->where('sender_id', Auth::id());
            } else {
                $query->where('receiver_id', Auth::id());
            }
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search in initial message
        if ($request->has('search')) {
            $query->where('initial_message', 'like', '%'.$request->search.'%');
        }

        $requests = $query->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'filters' => $validated,
            'data' => $requests
        ]);
    }
    /**
 * Display a specific contact request
 */
public function show(ContactRequest $contactRequest): JsonResponse
{
    // Allow admin to view any request
    if (Auth::user()->role !== 'admin') {
        // For non-admin users, verify they are either sender or receiver
        if (Auth::id() !== $contactRequest->sender_id && Auth::id() !== $contactRequest->receiver_id) {
            abort(403, 'Unauthorized - You can only view your own contact requests');
        }
    }

    return response()->json([
        'success' => true,
        'data' => $contactRequest->load(['sender', 'receiver', 'messages'])
    ]);
}

    /**
     * Send a contact request
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'initial_message' => 'required|string|max:2000'
        ]);

        // Check if already connected
        if (ContactRequest::where('sender_id', Auth::id())
            ->where('receiver_id', $validated['receiver_id'])
            ->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Contact request already sent'
            ], 400);
        }

        // Check if blocked
        if (Auth::user()->blockedUsers()->where('blocked_user_id', $validated['receiver_id'])->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot contact this user'
            ], 403);
        }

        $contactRequest = ContactRequest::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $validated['receiver_id'],
            'initial_message' => $validated['initial_message'],
            'status' => 'pending'
        ]);
        NotificationService::create(
            $contactRequest->receiver,
            'Contact Request',
            auth()->user()->name.' wants to connect',
            'contact',
            ['request_id' => $contactRequest->id]
        );

        // Create initial message
        $contactRequest->messages()->create([
            'sender_id' => Auth::id(),
            'receiver_id' => $validated['receiver_id'],
            'content' => $validated['initial_message'],
            'is_initial_request' => true,
            'contact_request_id' => $contactRequest->id
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Contact request sent successfully',
            'data' => $contactRequest->load('receiver')
        ], 201);
    }

    /**
     * Respond to contact request
     */
    public function respond(Request $request, ContactRequest $contactRequest): JsonResponse
    {
        if ($contactRequest->receiver_id !== Auth::id()) {
            abort(403, 'Unauthorized action');
        }

        $validated = $request->validate([
            'status' => 'required|in:accepted,rejected',
            'message' => 'nullable|string|max:2000'
        ]);

        $contactRequest->update([
            'status' => $validated['status'],
            'accepted_at' => $validated['status'] === 'accepted' ? now() : null
        ]);
        // Send notification to the sender
        $notificationType = $validated['status'] === 'accepted' ? 'Contact Request Accepted' : 'Contact Request Rejected';
        $notificationMessage = $validated['status'] === 'accepted' 
            ? auth()->user()->name . ' accepted your contact request'
            : auth()->user()->name . ' declined your contact request';

        NotificationService::create(
            $contactRequest->sender,
            $notificationType,
            $notificationMessage,
            'contact',
            ['request_id' => $contactRequest->id]
        );

        if ($validated['message']) {
            $contactRequest->messages()->create([
                'sender_id' => Auth::id(),
                'receiver_id' => $contactRequest->sender_id,
                'content' => $validated['message'],
                'contact_request_id' => $contactRequest->id
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Contact request updated',
            'data' => $contactRequest->fresh(['sender', 'receiver'])
        ]);
    }
}