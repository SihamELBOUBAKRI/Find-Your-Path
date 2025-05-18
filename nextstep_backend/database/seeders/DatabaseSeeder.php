<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use Illuminate\Database\Seeder;
use Database\Seeders\EventsTableSeeder;
use Database\Seeders\UserEventTableSeeder;
use Database\Seeders\PostSeeder;
use Database\Seeders\QuoteSeeder;
use Database\Seeders\ReviewSeeder;
use Database\Seeders\UsersTableSeeder;
use Database\Seeders\QuizQuestionSeeder;
use Database\Seeders\SuccessStorySeeder;
use Database\Seeders\UserSavedItemSeeder;
use Database\Seeders\MajorsTableSeeder;
use Database\Seeders\InstitutionsTableSeeder;
use Database\Seeders\InstitutionMajorTableSeeder;
use Database\Seeders\PersonalityTypesTableSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UsersTableSeeder::class,
            PersonalityTypesTableSeeder::class,
            InstitutionsTableSeeder::class,
            MajorsTableSeeder::class,
            EventsTableSeeder::class,
            InstitutionMajorTableSeeder::class,
            UserEventTableSeeder::class,
            QuizQuestionSeeder::class,
            PostSeeder::class,
            QuoteSeeder::class,
            SuccessStorySeeder::class,
            ReviewSeeder::class,
            UserSavedItemSeeder::class,
        ]);

    }
}
