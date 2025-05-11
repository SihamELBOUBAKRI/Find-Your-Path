<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    // app/Models/Event.php
  protected $fillable = [
        'title',
        'description',
        'institution_id',
        'latitude',
        'longitude',
        'address',
        'start_date',
        'end_date',
        'website',
        'is_free',
        'image_url'
    ];
public function institution()
{
    return $this->belongsTo(Institution::class);
}

public function registeredUsers()
{
    return $this->belongsToMany(User::class, 'user_event')
               ->withPivot('status')
               ->withTimestamps();
}

public function savedByUsers()
{
    return $this->belongsToMany(User::class, 'user_saved_items')
               ->wherePivotNull('institution_id')
               ->withTimestamps();
}
}
