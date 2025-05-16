<?php

namespace App\Http\Controllers;

use App\Models\SuccessStory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class SuccessStoryController extends Controller
{
    /**
     * Display a listing of success stories
     */
    public function index(Request $request)
    {
        try {
            $query = SuccessStory::query()
                ->when($request->has('search'), function($q) use ($request) {
                    $q->where('name', 'like', '%'.$request->search.'%')
                      ->orWhere('story', 'like', '%'.$request->search.'%')
                      ->orWhere('major', 'like', '%'.$request->search.'%')
                      ->orWhere('institution', 'like', '%'.$request->search.'%');
                })
                ->when($request->has('major'), function($q) use ($request) {
                    $q->where('major', $request->major);
                })
                ->when($request->has('institution'), function($q) use ($request) {
                    $q->where('institution', $request->institution);
                });

            // Sorting
            $sortField = $request->get('sort_by', 'created_at');
            $sortDirection = $request->get('sort_dir', 'desc');

            $stories = $query->orderBy($sortField, $sortDirection)
                           ->paginate($request->get('per_page', 10));

            return response()->json([
                'success' => true,
                'data' => $stories
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve success stories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created success story
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'story' => 'required|string',
            'major' => 'required|string|max:255',
            'institution' => 'required|string|max:255',
            'photo_url' => 'nullable|url'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $validator->validated();
            $data['slug'] = Str::slug($data['name'] . ' ' . Str::random(4)); // Ensure unique slug
            
            $story = SuccessStory::create($data);

            return response()->json([
                'success' => true,
                'data' => $story,
                'message' => 'Success story created successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create success story',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified success story
     */
    public function show($identifier)
{
    try {
        $story = SuccessStory::where('slug', $identifier)
                           ->orWhere('id', $identifier)
                           ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $story
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Success story not found',
            'error' => $e->getMessage()
        ], 404);
    }
}

    /**
     * Update the specified success story
     */
    public function update(Request $request, $id)
    {
        try {
            $story = SuccessStory::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'story' => 'sometimes|string',
                'major' => 'sometimes|string|max:255',
                'institution' => 'sometimes|string|max:255',
                'photo_url' => 'nullable|url'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();
            
            // Update slug only if name changed
            if ($request->has('name')) {
                $data['slug'] = Str::slug($data['name'] . ' ' . Str::random(4));
            }

            $story->update($data);

            return response()->json([
                'success' => true,
                'data' => $story,
                'message' => 'Success story updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update success story',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified success story
     */
    public function destroy($id)
    {
        try {
            $story = SuccessStory::findOrFail($id);
            $story->delete();

            return response()->json([
                'success' => true,
                'message' => 'Success story deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete success story',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get stories by major
     */
    public function byMajor($major)
    {
        try {
            $stories = SuccessStory::where('major', $major)
                                 ->orderBy('created_at', 'desc')
                                 ->get();

            return response()->json([
                'success' => true,
                'data' => $stories
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve stories by major',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get stories by institution
     */
    public function byInstitution($institution)
    {
        try {
            $stories = SuccessStory::where('institution', $institution)
                                 ->orderBy('created_at', 'desc')
                                 ->get();

            return response()->json([
                'success' => true,
                'data' => $stories
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve stories by institution',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}