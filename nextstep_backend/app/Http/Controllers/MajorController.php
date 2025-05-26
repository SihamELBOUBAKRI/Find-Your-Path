<?php

namespace App\Http\Controllers;

use App\Models\Major;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class MajorController extends Controller
{
    /**
     * Display a listing of majors.
     */
    public function index(Request $request)
    {
        try {
            $query = Major::query();
            
            // Search functionality
            if ($request->has('search')) {
                $query->where('name', 'like', '%'.$request->search.'%')
                      ->orWhere('description', 'like', '%'.$request->search.'%');
            }
            
            // Sorting
            $sortField = $request->get('sort_by', 'name');
            $sortDirection = $request->get('sort_dir', 'asc');
            
            $majors = $query->orderBy($sortField, $sortDirection)->get();
            
            return response()->json([
                'success' => true,
                'data' => $majors
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve majors',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created major.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:majors',
            'description' => 'required|string',
            'avg_salary' => 'nullable|numeric|min:0',
            'career_prospects' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $validator->validated();
            $data['slug'] = Str::slug($data['name']);
            
            $major = Major::create($data);
            
            return response()->json([
                'success' => true,
                'data' => $major,
                'message' => 'Major created successfully'
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create major',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified major.
     */
    public function show($id)
    {
        try {
            $major = Major::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $major
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Major not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified major.
     */
    public function update(Request $request, $id)
    {
        try {
            $major = Major::findOrFail($id);
            
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255|unique:majors,name,'.$major->id,
                'description' => 'sometimes|string',
                'avg_salary' => 'nullable|numeric|min:0',
                'career_prospects' => 'nullable|string'
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
                $data['slug'] = Str::slug($data['name']);
            }
            
            $major->update($data);
            
            return response()->json([
                'success' => true,
                'data' => $major,
                'message' => 'Major updated successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update major',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified major.
     */
    public function destroy($id)
    {
        try {
            $major = Major::findOrFail($id);
            
            // Check if major is associated with any institutions
            if ($major->institutions()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete major because it is associated with institutions'
                ], 422);
            }
            
            $major->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Major deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete major',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get institutions for a specific major
     */
    public function institutions($id)
    {
        try {
            $major = Major::with('institutions')->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $major->institutions
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve institutions for this major',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}