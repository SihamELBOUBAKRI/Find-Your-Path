<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSavedItem extends Model
{
    protected $table = 'user_saved_items';

    protected $fillable = [
        'user_id',
        'institution_id',
        'event_id',
        'type'
    ];

public function user()
{
    return $this->belongsTo(User::class);
}

public function institution()
{
    return $this->belongsTo(Institution::class);
}

public function event()
{
    return $this->belongsTo(Event::class);
}

public function scopeInstitutions($query)
{
    return $query->whereNotNull('institution_id');
}

public function scopeEvents($query)
{
    return $query->whereNotNull('event_id');
}
}
