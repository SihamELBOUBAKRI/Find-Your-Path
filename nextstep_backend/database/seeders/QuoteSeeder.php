<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Quote;

class QuoteSeeder extends Seeder
{
    public function run(): void
    {
        Quote::insert([
            ['quote' => 'Education is the passport to the future.', 'author' => 'Malcolm X'],
            ['quote' => 'The roots of education are bitter, but the fruit is sweet.', 'author' => 'Aristotle'],
        ]);
    }
}

