<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SuccessStory extends Model
{
     protected $fillable = [
        'name',
        'story',
        'major', 
        'institution',
        'photo_url',
        'slug'
    ];
}
