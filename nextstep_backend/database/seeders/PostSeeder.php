<?php

namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\Post;

class PostSeeder extends Seeder
{
    public function run(): void
    {
        Post::insert([
            [
                'user_id' => 1,
                'content' => 'I just got accepted into a great university!',
                'slug' => 'accepted-into-university',
                'likes' => 23,
                'tags' => json_encode(['success', 'university']),
                'is_approved' => true,
            ],
            [
                'user_id' => 2,
                'content' => 'Studying abroad has been life-changing.',
                'slug' => 'study-abroad-experience',
                'likes' => 15,
                'tags' => json_encode(['travel', 'education']),
                'is_approved' => false,
            ]
        ]);
    }
}

