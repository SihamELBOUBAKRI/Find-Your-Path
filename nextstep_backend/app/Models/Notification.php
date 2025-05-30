<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
     protected $fillable = [
        'user_id',
        'title',
        'message',
        'type',
        'is_read',
        'priority',
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Helpful scopes
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }
}