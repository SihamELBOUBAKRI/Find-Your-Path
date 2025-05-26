<?php

namespace App\Http\Controllers;

use App\Models\Quote;
use Illuminate\Http\Request;

class QuoteController extends Controller
{
    /**
     * Display a listing of the quotes.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $quotes = Quote::all();
        return response()->json([
            'success' => true,
            'data' => $quotes
        ]);
    }

    /**
     * Store a newly created quote in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'quote' => 'required|string|max:255',
            'author' => 'nullable|string|max:100',
        ]);

        $quote = Quote::create($validated);

        return response()->json([
            'success' => true,
            'data' => $quote,
            'message' => 'Quote created successfully.'
        ], 201);
    }

    /**
     * Display the specified quote.
     *
     * @param  \App\Models\Quote  $quote
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Quote $quote)
    {
        return response()->json([
            'success' => true,
            'data' => $quote
        ]);
    }

    /**
     * Update the specified quote in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Quote  $quote
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Quote $quote)
    {
        $validated = $request->validate([
            'quote' => 'required|string|max:255',
            'author' => 'nullable|string|max:100',
        ]);

        $quote->update($validated);

        return response()->json([
            'success' => true,
            'data' => $quote,
            'message' => 'Quote updated successfully.'
        ]);
    }

    /**
     * Remove the specified quote from storage.
     *
     * @param  \App\Models\Quote  $quote
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Quote $quote)
    {
        $quote->delete();
        return response()->json([
            'success' => true,
            'message' => 'Quote deleted successfully.'
        ]);
    }


    public function random()
{
    $quote = Quote::inRandomOrder()->first();

    if (!$quote) {
        return response()->json([
            'success' => false,
            'message' => 'No quotes available'
        ], 404);
    }

    return response()->json([
        'success' => true,
        'data' => $quote,
        'message' => 'Random quote retrieved successfully'
    ]);
}
}