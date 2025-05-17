<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\QuizAnswer;
use App\Models\QuizQuestion;
use Illuminate\Http\Request;
use App\Models\PersonalityType;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\QuestionPersonalityMapping;

class QuizAnswerController extends Controller
{
    /**
     * Display a listing of answers (admin only)
     */
    public function index(): JsonResponse
    {
        $answers = QuizAnswer::with(['user', 'question'])
            ->latest()
            ->paginate(10)
            ->groupBy('user_id');

        return response()->json([
            'success' => true,
            'data' => $answers
        ]);
    }

    /**
     * Submit quiz answers (for authenticated user)
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|exists:quiz_questions,id',
            'answers.*.weight' => 'required|integer|between:-3,3'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        $personalityScores = [];

        DB::transaction(function () use ($request, $user, &$personalityScores) {
            // Store answers
            foreach ($request->answers as $answer) {
                QuizAnswer::updateOrCreate(
                    ['user_id' => $user->id, 'question_id' => $answer['question_id']],
                    ['weight' => $answer['weight']]
                );

                // Calculate personality scores
                $mappings = QuestionPersonalityMapping::where('question_id', $answer['question_id'])->get();
                
                foreach ($mappings as $mapping) {
                    $contribution = $answer['weight'] * $mapping->direction * $mapping->weight_multiplier;
                    
                    if (!isset($personalityScores[$mapping->personality_type_id])) {
                        $personalityScores[$mapping->personality_type_id] = 0;
                    }
                    
                    $personalityScores[$mapping->personality_type_id] += $contribution;
                }
            }

            // Determine dominant personality
            if (!empty($personalityScores)) {
                arsort($personalityScores);
                $user->personality_type_id = array_key_first($personalityScores);
                $user->save();
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Quiz answers submitted successfully',
            'personality_type' => $user->fresh()->load('personalityType'),
            'score_breakdown' => $personalityScores
        ], 201);
    }

    /**
     * Get detailed personality analysis for user
     */
    public function personalityAnalysis(): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user->personality_type_id) {
            return response()->json([
                'success' => false,
                'message' => 'User has not completed the personality quiz'
            ], 404);
        }

        $analysis = [
            'type' => $user->personalityType,
            'compatible_types' => PersonalityType::where('id', '!=', $user->personality_type_id)
                ->orderByRaw('ABS(id - ?)', [$user->personality_type_id])
                ->limit(3)
                ->get(),
            'answer_distribution' => $user->quizAnswers()
                ->with('question')
                ->get()
                ->groupBy('question.category')
        ];

        return response()->json([
            'success' => true,
            'data' => $analysis
        ]);
    }

    /**
     * Display specific answer (admin only)
     */
    public function show(QuizAnswer $answer): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $answer->load(['user', 'question'])
        ]);
    }

    /**
     * Update an answer (admin only)
     */
    public function update(Request $request, QuizAnswer $answer): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'weight' => 'required|integer|between:-3,3',
            'question_id' => 'sometimes|exists:quiz_questions,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $answer->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Answer updated successfully',
            'data' => $answer
        ]);
    }

    /**
     * Delete an answer (admin only)
     */
    public function destroy(QuizAnswer $answer): JsonResponse
    {
        $answer->delete();

        return response()->json([
            'success' => true,
            'message' => 'Answer deleted successfully'
        ]);
    }


    /**
 * Get answers for a specific user (admin only)
 */
public function getUserAnswers($userId): JsonResponse
{
    // Optionally add validation to check if user exists
    if (!User::where('id', $userId)->exists()) {
        return response()->json([
            'success' => false,
            'message' => 'User not found'
        ], 404);
    }

    $answers = QuizAnswer::with('question')
        ->where('user_id', $userId)
        ->get()
        ->groupBy('question.category');

    $results = [];
    foreach ($answers as $category => $categoryAnswers) {
        $results[$category] = [
            'total_questions' => $categoryAnswers->count(),
            'answers' => $categoryAnswers
        ];
    }

    return response()->json([
        'success' => true,
        'data' => [
            'user_id' => $userId,
            'answers_by_category' => $results
        ]
    ]);
}
}