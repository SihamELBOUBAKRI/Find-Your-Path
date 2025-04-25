<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactRequest extends Model
{
    // app/Models/ContactRequest.php

public function sender()
{
    return $this->belongsTo(User::class, 'sender_id');
}

public function receiver()
{
    return $this->belongsTo(User::class, 'receiver_id');
}

public function messages()
{
    return $this->hasMany(Message::class);
}
}
