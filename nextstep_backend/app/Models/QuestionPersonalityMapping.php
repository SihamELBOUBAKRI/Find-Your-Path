<?php

namespace App\Models;

use App\Models\QuizQuestion;
use App\Models\PersonalityType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionPersonalityMapping extends Model
{
    protected $fillable = [
        'question_id',
        'personality_type_id',
        'weight_multiplier',
        'direction'
    ];

    public function question(): BelongsTo
    {
        return $this->belongsTo(QuizQuestion::class,'question_id');
    }

    public function personalityType(): BelongsTo
    {
        return $this->belongsTo(PersonalityType::class);
    }
}