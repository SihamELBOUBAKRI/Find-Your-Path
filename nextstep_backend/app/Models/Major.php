<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Major extends Model
{
    // app/Models/Major.php
protected $fillable = [
        'name',
        'slug',
        'description',
        'avg_salary',
        'career_prospects'
    ];
public function institutions()
{
    return $this->belongsToMany(Institution::class, 'institution_major')
               ->withPivot(['duration', 'requirements'])
               ->withTimestamps();
}
}
