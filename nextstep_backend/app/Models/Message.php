<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
    'sender_id',
    'receiver_id',
    'content',
    'contact_request_id',
    'is_initial_request',
    'is_read',
    'is_resend' 
];

    // app/Models/Message.php

public function sender()
{
    return $this->belongsTo(User::class, 'sender_id');
}

public function receiver()
{
    return $this->belongsTo(User::class, 'receiver_id');
}

public function contactRequest()
{
    return $this->belongsTo(ContactRequest::class);
}
}
