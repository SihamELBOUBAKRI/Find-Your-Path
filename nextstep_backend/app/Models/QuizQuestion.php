<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\QuestionPersonalityMapping;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuizQuestion extends Model
{
    protected $fillable=[
        'question',
        'category',
        'weight'
    ];

    public function personalityMappings(): HasMany
    {
        return $this->hasMany(QuestionPersonalityMapping::class ,'question_id');
    }
    public function answers()
    {
        return $this->hasMany(QuizAnswer::class);
    }
}
