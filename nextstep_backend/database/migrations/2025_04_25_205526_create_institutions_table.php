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
            Schema::create('institutions', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique(); // After the 'name' field
                $table->enum('type', ['university', 'academy', 'ecole_superieure', 'ofppt', 'cmc', 'other']);
                $table->string('country');
                $table->string('city');
                $table->text('address');
                $table->decimal('latitude', 10, 8)->nullable();
                $table->decimal('longitude', 11, 8)->nullable();
                $table->string('website');
                $table->text('description');
                $table->decimal('avg_tuition', 10, 2);
                $table->boolean('scholarships')->default(false);
                $table->timestamps();
            $table->softDeletes(); // Add to users, institutions, posts, etc.
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('institutions');
    }
};
