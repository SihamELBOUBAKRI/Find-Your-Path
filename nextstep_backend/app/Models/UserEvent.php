<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// app/Models/UserEvent.php

class UserEvent extends Model
{
    protected $table = 'user_event';

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    // Scopes for status
    public function scopeRegistered($query)
    {
        return $query->where('status', 'registered');
    }
}
