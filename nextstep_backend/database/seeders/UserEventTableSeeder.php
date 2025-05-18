<?php

namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserEventTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('user_event')->insert([
            [
                'user_id' => 1,
                'event_id' => 1,
                'status' => 'registered',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
