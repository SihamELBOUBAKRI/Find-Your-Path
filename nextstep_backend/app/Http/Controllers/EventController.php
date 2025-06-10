<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Institution;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class EventController extends Controller
{
    /**
     * Display a listing of events with filters
     */
    public function index(Request $request)
{
    $query = Event::with(['institution', 'registeredUsers'])
                ->when($request->upcoming && $request->upcoming === 'true', function($q) {
                    $q->where('start_date', '>=', now());
                })
                ->when($request->free && $request->free === 'true', function($q) {
                    $q->where('is_free', true);
                })
                ->when($request->institution_id, function($q, $institutionId) {
                    $q->where('institution_id', $institutionId);
                })
                ->when($request->search, function($q, $search) {
                    $q->where('title', 'like', "%{$search}%");
                })
                ->orderBy($request->sort_by ?? 'start_date', $request->sort_dir ?? 'asc');

    return response()->json([
        'success' => true,
        'data' => $query->paginate($request->per_page ?? 15)
    ]);
}

    /**
     * Store a newly created event
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'institution_id' => 'nullable|exists:institutions,id',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'address' => 'required|string',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'website' => 'nullable|url',
            'is_free' => 'boolean',
            'image_url' => 'nullable|url'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $event = Event::create($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $event,
                'message' => 'Event created successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create event',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified event
     */
    public function show($id)
    {
        try {
            $event = Event::with(['institution', 'registeredUsers'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $event
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Event not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified event
     */
    public function update(Request $request, $id)
    {
        try {
            $event = Event::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|string|max:255',
                'description' => 'sometimes|string',
                'institution_id' => 'nullable|exists:institutions,id',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
                'address' => 'sometimes|string',
                'start_date' => [
                    'sometimes',
                    'date',
                    Rule::when($request->has('start_date'), ['after_or_equal:today'])
                ],
                'end_date' => 'sometimes|date|after:start_date',
                'website' => 'nullable|url',
                'is_free' => 'sometimes|boolean',
                'image_url' => 'nullable|url'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $event->update($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $event,
                'message' => 'Event updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update event',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified event
     */
    public function destroy($id)
    {
        try {
            $event = Event::findOrFail($id);
            $event->delete();

            return response()->json([
                'success' => true,
                'message' => 'Event deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete event',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}