<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Get user notifications
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = Auth::user()->notifications()
            ->when($request->query('unread'), function($query) {
                $query->unread();
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $notifications
        ]);
    }

    /**
     * Mark notifications as read
     */
    public function markAsRead(Request $request): JsonResponse
    {
        $request->validate([
            'notification_ids' => 'required|array',
            'notification_ids.*' => 'exists:notifications,id'
        ]);

        Auth::user()->notifications()
            ->whereIn('id', $request->notification_ids)
            ->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Notifications marked as read'
        ]);
    }

    /**
     * Delete notifications
     */
    public function destroy(Request $request): JsonResponse
    {
        $request->validate([
            'notification_ids' => 'required|array',
            'notification_ids.*' => 'exists:notifications,id'
        ]);

        Auth::user()->notifications()
            ->whereIn('id', $request->notification_ids)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notifications deleted'
        ]);
    }
}