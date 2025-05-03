<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
        'password' => ['required', 'confirmed', Rules\Password::defaults()],
        'avatar' => 'nullable|string|url',
        'bio' => 'nullable|string|max:500',
        'linkedin_url' => 'nullable|url|max:255',
        'phone' => 'nullable|string|max:20',
    ]);

    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
        'avatar' => $request->avatar,
        'bio' => $request->bio,
        'linkedin_url' => $request->linkedin_url,
        'phone' => $request->phone,
    ]);

    // Create token with abilities
    $token = $user->createToken('auth_token', ['*'])->plainTextToken;

    return response()->json([
        'message' => 'User registered successfully',
        'access_token' => $token,
        'user' => $user
    ], 201);
}

    /**
     * Login user and create token
     */
    /**
 * Login user and create token
 */
public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::withTrashed()->where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'No account found with this email'], 404);
        }

        // Check banned status
        if ($user->status === 'banned') {
            return response()->json([
                'message' => 'This account has been permanently banned and cannot be reactivated.'
            ], 403);
        }

        // Check inactive status
        if ($user->status === 'inactive') {
            $daysUntilBan = 30 - now()->diffInDays($user->updated_at);
            return response()->json([
                'message' => 'Account is inactive. You have ' . $daysUntilBan . ' days to reactivate before permanent ban.',
                'days_remaining' => $daysUntilBan
            ], 403);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = $request->user();
        $token = $user->createToken('auth_token')->plainTextToken;

        // Update user status and timestamps
        $user->update([
            'status' => 'active',
            'login_status' => 'online',
            'last_login_at' => now(),
            'last_logout_at' => null
        ]);

        return response()->json([
            'access_token' => $token,
            'user' => $user
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        
        $user->update([
            'login_status' => 'offline',
            'last_logout_at' => now()
        ]);
        
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }

    /**
     * Get the authenticated User
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ]);
    }

    /**
 * Change the authenticated user's password
 */
public function changePassword(Request $request)
{
    $request->validate([
        'current_password' => 'required|string',
        'new_password' => ['required', 'confirmed', Rules\Password::defaults()],
    ]);

    $user = $request->user();

    // Verify current password
    if (!Hash::check($request->current_password, $user->password)) {
        return response()->json([
            'message' => 'Current password is incorrect'
        ], 422);
    }

    // Update password
    $user->update([
        'password' => Hash::make($request->new_password)
    ]);

    // Revoke all tokens (optional but recommended for security)
    $user->tokens()->delete();

    return response()->json([
        'message' => 'Password changed successfully'
    ]);
}

/**
 * Send password reset link
 */
public function forgotPassword(Request $request)
{
    $request->validate(['email' => 'required|email']);

    // We will send the password reset link to this user. Once we have attempted
    // to send the link, we will examine the response then see the message we
    // need to show to the user. Finally, we'll send out a proper response.
    $status = Password::sendResetLink(
        $request->only('email')
    );

    return $status === Password::RESET_LINK_SENT
        ? response()->json(['message' => __($status)])
        : response()->json(['message' => __($status)], 422);
}

/**
 * Reset password
 */
public function resetPassword(Request $request)
{
    $request->validate([
        'token' => 'required',
        'email' => 'required|email',
        'password' => ['required', 'confirmed', Rules\Password::defaults()],
    ]);

    // Here we will attempt to reset the user's password. If it is successful we
    // will update the password on an actual user model and persist it to the
    // database. Otherwise we will parse the error and return the response.
    $status = Password::reset(
        $request->only('email', 'password', 'password_confirmation', 'token'),
        function ($user, $password) {
            $user->forceFill([
                'password' => Hash::make($password)
            ])->setRememberToken(Str::random(60));

            $user->save();

            // Revoke all tokens when password is reset
            $user->tokens()->delete();
        }
    );

    return $status === Password::PASSWORD_RESET
        ? response()->json(['message' => __($status)])
        : response()->json(['message' => __($status)], 422);
}

/**
 * Deactivate user account (marks for future deletion)
 */
/**
 * Deactivate user account (soft delete)
 */
public function deactivateAccount(Request $request)
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        $user = $request->user();

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Password is incorrect'], 401);
        }

        DB::transaction(function () use ($user) {
            $user->update([
                'status' => 'inactive',
                'login_status' => 'offline',
                'deactivated_at' => now()
            ]);
            
            $user->tokens()->delete();
        });

        // Schedule automatic ban after 30 days
        $banDate = now()->addDays(30)->format('Y-m-d H:i:s');
        
        return response()->json([
            'message' => 'Account deactivated successfully. It will be permanently banned after ' . $banDate . ' if not reactivated.',
            'ban_date' => $banDate
        ]);
    }

    public function reactivateAccount(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'No account found with this email'], 404);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Incorrect password'], 401);
        }

        if ($user->status === 'banned') {
            return response()->json([
                'message' => 'This account has been permanently banned and cannot be reactivated.'
            ], 403);
        }

        if ($user->status !== 'inactive') {
            return response()->json([
                'message' => 'Account is already active'
            ], 400);
        }

        DB::transaction(function () use ($user) {
            $user->update([
                'status' => 'active',
                'login_status' => 'online',
                'deactivated_at' => null
            ]);
        });

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Account reactivated successfully',
            'access_token' => $token,
            'user' => $user->fresh()
        ]);
    }

    
}