<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactRequest extends Model
{
    protected $fillable = [
    'sender_id',
    'receiver_id',
    'initial_message',
    'status',
    'accepted_at',
];

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
