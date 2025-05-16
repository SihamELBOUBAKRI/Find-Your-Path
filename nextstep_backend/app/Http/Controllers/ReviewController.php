<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Institution;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ReviewController extends Controller
{
    /**
     * Display a listing of reviews (with optional filtering)
     */
    public function index(Request $request)
    {
        $query = Review::with(['user', 'institution'])
            ->when($request->institution_id, fn($q, $id) => $q->where('institution_id', $id))
            ->when($request->has('approved'), fn($q) => $q->where('is_approved', $request->boolean('approved')))
            ->when($request->user_id, fn($q, $id) => $q->where('user_id', $id));

        return response()->json([
            'success' => true,
            'data' => $query->paginate($request->per_page ?? 15)
        ]);
    }

    /**
     * Store a newly created review
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'institution_id' => ['required', 'exists:institutions,id'],
            'rating' => ['required', 'integer', 'between:1,5'],
            'comment' => ['required', 'string', 'max:2000'],
        ]);

        // Prevent duplicate reviews
        if (Review::where('user_id', Auth::id())
                 ->where('institution_id', $validated['institution_id'])
                 ->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'You have already reviewed this institution'
            ], 422);
        }

        $review = Review::create([
            ...$validated,
            'user_id' => Auth::id(),
            'is_approved' => false
        ]);

        return response()->json([
            'success' => true,
            'data' => $review->load('user'),
            'message' => 'Review submitted for approval'
        ], 201);
    }

    /**
     * Display the specified review
     */
    public function show(Review $review)
    {
        return response()->json([
            'success' => true,
            'data' => $review->load(['user', 'institution'])
        ]);
    }

    /**
     * Update the specified review
     */
    public function update(Request $request, Review $review)
    {
        // Basic users can only update their own unapproved reviews
        if (Auth::id() === $review->user_id) {
            if ($review->is_approved) {
                return response()->json([
                    'success' => false,
                    'message' => 'Approved reviews cannot be modified'
                ], 403);
            }

            $validated = $request->validate([
                'rating' => ['sometimes', 'integer', 'between:1,5'],
                'comment' => ['sometimes', 'string', 'max:2000']
            ]);
        } 
        // Admin updates (handled by middleware)
        else {
            $validated = $request->validate([
                'rating' => ['sometimes', 'integer', 'between:1,5'],
                'comment' => ['sometimes', 'string', 'max:2000'],
                'is_approved' => ['sometimes', 'boolean']
            ]);
        }

        $review->update($validated);

        return response()->json([
            'success' => true,
            'data' => $review->fresh(['user', 'institution']),
            'message' => 'Review updated successfully'
        ]);
    }

    public function approve(Request $request, Review $review)
{
    $validated = $request->validate([
        'is_approved' => ['required', 'boolean']
    ]);

    // Update and immediately refresh the model
    $review->is_approved = $validated['is_approved'];
    $review->save();
    $review->refresh(); // Force refresh from database

    return response()->json([
        'success' => true,
        'message' => $validated['is_approved'] ? 'Review approved' : 'Review unapproved',
        'data' => $review
    ]);
}
    /**
     * Remove the specified review
     */
    public function destroy(Review $review)
    {
        // Users can delete their own reviews (admins handled by middleware)
        if (Auth::id() !== $review->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only delete your own reviews'
            ], 403);
        }

        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Review deleted successfully'
        ]);
    }

    /**
     * Get average rating for an institution
     */
    public function averageRating(Institution $institution)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'average' => $institution->reviews()
                    ->where('is_approved', true)
                    ->avg('rating'),
                'count' => $institution->reviews()
                    ->where('is_approved', true)
                    ->count()
            ]
        ]);
    }
}