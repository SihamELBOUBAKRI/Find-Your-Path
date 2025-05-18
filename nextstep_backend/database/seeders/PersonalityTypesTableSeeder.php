<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PersonalityTypesTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('personality_types')->insert([
            [
                'name' => 'The Analyst',
                'slug' => 'the-analyst',
                'description' => 'Logical and strategic thinkers.',
                'character_image' => null,
                'traits' => json_encode(['Analytical', 'Logical', 'Detail-oriented']),
                'strengths' => json_encode(['Critical thinking', 'Problem-solving']),
                'weaknesses' => json_encode(['Overthinking', 'Perfectionism']),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'The Diplomat',
                'slug' => 'the-diplomat',
                'description' => 'Empathetic and cooperative.',
                'character_image' => null,
                'traits' => json_encode(['Empathetic', 'Idealistic', 'Persuasive']),
                'strengths' => json_encode(['Communication', 'Conflict resolution']),
                'weaknesses' => json_encode(['People-pleasing', 'Indecisiveness']),
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}

