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
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->text('content');
            $table->string('slug')->unique(); // After the 'content' field
            $table->unsignedInteger('likes')->default(0);
            $table->softDeletes(); // Add to users, institutions, posts, etc.
            $table->boolean('is_approved')->default(false);
            $table->json('tags')->nullable();
            $table->timestamps();
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
