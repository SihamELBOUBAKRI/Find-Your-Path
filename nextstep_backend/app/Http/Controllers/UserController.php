<?php
//DONE HERE
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
   public function index(): JsonResponse
{
    $users = User::with(['personalityType'])
        ->when(request()->has('role'), function($query) {
            $query->where('role', request('role'));
        })
        ->when(request()->has('limit'), function($query) {
            $query->take(request('limit'));
        })
        ->get();
    
    return response()->json(['data' => $users]);
}

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
        'password' => 'required|string|min:8|confirmed',
        'role' => ['required', Rule::in(['student', 'mentor', 'admin'])],
        'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Changed to accept image files
        'bio' => 'nullable|string|max:500',
        'linkedin_url' => 'nullable|url|max:255',
        'phone' => 'nullable|string|max:20',
        'personality_type' => 'nullable|string|max:10',
        'recommended_major' => 'nullable|string|max:100',
        'status' => ['nullable', Rule::in(['active', 'inactive', 'banned'])],
        'message_preference' => ['nullable', Rule::in(['open', 'approval_required'])]
    ]);

    // Handle file upload
    if ($request->hasFile('avatar')) {
        $path = $request->file('avatar')->store('public/avatars');
        $validated['avatar'] = str_replace('public/', 'storage/', $path);
    }

    $validated['password'] = Hash::make($validated['password']);

    $user = User::create($validated);

    return response()->json([
        'message' => 'User created successfully',
        'data' => $user
    ], 201);
}

public function update(Request $request, User $user): JsonResponse
{
    $validated = $request->validate([
        'name' => 'sometimes|string|max:255',
        'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
        'role' => ['sometimes', Rule::in(['student', 'mentor', 'admin'])],
        'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Changed to accept image files
        'bio' => 'nullable|string|max:500',
        'linkedin_url' => 'nullable|url|max:255',
        'phone' => 'nullable|string|max:20',
        'personality_type_id' => 'nullable|exists:personality_types,id',
        'recommended_major' => 'nullable|string|max:100',
        'status' => ['nullable', Rule::in(['active', 'inactive', 'banned'])],
        'message_preference' => ['nullable', Rule::in(['open', 'approval_required'])]
    ]);

    // Handle file upload
    if ($request->hasFile('avatar')) {
        // Delete old avatar if exists
        if ($user->avatar) {
            Storage::delete(str_replace('storage/', 'public/', $user->avatar));
        }
        
        $path = $request->file('avatar')->store('public/avatars');
        $validated['avatar'] = str_replace('public/', 'storage/', $path);
    }

    $updated = $user->update($validated);

    return response()->json([
        'message' => 'User updated successfully',
        'data' => $user->fresh()
    ]);
}

    /**
     * Display the specified resource.
     */
    public function show(User $user): JsonResponse
    {
        $user->load([
            'posts',
            'comments',
            'reviews',
            'contactRequestsSent',
            'contactRequestsReceived',
            'personalityType' 
        ]);
        
        return response()->json([
            'data' => $user
        ]);
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }

    /**
     * Update the authenticated user's profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = auth()->user();
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'sometimes|string|min:8|confirmed',
            'avatar' => 'nullable|string|url',
            'bio' => 'nullable|string|max:500',
            'linkedin_url' => 'nullable|url|max:255',
            'phone' => 'nullable|string|max:20',
            'personality_type_id' => 'nullable|exists:personality_types,id', // Changed
            'recommended_major' => 'nullable|string|max:100',
            'message_preference' => ['nullable', Rule::in(['open', 'approval_required'])]
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => $user->fresh()
        ]);
    }

    /**
 * Get user's saved items
 */
public function savedItems(User $user): JsonResponse
{
    $savedItems = $user->savedItems()
        ->with(['itemable']) // Assuming polymorphic relationship
        ->latest();

    return response()->json([
        'data' => $savedItems
    ]);
}

/**
 * Get user's posts
 */
public function posts(User $user): JsonResponse
{
    $posts = $user->posts()
        ->with(['user', 'comments'])
        ->withCount('comments')
        ->orderBy('created_at', 'desc')
        ->get(); // Add get() to execute the query

    return response()->json([
        'data' => $posts
    ]);
}
public function getByPersonality($personalityTypeId): JsonResponse
    {
        $users = User::with('personalityType')
            ->where('personality_type_id', $personalityTypeId)
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Update user's personality type (Admin only)
     */
    public function updatePersonality(Request $request, User $user): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'personality_type_id' => 'required|exists:personality_types,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update(['personality_type_id' => $request->personality_type_id]);

        return response()->json([
            'success' => true,
            'message' => 'Personality type updated successfully',
            'data' => $user->load('personalityType')
        ]);
    }
}