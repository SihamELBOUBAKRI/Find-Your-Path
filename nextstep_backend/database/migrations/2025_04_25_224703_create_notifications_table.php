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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title'); // E.g., "New Event Alert"
            $table->text('message');
            $table->enum('type', ['event', 'message', 'reminder', 'system']);
            $table->boolean('is_read')->default(false);
            $table->enum('priority', ['low', 'medium', 'high'])->default('low');
            $table->index(['user_id', 'is_read']);
            $table->timestamps();
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
