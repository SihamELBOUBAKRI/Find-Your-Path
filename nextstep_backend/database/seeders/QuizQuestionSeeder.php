<?php

namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\QuizQuestion;

class QuizQuestionSeeder extends Seeder
{
    public function run(): void
    {
        QuizQuestion::insert([
            ['question' => 'Do you enjoy solving logical problems?', 'category' => 'skills', 'weight' => 2],
            ['question' => 'Do you prefer working alone or in teams?', 'category' => 'personality', 'weight' => 3],
            ['question' => 'Are you passionate about art or music?', 'category' => 'interests', 'weight' => 1],
        ]);
    }
}

