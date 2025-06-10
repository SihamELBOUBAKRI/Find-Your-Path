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
                'description' => 'Analysts are logical, strategic thinkers who excel at solving complex problems. They value knowledge, competence, and independence.',
                'anime_character_image' => 'https://example.com/images/analyst-anime.jpg',
                'cartoon_character_image' => 'https://example.com/images/analyst-cartoon.jpg',
                'famous_star_image' => 'https://example.com/images/analyst-famous.jpg',
                'animal_image' => 'https://example.com/images/analyst-animal.jpg',
                'traits' => json_encode(['Analytical', 'Logical', 'Detail-oriented', 'Strategic', 'Innovative']),
                'strengths' => json_encode(['Critical thinking', 'Problem-solving', 'Technical skills', 'Objectivity']),
                'weaknesses' => json_encode(['Overthinking', 'Perfectionism', 'Social awkwardness', 'Insensitivity']),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'The Diplomat',
                'slug' => 'the-diplomat',
                'description' => 'Diplomats are empathetic, cooperative individuals who seek harmony and meaningful connections with others.',
                'anime_character_image' => 'https://example.com/images/diplomat-anime.jpg',
                'cartoon_character_image' => 'https://example.com/images/diplomat-cartoon.jpg',
                'famous_star_image' => 'https://example.com/images/diplomat-famous.jpg',
                'animal_image' => 'https://example.com/images/diplomat-animal.jpg',
                'traits' => json_encode(['Empathetic', 'Idealistic', 'Persuasive', 'Harmonious', 'Creative']),
                'strengths' => json_encode(['Communication', 'Conflict resolution', 'Teamwork', 'Emotional intelligence']),
                'weaknesses' => json_encode(['People-pleasing', 'Indecisiveness', 'Over-sensitivity', 'Avoiding conflict']),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'The Sentinel',
                'slug' => 'the-sentinel',
                'description' => 'Sentinels are practical, organized individuals who value stability, security, and tradition.',
                'anime_character_image' => 'https://example.com/images/sentinel-anime.jpg',
                'cartoon_character_image' => 'https://example.com/images/sentinel-cartoon.jpg',
                'famous_star_image' => 'https://example.com/images/sentinel-famous.jpg',
                'animal_image' => 'https://example.com/images/sentinel-animal.jpg',
                'traits' => json_encode(['Reliable', 'Organized', 'Practical', 'Loyal', 'Hard-working']),
                'strengths' => json_encode(['Dependability', 'Time management', 'Attention to detail', 'Responsibility']),
                'weaknesses' => json_encode(['Resistance to change', 'Rigidity', 'Over-cautiousness', 'Difficulty with abstract ideas']),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'The Explorer',
                'slug' => 'the-explorer',
                'description' => 'Explorers are spontaneous, adaptable individuals who thrive on action, variety, and hands-on experience.',
                'anime_character_image' => 'https://example.com/images/explorer-anime.jpg',
                'cartoon_character_image' => 'https://example.com/images/explorer-cartoon.jpg',
                'famous_star_image' => 'https://example.com/images/explorer-famous.jpg',
                'animal_image' => 'https://example.com/images/explorer-animal.jpg',
                'traits' => json_encode(['Adventurous', 'Energetic', 'Spontaneous', 'Observant', 'Hands-on']),
                'strengths' => json_encode(['Adaptability', 'Practical skills', 'Risk-taking', 'Crisis management']),
                'weaknesses' => json_encode(['Impulsiveness', 'Disorganization', 'Impatience', 'Difficulty with routine']),
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}