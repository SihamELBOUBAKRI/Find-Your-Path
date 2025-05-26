<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Mail\PasswordResetMail;
use Illuminate\Validation\Rules;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;

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
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Changed to accept image files
            'bio' => 'nullable|string|max:500',
            'linkedin_url' => 'nullable|url|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'bio' => $request->bio,
            'linkedin_url' => $request->linkedin_url,
            'phone' => $request->phone,
        ];

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('public/avatars');
            $userData['avatar'] = str_replace('public/', 'storage/', $path);
        }

        $user = User::create($userData);

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

    $user = User::where('email', $request->email)->first();

    if (!$user) {
        return response()->json(['message' => 'If this email exists, a reset link has been sent']);
    }

    $token = Password::createToken($user);
    $resetUrl = env('FRONTEND_URL') . '/reset-password/' . $token . '?email=' . urlencode($user->email);

    Mail::to($user->email)->send(new PasswordResetMail($resetUrl));

    return response()->json(['message' => 'Password reset link sent']);
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

    $status = Password::reset(
        $request->only('email', 'password', 'password_confirmation', 'token'),
        function ($user, $password) {
            $user->forceFill([
                'password' => Hash::make($password)
            ])->setRememberToken(Str::random(60));

            $user->save();
            event(new PasswordReset($user));
        }
    );

    if ($status == Password::PASSWORD_RESET) {
        if ($request->wantsJson()) {
            return response()->json([
                'message' => __($status),
                'redirect_url' => env('FRONTEND_LOGIN_URL') // Add this
            ]);
        }
        
        // Redirect to React login page
        return redirect(env('FRONTEND_LOGIN_URL') . '?reset_success=true');
    } else {
        if ($request->wantsJson()) {
            return response()->json(['message' => __($status)], 422);
        }
        
        return back()->withErrors(['email' => __($status)]);
    }
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