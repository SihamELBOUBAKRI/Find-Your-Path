<?php

namespace App\Services;

use App\Models\User;
use App\Models\Notification;

class NotificationService
{
    /**
     * Create and send a notification
     */
    public static function create(
        User $user,
        string $title,
        string $message,
        string $type = 'system',
        array $data = []
    ): Notification {
        $notification = $user->notifications()->create([
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'data' => $data,
            'is_read' => false
        ]);

        // Optional: Add real-time push here if needed
        return $notification;
    }
}