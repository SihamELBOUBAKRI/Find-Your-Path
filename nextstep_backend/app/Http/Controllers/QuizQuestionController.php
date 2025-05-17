<?php

namespace App\Http\Controllers;

use App\Models\QuizQuestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class QuizQuestionController extends Controller
{
    /**
     * Get all quiz questions (with optional category filter)
     */
    public function index(Request $request): JsonResponse
    {
        $validCategories = ['personality', 'interests', 'skills'];
        $category = $request->query('category');

        $query = QuizQuestion::query();
        
        if ($category) {
            if (!in_array($category, $validCategories)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid category'
                ], 422);
            }
            $query->where('category', $category);
        }

        $questions = $query->orderBy('weight', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $questions
        ]);
    }

    /**
     * Create a new quiz question
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'question' => 'required|string|max:500',
            'category' => 'required|in:personality,interests,skills',
            'weight' => 'sometimes|integer|min:1|max:5'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $question = QuizQuestion::create([
            'question' => $request->question,
            'category' => $request->category,
            'weight' => $request->weight ?? 1
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Question created successfully',
            'data' => $question
        ], 201);
    }

    /**
     * Get a specific question
     */
    public function show(QuizQuestion $question): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $question
        ]);
    }

    /**
     * Update a question
     */
    public function update(Request $request, QuizQuestion $question): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'question' => 'sometimes|string|max:500',
            'category' => 'sometimes|in:personality,interests,skills',
            'weight' => 'sometimes|integer|min:1|max:5'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $question->update($request->only(['question', 'category', 'weight']));

        return response()->json([
            'success' => true,
            'message' => 'Question updated successfully',
            'data' => $question
        ]);
    }

    /**
     * Delete a question
     */
    public function destroy(QuizQuestion $question): JsonResponse
    {
        $question->delete();

        return response()->json([
            'success' => true,
            'message' => 'Question deleted successfully'
        ]);
    }
    
    public function addPersonalityMapping(Request $request, QuizQuestion $question): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'personality_type_id' => 'required|exists:personality_types,id',
            'weight_multiplier' => 'required|integer|min:1',
            'direction' => 'required|in:-1,1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $mapping = $question->personalityMappings()->create($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Personality mapping added successfully',
            'data' => $mapping
        ], 201);
    }

    /**
     * Get all personality mappings for a question
     */
    public function getPersonalityMappings(QuizQuestion $question): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $question->load('personalityMappings.personalityType')
        ]);
    }

    
}