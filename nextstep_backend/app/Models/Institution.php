<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Institution extends Model
{
   // app/Models/Institution.php

public function majors()
{
    return $this->belongsToMany(Major::class, 'institution_major')
               ->withPivot(['duration', 'requirements'])
               ->withTimestamps();
}

public function events()
{
    return $this->hasMany(Event::class);
}

public function savedByUsers()
{
    return $this->belongsToMany(User::class, 'user_saved_items')
               ->wherePivotNull('event_id')
               ->withTimestamps();
}

public function reviews()
{
    return $this->hasMany(Review::class);
}
}
