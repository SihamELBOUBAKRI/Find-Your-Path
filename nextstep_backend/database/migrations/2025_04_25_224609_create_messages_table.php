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
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
           $table->foreignId('sender_id')->constrained('users')->onDelete('cascade'); // Missing
           $table->foreignId('receiver_id')->constrained('users')->onDelete('cascade'); // Missing
           $table->text('content'); // Missing - the actual message text
           $table->foreignId('contact_request_id')->nullable()->constrained();
           $table->boolean('is_initial_request')->default(false);
           $table->boolean('is_read')->default(false); // Missing read status
           $table->timestamps();
       });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
