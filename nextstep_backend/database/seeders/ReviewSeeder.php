<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Review;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        Review::insert([
            [
                'user_id' => 1,
                'institution_id' => 1,
                'rating' => 5,
                'is_approved' => true,
                'comment' => 'Great university with strong academic programs.',
            ],
            [
                'user_id' => 2,
                'institution_id' => 1,
                'rating' => 4,
                'is_approved' => false,
                'comment' => 'Helpful faculty and good infrastructure.',
            ]
        ]);
    }
}

