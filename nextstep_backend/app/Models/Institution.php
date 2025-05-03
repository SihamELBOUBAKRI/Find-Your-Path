<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Institution extends Model
{
   // app/Models/Institution.php
   protected $fillable = [
    'name',
    'slug',
    'type',
    'country',
    'city',
    'address',
    'latitude',
    'longitude',
    'website',
    'description',
    'avg_tuition',
    'scholarships',
    // These are for your pivot tables/relationships:
    'duration',        // For institution_major pivot
    'requirements',    // For institution_major pivot
];

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

public function scopeFilter($query, array $filters)
{
    $query->when($filters['search'] ?? false, fn($query, $search) =>
        $query->where('name', 'like', '%'.$search.'%')
    );
    
    $query->when($filters['type'] ?? false, fn($query, $type) =>
        $query->where('type', $type)
    );
    
    $query->when($filters['country'] ?? false, fn($query, $country) =>
        $query->where('country', $country)
    );
}
}
