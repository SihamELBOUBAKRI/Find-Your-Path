<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class UsersTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('users')->insert([
            [
                'name' => 'lucas',
                'email' => 'lucas@gmail.com',
                'password' => Hash::make('12345678'),
                'message_preference' => 'open',
                'role' => 'student',
                'avatar' => null,
                'bio' => 'Aspiring data scientist.',
                'linkedin_url' => 'https://linkedin.com/in/alicejohnson',
                'phone' => '1234567890',
                'personality_type_id' => null,
                'recommended_major' => 'Data Science',
                'status' => 'active',
                'login_status' => 'offline',
                'email_verified_at' => Carbon::now(),
                'last_login_at' => Carbon::now()->subDays(1),
                'last_logout_at' => Carbon::now()->subDays(1)->addHours(2),
                'deactivated_at' => null,
                'banned_at' => null,
                'remember_token' => Str::random(10),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'hajar',
                'email' => 'hajar@gmail.com',
                'password' => Hash::make('12345678'),
                'message_preference' => 'approval_required',
                'role' => 'mentor',
                'avatar' => null,
                'bio' => 'Senior software engineer and mentor.',
                'linkedin_url' => 'https://linkedin.com/in/bsmith',
                'phone' => '0987654321',
                'personality_type_id' => null,
                'recommended_major' => 'Computer Science',
                'status' => 'active',
                'login_status' => 'offline',
                'email_verified_at' => Carbon::now(),
                'last_login_at' => Carbon::now()->subDays(2),
                'last_logout_at' => Carbon::now()->subDays(2)->addHours(3),
                'deactivated_at' => null,
                'banned_at' => null,
                'remember_token' => Str::random(10),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'siham',
                'email' => 'siham@gmail.com',
                'password' => Hash::make('12345678'),
                'message_preference' => 'approval_required',
                'role' => 'admin',
                'avatar' => null,
                'bio' => 'Platform administrator.',
                'linkedin_url' => null,
                'phone' => null,
                'personality_type_id' => null,
                'recommended_major' => null,
                'status' => 'active',
                'login_status' => 'offline',
                'email_verified_at' => Carbon::now(),
                'last_login_at' => Carbon::now()->subHours(5),
                'last_logout_at' => Carbon::now()->subHours(1),
                'deactivated_at' => null,
                'banned_at' => null,
                'remember_token' => Str::random(10),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
