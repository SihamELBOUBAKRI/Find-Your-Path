<?php

namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EventsTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('events')->insert([
            [
                'title' => 'AI Career Fair',
                'description' => 'Meet top recruiters in AI.',
                'institution_id' => 1,
                'latitude' => 37.7749,
                'longitude' => -122.4194,
                'address' => '123 Tech St',
                'start_date' => now()->addDays(10),
                'end_date' => now()->addDays(11),
                'website' => 'https://futuretech.edu/events/ai-career-fair',
                'is_free' => true,
                'image_url' => null,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}

