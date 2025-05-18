<?php

namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InstitutionsTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('institutions')->insert([
            [
                'name' => 'FutureTech University',
                'slug' => 'futuretech-university',
                'type' => 'university',
                'country' => 'USA',
                'city' => 'San Francisco',
                'address' => '123 Tech St',
                'latitude' => 37.7749,
                'longitude' => -122.4194,
                'website' => 'https://futuretech.edu',
                'description' => 'Top tech university.',
                'avg_tuition' => 15000.00,
                'scholarships' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}

