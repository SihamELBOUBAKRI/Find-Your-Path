<?php

namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InstitutionMajorTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('institution_major')->insert([
            [
                'institution_id' => 1,
                'major_id' => 1,
                'duration' => '4 years',
                'requirements' => 'High school diploma and SAT.',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
