<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\QuestionPersonalityMapping;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PersonalityType extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'character_image',
        'traits',
        'strengths',
        'weaknesses'
    ];

    protected $casts = [
        'traits' => 'array',
        'strengths' => 'array',
        'weaknesses' => 'array'
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
    public function questionMappings(): HasMany
{
    return $this->hasMany(QuestionPersonalityMapping::class);
}
}