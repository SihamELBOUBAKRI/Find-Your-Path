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
            $table->string('name'); // e.g., "The Analyst", "The Diplomat"
            $table->string('slug')->unique(); // For URLs: "the-analyst"
            $table->text('description');
            $table->string('character_image')->nullable();
            $table->json('traits'); // ["Analytical", "Logical", "Detail-oriented"]
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