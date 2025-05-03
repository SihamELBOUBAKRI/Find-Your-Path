<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class InstitutionController extends Controller
{
    /**
     * Display a listing of institutions.
     */
    public function index(): JsonResponse
    {
        $institutions = Institution::query()
            ->withCount(['majors', 'events', 'reviews'])
            ->filter(request()->only('search', 'type', 'country'))
            ->get(); // Add get() to execute the query
    
        return response()->json([
            'data' => $institutions
        ]);
    
    }

    /**
     * Store a newly created institution.
     */
    /**
 * Store a newly created institution.
 */
/**
 * Store a newly created institution.
 */
public function store(Request $request): JsonResponse
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'type' => 'required|in:university,academy,ecole_superieure,ofppt,cmc,other',
        'country' => 'required|string|max:255',
        'city' => 'required|string|max:255',
        'address' => 'required|string|max:500',
        'latitude' => 'nullable|numeric|between:-90,90',
        'longitude' => 'nullable|numeric|between:-180,180',
        'website' => 'required|url|max:255',
        'description' => 'required|string',
        'avg_tuition' => 'required|numeric|min:0',
        'scholarships' => 'boolean'
    ]);

    // Generate slug from name
    $validated['slug'] = Str::slug($validated['name']);
    
    $institution = Institution::create($validated);

    return response()->json([
        'message' => 'Institution created successfully',
        'data' => $institution
    ], 201);
}

    /**
     * Display the specified institution.
     */
    public function show(Institution $institution): JsonResponse
    {
        return response()->json([
            'data' => $institution->load([
                'majors',
                'events',
                'reviews'
            ])
        ]);
    }

   /**
 * Update the specified institution.
 */
public function update(Request $request, Institution $institution): JsonResponse
{
    $validated = $request->validate([
        'name' => 'sometimes|string|max:255',
        'type' => 'sometimes|in:university,academy,ecole_superieure,ofppt,cmc,other',
        'country' => 'sometimes|string|max:255',
        'city' => 'sometimes|string|max:255',
        'address' => 'sometimes|string|max:500',
        'latitude' => 'nullable|numeric|between:-90,90',
        'longitude' => 'nullable|numeric|between:-180,180',
        'website' => 'sometimes|url|max:255',
        'description' => 'sometimes|string',
        'avg_tuition' => 'sometimes|numeric|min:0',
        'scholarships' => 'sometimes|boolean'
    ]);

    // Update slug if name is being updated
    if (isset($validated['name'])) {
        $validated['slug'] = Str::slug($validated['name']);
    }

    $institution->update($validated);

    return response()->json([
        'message' => 'Institution updated successfully',
        'data' => $institution->fresh()
    ]);
}

    /**
     * Remove the specified institution.
     */
    public function destroy(Institution $institution): JsonResponse
    {
        $institution->delete();

        return response()->json([
            'message' => 'Institution deleted successfully'
        ]);
    }

    /**
     * Get institution's majors
     */
    public function majors(Institution $institution): JsonResponse
    {
        return response()->json([
            'data' => $institution->majors()
                ->withPivot(['duration', 'requirements'])->get()
        ]);
    }

    /**
     * Get institution's events
     */
    public function events(Institution $institution): JsonResponse
    {
        return response()->json([
            'data' => $institution->events()
                ->latest()->get()
        ]);
    }
}