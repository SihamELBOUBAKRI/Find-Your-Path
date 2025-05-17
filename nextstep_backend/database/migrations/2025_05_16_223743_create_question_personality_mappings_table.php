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
        Schema::create('question_personality_mappings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('quiz_questions');
            $table->foreignId('personality_type_id')->constrained('personality_types');
            $table->integer('weight_multiplier')->default(1); // How much this question contributes
            $table->integer('direction'); // 1 = positive weight increases this type, -1 = negative
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('question_personality_mappings');
    }
};
