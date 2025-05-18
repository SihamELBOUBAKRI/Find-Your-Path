<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\UserSavedItem;

class UserSavedItemSeeder extends Seeder
{
    public function run(): void
    {
        UserSavedItem::insert([
            [
                'user_id' => 1,
                'institution_id' => 1,
                'type' => 'institution',
            ],
            [
                'user_id' => 1,
                'event_id' => 1,
                'type' => 'event',
            ],
        ]);
    }
}
