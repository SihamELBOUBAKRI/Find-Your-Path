<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlockedUser extends Model
{
    public function blocker()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function blocked()
    {
        return $this->belongsTo(User::class, 'blocked_user_id');
    }
}