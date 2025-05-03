<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('success_stories', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // E.g., "Ahmed, Software Engineer at Google"
            $table->text('story'); // Career journey details
            $table->string('major'); // E.g., "Computer Science"
            $table->string('institution'); // E.g., "EMI"
            $table->string('photo_url')->nullable(); // Optional profile image
            $table->string('slug')->unique();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('success_stories');
    }
};
