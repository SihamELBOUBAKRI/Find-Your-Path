<?php

namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\SuccessStory;

class SuccessStorySeeder extends Seeder
{
    public function run(): void
    {
        SuccessStory::insert([
            [
                'name' => 'Ahmed, Software Engineer at Google',
                'story' => 'Ahmed studied Computer Science at EMI and worked hard to land a job at Google.',
                'major' => 'Computer Science',
                'institution' => 'EMI',
                'slug' => 'ahmed-google',
                'photo_url' => 'https://example.com/ahmed.jpg',
            ],
            [
                'name' => 'Sara, Data Analyst at Amazon',
                'story' => 'Sara followed her passion in data and found success.',
                'major' => 'Data Science',
                'institution' => 'ENSA',
                'slug' => 'sara-amazon',
                'photo_url' => null, 
            ]
        ]);
    }
}

