<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use App\Models\Major;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class InstitutionMajorController extends Controller
{
    /**
     * Associate a major with an institution
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'institution_id' => ['required', 'exists:institutions,id'],
            'major_id' => ['required', 'exists:majors,id'],
            'duration' => ['nullable', 'string', 'max:100'],
            'requirements' => ['nullable', 'string']
        ]);

        // Check if association already exists
        $exists = DB::table('institution_major')
            ->where('institution_id', $validated['institution_id'])
            ->where('major_id', $validated['major_id'])
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'This major is already associated with the institution'
            ], 422);
        }

        $institution = Institution::find($validated['institution_id']);
        $institution->majors()->attach($validated['major_id'], [
            'duration' => $validated['duration'],
            'requirements' => $validated['requirements']
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Major successfully associated with institution',
            'data' => $institution->load('majors')
        ], 201);
    }

    /**
     * Update association details
     */
    public function update(Request $request, Institution $institution, Major $major): JsonResponse
    {
        $validated = $request->validate([
            'duration' => ['sometimes', 'string', 'max:100'],
            'requirements' => ['sometimes', 'string']
        ]);

        if (!$institution->majors()->where('major_id', $major->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'This major is not associated with the institution'
            ], 404);
        }

        $institution->majors()->updateExistingPivot($major->id, $validated);

        return response()->json([
            'success' => true,
            'message' => 'Association updated successfully',
            'data' => [
                'institution_id' => $institution->id,
                'major_id' => $major->id,
                'duration' => $validated['duration'] ?? null,
                'requirements' => $validated['requirements'] ?? null
            ]
        ]);
    }

    /**
     * Remove association between institution and major
     */
    public function destroy(Institution $institution, Major $major): JsonResponse
    {
        if (!$institution->majors()->where('major_id', $major->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Association not found'
            ], 404);
        }

        $institution->majors()->detach($major->id);

        return response()->json([
            'success' => true,
            'message' => 'Association removed successfully'
        ]);
    }

    /**
     * Get all majors for an institution
     */
    public function institutionMajors(Institution $institution): JsonResponse
    {
        $majors = $institution->majors()
            ->withPivot(['duration', 'requirements'])
            ->paginate();

        return response()->json([
            'success' => true,
            'data' => $majors
        ]);
    }

    /**
     * Get all institutions offering a major
     */
    public function majorInstitutions(Major $major): JsonResponse
    {
        $institutions = $major->institutions()
            ->withPivot(['duration', 'requirements'])
            ->paginate();

        return response()->json([
            'success' => true,
            'data' => $institutions
        ]);
    }

    /**
     * Get specific association details
     */
    public function show(Institution $institution, Major $major): JsonResponse
    {
        $association = $institution->majors()
            ->where('major_id', $major->id)
            ->first();

        if (!$association) {
            return response()->json([
                'success' => false,
                'message' => 'Association not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'institution' => $institution->only(['id', 'name']),
                'major' => $major->only(['id', 'name']),
                'duration' => $association->pivot->duration,
                'requirements' => $association->pivot->requirements,
                'created_at' => $association->pivot->created_at,
                'updated_at' => $association->pivot->updated_at
            ]
        ]);
    }
}