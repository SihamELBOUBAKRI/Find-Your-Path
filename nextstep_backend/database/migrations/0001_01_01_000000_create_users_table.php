<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            // Core fields
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->enum('message_preference', ['open', 'approval_required'])->default('approval_required');
            // Role management
            $table->enum('role', ['student', 'mentor', 'admin'])->default('student');
            
            // Profile fields
            $table->string('avatar')->nullable();
            $table->text('bio')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('phone', 20)->nullable();
            
            // Career guidance fields
            $table->string('personality_type', 10)->nullable(); // e.g., "INTJ"
            $table->string('recommended_major', 100)->nullable();
            
            // Status and timestamps
            $table->enum('status', ['active', 'inactive', 'banned'])->default('active');
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
	    $table->softDeletes(); // Add to users, institutions, posts, etc.
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
};