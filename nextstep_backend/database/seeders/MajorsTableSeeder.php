<?php

namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MajorsTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('majors')->insert([
            [
                'name' => 'Computer Science',
                'slug' => 'computer-science',
                'description' => 'Study of computation, algorithms, and systems.',
                'avg_salary' => 85000,
                'career_prospects' => 'Software Developer, Data Scientist',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
