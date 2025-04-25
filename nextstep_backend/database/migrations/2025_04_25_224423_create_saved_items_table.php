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
        Schema::create('user_saved_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // For institutions
            $table->foreignId('institution_id')->nullable()->constrained()->onDelete('cascade');
            
            // For events
            $table->foreignId('event_id')->nullable()->constrained()->onDelete('cascade');
            
            $table->enum('type', ['institution', 'event'])->default('institution');
            $table->timestamps();
            
            // Ensure user can't save same item twice
            $table->unique(['user_id', 'institution_id', 'event_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saved_items');
    }
};
