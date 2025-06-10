<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
       Schema::create('personality_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('anime_character_image')->nullable();
            $table->string('cartoon_character_image')->nullable();
            $table->string('famous_star_image')->nullable();
            $table->string('animal_image')->nullable();
            $table->json('traits');
            $table->json('strengths')->nullable();
            $table->json('weaknesses')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personality_types');
    }
};