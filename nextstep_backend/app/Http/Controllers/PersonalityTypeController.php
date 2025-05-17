<?php

namespace App\Http\Controllers;

use App\Models\PersonalityType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PersonalityTypeController extends Controller
{
    /**
     * Display all personality types
     */
    public function index(): JsonResponse
    {
        $types = PersonalityType::all();
        
        return response()->json([
            'success' => true,
            'data' => $types
        ]);
    }

    /**
     * Create a new personality type (Admin only)
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:personality_types',
            'description' => 'required|string',
            'character_image' => 'nullable|string',
            'traits' => 'required|array',
            'strengths' => 'nullable|array',
            'weaknesses' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $type = PersonalityType::create($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Personality type created successfully',
            'data' => $type
        ], 201);
    }

    /**
     * Display a specific personality type
     */
    public function show(PersonalityType $personalityType): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $personalityType
        ]);
    }

    /**
     * Update a personality type (Admin only)
     */
    public function update(Request $request, PersonalityType $personalityType): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:personality_types,slug,'.$personalityType->id,
            'description' => 'sometimes|string',
            'character_image' => 'nullable|string',
            'traits' => 'sometimes|array',
            'strengths' => 'nullable|array',
            'weaknesses' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $personalityType->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Personality type updated successfully',
            'data' => $personalityType
        ]);
    }

    /**
     * Delete a personality type (Admin only)
     */
    public function destroy(PersonalityType $personalityType): JsonResponse
    {
        $personalityType->delete();

        return response()->json([
            'success' => true,
            'message' => 'Personality type deleted successfully'
        ]);
    }
}